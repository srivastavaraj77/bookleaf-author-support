import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { useRealtime } from '../../hooks/useRealtime';

export const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const numericId = parseInt(ticketId || '0', 10);

  // Subscribe to real-time events for this ticket
  useRealtime(() => {
    queryClient.invalidateQueries({ queryKey: ['ticket', numericId] });
  });

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', numericId],
    queryFn: () => api.getTicketDetail(numericId),
    enabled: !!numericId,
    refetchInterval: 10000, // Short polling fallback every 10s if SSE is blocked
  });

  const replyMutation = useMutation({
    mutationFn: (msg: string) => api.postAuthorMessage(numericId, msg),
    onSuccess: () => {
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket', numericId] });
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to send message.');
    },
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setError(null);
    replyMutation.mutate(replyMessage.trim());
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-white rounded-2xl border border-slate-200" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-serif font-bold text-slate-900">Ticket Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This ticket may not exist or does not belong to your author profile.
        </p>
        <button
          onClick={() => navigate('/author/tickets')}
          className="mt-4 px-4 py-2 bg-leaf-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and Header */}
      <div>
        <button
          onClick={() => navigate('/author/tickets')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </button>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {ticket.ticket_number}
              </span>
              <Badge variant="category" value={ticket.category}>
                {ticket.category}
              </Badge>
              <Badge variant="priority" value={ticket.priority}>
                {ticket.priority} Priority
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-tight">
              {ticket.subject}
            </h1>
            <p className="text-xs text-slate-500 flex items-center space-x-2">
              <span>Related Title: <strong>{ticket.book_title || 'General / Account Level'}</strong></span>
              <span>&bull;</span>
              <span>Opened {new Date(ticket.created_at).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
            <Badge variant="status" value={ticket.status} size="md">
              {ticket.status}
            </Badge>
            <span className="text-[11px] text-slate-400 mt-1">
              {ticket.assigned_admin_name ? `Assigned: ${ticket.assigned_admin_name}` : 'Routed to Operations Desk'}
            </span>
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-leaf-700" />
            Official Support Conversation History
          </span>
          <span className="text-[11px]">End-to-End Logged & Encrypted</span>
        </div>

        {/* Messages List */}
        <div className="p-6 space-y-6 min-h-[300px]">
          {ticket.messages.map((msg) => {
            const isAuthor = msg.sender_role === 'author';
            const isSystem = msg.sender_role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-4">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-mono border border-slate-200">
                    ℹ️ {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAuthor ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-xs font-semibold text-slate-800">
                    {msg.sender_name}
                  </span>
                  {!isAuthor && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded border border-indigo-200">
                      BookLeaf Team
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    isAuthor
                      ? 'bg-leaf-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'Closed' ? (
          <form onSubmit={handleSendReply} className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
            {error && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {error}
              </div>
            )}
            <div className="relative">
              <textarea
                rows={3}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the BookLeaf operations team..."
                className="w-full p-3.5 pr-24 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 text-sm bg-white placeholder-slate-400 text-slate-900 resize-none font-sans"
              />
              <button
                type="submit"
                disabled={replyMutation.isPending || !replyMessage.trim()}
                className="absolute right-3 bottom-4 px-4 py-2 bg-leaf-900 hover:bg-leaf-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 flex items-center space-x-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Your reply will immediately alert the assigned operations specialist.
            </p>
          </form>
        ) : (
          <div className="p-4 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-200">
            This ticket has been marked as <strong>Closed</strong>. Raising a new message will automatically reopen it.
          </div>
        )}
      </div>
    </div>
  );
};

