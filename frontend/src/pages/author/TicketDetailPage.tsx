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
  Download,
  FileText,
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
        <div className="h-28 bg-white rounded-3xl border border-stone-200/80" />
        <div className="h-96 bg-white rounded-3xl border border-stone-200/80" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-serif font-bold text-slate-900">Ticket Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This ticket may not exist or does not belong to your author profile.
        </p>
        <button
          onClick={() => navigate('/author/tickets')}
          className="mt-4 px-4 py-2 bg-leaf-900 text-white rounded-xl text-xs font-semibold hover:bg-leaf-800 transition-colors"
        >
          Return to Support History
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
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 transition-colors mb-3 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Inquiries</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-bold text-slate-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/60">
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
            <p className="text-xs text-slate-500 flex items-center space-x-2 flex-wrap gap-y-1">
              <span>Related Title: <strong className="text-slate-700">{ticket.book_title || 'General / Account Level'}</strong></span>
              <span>&bull;</span>
              <span>Opened {new Date(ticket.created_at).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
            <Badge variant="status" value={ticket.status} size="md">
              {ticket.status}
            </Badge>
            <span className="text-[11px] text-slate-400 mt-1 font-mono">
              {ticket.assigned_admin_name ? `Desk: ${ticket.assigned_admin_name}` : 'Routed to Operations Desk'}
            </span>
          </div>
        </div>
      </div>

      {/* Attachment info if attached */}
      {ticket.attachment_url && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-slate-700 truncate">
            <div className="w-8 h-8 rounded-lg bg-leaf-50 text-leaf-800 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-900 truncate">
                {ticket.attachment_filename || 'Attachment File'}
              </p>
              <p className="text-[10px] text-slate-400">Attached with query</p>
            </div>
          </div>
          <a
            href={ticket.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-leaf-800" />
            Official Support Conversation History
          </span>
          <span className="text-[11px] font-mono text-slate-400">End-to-End Logged & Verified</span>
        </div>

        {/* Messages List */}
        <div className="p-6 sm:p-7 space-y-6 min-h-[320px] bg-[#fdfcf9]">
          {ticket.messages.map((msg) => {
            const isAuthor = msg.sender_role === 'author';
            const isSystem = msg.sender_role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-4">
                  <span className="inline-block px-3 py-1 bg-stone-100 text-slate-600 rounded-full text-xs font-mono border border-stone-200">
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
                <div className="flex items-center space-x-2 mb-1.5 px-1">
                  <span className="text-xs font-semibold text-slate-800">
                    {msg.sender_name}
                  </span>
                  {!isAuthor && (
                    <span className="text-[10px] bg-leaf-50 text-leaf-900 font-semibold px-2 py-0.5 rounded-full border border-leaf-200">
                      BookLeaf Operations
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    isAuthor
                      ? 'bg-leaf-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-stone-200/90 rounded-tl-xs shadow-xs'
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
          <form onSubmit={handleSendReply} className="p-5 sm:p-6 bg-stone-50/70 border-t border-stone-200">
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
                className="w-full p-4 pr-24 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-leaf-600/20 focus:border-leaf-700 text-sm bg-white placeholder-slate-400 text-slate-900 resize-none font-sans shadow-2xs transition-colors"
              />
              <button
                type="submit"
                disabled={replyMutation.isPending || !replyMessage.trim()}
                className="absolute right-3.5 bottom-4 px-4 py-2 bg-leaf-900 hover:bg-leaf-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 flex items-center space-x-1.5"
              >
                {replyMutation.isPending ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Reply</span>
                    <Send className="w-3.5 h-3.5 text-amber-gold" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Your message is dispatched live to the Delhi operations desk.
            </p>
          </form>
        ) : (
          <div className="p-4 bg-stone-100 text-center text-xs text-slate-500 border-t border-stone-200 font-sans">
            This inquiry is currently marked as <strong>Closed</strong>. Sending a new message will automatically reopen it.
          </div>
        )}
      </div>
    </div>
  );
};
