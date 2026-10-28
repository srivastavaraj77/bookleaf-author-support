import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  MessageSquare,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { useRealtime } from '../../hooks/useRealtime';

export const AdminTicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const numericId = parseInt(ticketId || '0', 10);

  // Local form states
  const [replyText, setReplyText] = useState('');
  const [replyStatusChange, setReplyStatusChange] = useState<string>('In Progress');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [overrideCategory, setOverrideCategory] = useState<TicketCategory | ''>('');
  const [overridePriority, setOverridePriority] = useState<TicketPriority | ''>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Real-time synchronization
  useRealtime(() => {
    queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
  });

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['adminTicket', numericId],
    queryFn: () => api.getAdminTicketDetail(numericId),
    enabled: !!numericId,
  });

  // Mutations
  const overrideMutation = useMutation({
    mutationFn: (payload: { category?: TicketCategory; priority?: TicketPriority }) =>
      api.overrideClassification(numericId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
      setNotification('Classification and priority overrides saved.');
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => api.updateTicketStatus(numericId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setNotification('Ticket status updated.');
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const assignSelfMutation = useMutation({
    mutationFn: () => api.assignTicket(numericId, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
      setNotification('Ticket assigned to your operations profile.');
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const noteMutation = useMutation({
    mutationFn: (note: string) => api.addInternalNote(numericId, note),
    onSuccess: () => {
      setInternalNoteText('');
      queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
      setNotification('Internal private note added.');
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const regenerateDraftMutation = useMutation({
    mutationFn: () => api.generateAIDraft(numericId, true),
    onSuccess: (newDraft) => {
      queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
      setReplyText(newDraft.draft_content);
      setNotification('Fresh AI draft generated based on BookLeaf Knowledge Base.');
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: () =>
      api.sendAdminReply(numericId, {
        message: replyText.trim(),
        status_change: replyStatusChange,
        draft_id: ticket?.ai_drafts?.[0]?.id,
      }),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['adminTicket', numericId] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setNotification('Official reply dispatched & author notified via SSE.');
      setTimeout(() => setNotification(null), 3000);
    },
  });

  // Prepopulate reply box with latest AI draft if empty
  const latestDraft = ticket?.ai_drafts?.[0];

  const handleUseDraftInEditor = () => {
    if (latestDraft) {
      setReplyText(latestDraft.draft_content);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-24 bg-white rounded-xl border border-stone-200/90" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-xl border border-stone-200/90" />
          <div className="lg:col-span-2 h-96 bg-white rounded-xl border border-stone-200/90" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-stone-200/90 max-w-md mx-auto shadow-2xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-serif font-bold text-ink-950">Ticket Not Found</h3>
        <button
          onClick={() => navigate('/admin/tickets')}
          className="mt-4 px-4 py-2 bg-ink-950 text-white rounded-lg text-xs font-semibold hover:bg-ink-900 shadow-2xs border border-ink-800"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const formatCurrency = (val?: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const categories: TicketCategory[] = [
    'Royalty & Payments',
    'ISBN & Metadata Issues',
    'Printing & Quality',
    'Distribution & Availability',
    'Book Status & Production Updates',
    'General Inquiry',
  ];

  const priorities: TicketPriority[] = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-3 bg-teal-800 text-white text-xs font-medium rounded-xl shadow-2xs text-center animate-in slide-in-from-top duration-200 flex items-center justify-center gap-1.5 font-sans">
          <CheckCircle2 className="w-4 h-4 text-brass-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation and Ticket Header */}
      <div>
        <button
          onClick={() => navigate('/admin/tickets')}
          className="text-xs font-semibold text-stone-500 hover:text-ink-950 flex items-center space-x-1.5 transition-colors mb-3 group font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Operations Queue</span>
        </button>

        <div className="bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-bold text-ink-950 bg-stone-100 px-2.5 py-1 rounded border border-stone-200/70">
                {ticket.ticket_number}
              </span>
              <Badge variant="category" value={ticket.category}>
                {ticket.category}
              </Badge>
              <Badge variant="priority" value={ticket.priority}>
                {ticket.priority} Priority
              </Badge>
              <Badge variant="status" value={ticket.status}>
                {ticket.status}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink-950 mt-1">
              {ticket.subject}
            </h1>
            <p className="text-xs text-stone-500 flex items-center space-x-2 font-sans flex-wrap gap-y-1">
              <span>Author: <strong className="text-stone-800">{ticket.author_name}</strong> ({ticket.author_id})</span>
              <span>&bull;</span>
              <span>Created {new Date(ticket.created_at).toLocaleString()}</span>
            </p>
          </div>

          {/* Assignment & Quick Status Action */}
          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
            {ticket.assigned_admin_name ? (
              <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 font-mono font-medium">
                Assigned: {ticket.assigned_admin_name}
              </span>
            ) : (
              <button
                onClick={() => assignSelfMutation.mutate()}
                disabled={assignSelfMutation.isPending}
                className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign to Me</span>
              </button>
            )}

            {/* Quick Status Selector */}
            <select
              value={ticket.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-stone-300 bg-white text-stone-800 shadow-2xs focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="Open">Status: Open</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Resolved">Status: Resolved</option>
              <option value="Closed">Status: Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Left Column Context (Author & Book) | Right Column Operations & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Author Context, Book Record, AI Classification Box */}
        <div className="space-y-6">
          {/* AI Classification & Override Box */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brass-500" />
                <h3 className="font-serif font-bold text-ink-950 text-sm">AI Classification Inspector</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/70">
                {ticket.ai_provider || 'dev-mock'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-stone-50/70 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">
                  AI Classified Category
                </span>
                <span className="font-semibold text-ink-950 mt-0.5 block font-sans">
                  {ticket.ai_category || ticket.category}
                </span>
                {ticket.ai_confidence && (
                  <span className="text-[10px] text-stone-500 font-mono mt-1 block">
                    Model Confidence: {Math.round(ticket.ai_confidence * 100)}%
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-stone-50/70 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">
                  AI Priority Score
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-ink-950 font-sans">
                    {ticket.ai_priority || ticket.priority}
                  </span>
                  <Badge variant="priority" value={ticket.ai_priority || ticket.priority} size="sm">
                    {ticket.ai_priority || ticket.priority}
                  </Badge>
                </div>
              </div>

              {ticket.ai_reasoning && (
                <div className="p-3 rounded-lg bg-stone-50/80 border border-stone-200/70 text-stone-600 italic text-[11px] leading-relaxed font-sans">
                  "{ticket.ai_reasoning}"
                </div>
              )}
            </div>

            {/* Admin Override Controls */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-semibold text-stone-700 block uppercase tracking-wider font-mono">
                Admin Manual Override
              </span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={overrideCategory || ticket.category}
                  onChange={(e) => {
                    const val = e.target.value as TicketCategory;
                    setOverrideCategory(val);
                    overrideMutation.mutate({ category: val });
                  }}
                  className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-200 bg-white font-medium text-stone-700 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={overridePriority || ticket.priority}
                  onChange={(e) => {
                    const val = e.target.value as TicketPriority;
                    setOverridePriority(val);
                    overrideMutation.mutate({ priority: val });
                  }}
                  className="w-full text-xs py-1.5 px-2 rounded-lg border border-stone-200 bg-white font-medium text-stone-700 focus:outline-none"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Author Details Card */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-ink-950 text-sm pb-2.5 border-b border-stone-100 flex items-center justify-between">
              <span>Author Account Profile</span>
              <User className="w-4 h-4 text-stone-400" />
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Name</span>
                <span className="font-semibold text-ink-950">{ticket.author_details?.name || ticket.author_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Author ID</span>
                <span className="font-mono text-stone-800">{ticket.author_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Email</span>
                <span className="font-mono text-stone-800 truncate max-w-[170px]">{ticket.author_details?.email || ticket.author_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500">Phone</span>
                <span className="font-mono text-stone-800">{ticket.author_details?.phone || 'Not linked'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">City / Joined</span>
                <span className="text-stone-800">
                  {ticket.author_details?.city || 'India'} &bull; {ticket.author_details?.joined_date}
                </span>
              </div>
            </div>
          </div>

          {/* Book Details & Royalty Audit Card */}
          {ticket.book_details ? (
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs space-y-3">
              <h3 className="font-serif font-bold text-ink-950 text-sm pb-2.5 border-b border-stone-100 flex items-center justify-between">
                <span>Associated Catalog Record</span>
                <BookOpen className="w-4 h-4 text-stone-400" />
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono">{ticket.book_details.book_id}</span>
                  <h4 className="font-serif font-bold text-ink-950 text-sm leading-tight mt-0.5">
                    {ticket.book_details.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    ISBN: <strong className="font-mono">{ticket.book_details.isbn || 'Pending'}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">Status</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block">{ticket.book_details.status}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">MRP</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block tabular-nums">{formatCurrency(ticket.book_details.mrp)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-mono">Total Sold</span>
                    <span className="font-semibold text-stone-800 mt-0.5 block tabular-nums">{ticket.book_details.total_copies_sold} copies</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-brass-50 border border-brass-200/70">
                    <span className="text-[10px] text-brass-800 uppercase tracking-wider block font-mono">Pending Royalty</span>
                    <span className="font-bold text-brass-900 mt-0.5 block tabular-nums">{formatCurrency(ticket.book_details.royalty_pending)}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-stone-500 space-y-1 font-mono">
                  <div>Last payout: {ticket.book_details.last_royalty_payout_date || 'None'}</div>
                  {ticket.book_details.print_partner && (
                    <div>Print Partner: <strong className="text-stone-700 font-sans">{ticket.book_details.print_partner}</strong></div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs text-xs text-stone-500">
              <span className="font-semibold text-ink-950 block mb-1">Account-Level Inquiry</span>
              No individual book title was linked by author.
            </div>
          )}

          {/* File Attachment Card if attached */}
          {ticket.attachment_url && (
            <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-2xs space-y-2">
              <h3 className="font-serif font-bold text-ink-950 text-sm pb-2 border-b border-stone-100 flex items-center justify-between">
                <span>Author Attachment</span>
                <FileText className="w-4 h-4 text-stone-400" />
              </h3>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-medium text-stone-800 truncate mr-2">
                  {ticket.attachment_filename || 'Attachment File'}
                </span>
                <a
                  href={ticket.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-800 hover:text-teal-950 font-semibold shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View</span>
                </a>
              </div>
            </div>
          )}

          {/* Private Internal Notes Panel (Strictly Admin Only) */}
          <div className="bg-brass-50/70 rounded-xl p-5 sm:p-6 border border-brass-200/90 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 text-brass-950 pb-2.5 border-b border-brass-200/80">
              <Lock className="w-4 h-4 text-brass-700" />
              <h3 className="font-serif font-bold text-sm">Private Operations Notes</h3>
            </div>
            <p className="text-[11px] text-brass-800 font-sans">
              🔒 Strictly internal. Never sent to or visible by authors.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {!ticket.internal_notes || ticket.internal_notes.length === 0 ? (
                <p className="text-[11px] italic text-stone-400 font-sans">No internal notes added yet.</p>
              ) : (
                ticket.internal_notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-white border border-brass-200/80 text-xs shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1 font-mono">
                      <span className="font-semibold text-stone-800">{note.admin_name}</span>
                      <span>{new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-stone-800 whitespace-pre-wrap font-sans">{note.note}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!internalNoteText.trim()) return;
                noteMutation.mutate(internalNoteText.trim());
              }}
              className="space-y-2 pt-2"
            >
              <textarea
                rows={2}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                placeholder="Add confidential note (e.g. Finance check status, reprint dispatched, Amazon case #)..."
                className="w-full text-xs p-3 rounded-lg border border-brass-300 focus:ring-2 focus:ring-brass-500 bg-white placeholder-stone-400 resize-none shadow-2xs"
              />
              <button
                type="submit"
                disabled={noteMutation.isPending || !internalNoteText.trim()}
                className="w-full py-2 bg-brass-800 hover:bg-brass-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
              >
                Add Internal Note
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Draft Generation + Official Reply Composer + Conversation Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI-Drafted Response Panel */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-brass-50 border border-brass-200/70 text-brass-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink-950 text-base">
                    AI-Drafted Response & Policy Copilot
                  </h3>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Context-aware draft grounded in BookLeaf Knowledge Base, author sales & policies
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => regenerateDraftMutation.mutate()}
                  disabled={regenerateDraftMutation.isPending}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regenerateDraftMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseDraftInEditor}
                  className="px-3.5 py-1.5 rounded-lg bg-ink-950 hover:bg-ink-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs border border-ink-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brass-400" />
                  <span>Use in Editor</span>
                </button>
              </div>
            </div>

            {latestDraft ? (
              <div className="space-y-3">
                <div className="p-4 sm:p-5 bg-stone-50/80 rounded-xl border border-stone-200/70 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {latestDraft.draft_content}
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>Model: {latestDraft.model_name} &bull; Provider: {latestDraft.provider}</span>
                  <span>Tokens: ~{latestDraft.estimated_tokens}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-400 font-sans">
                Click "Regenerate" to produce an AI response based on BookLeaf policies.
              </div>
            )}
          </div>

          {/* Official Reply Composer */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <h3 className="font-serif font-bold text-ink-950 text-base">
                Send Official Response to Author
              </h3>
              <span className="text-[11px] text-stone-400 font-mono">
                Admin Review & Approval Required
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                sendReplyMutation.mutate();
              }}
              className="space-y-3.5"
            >
              <textarea
                rows={6}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Review, edit, and tailor your official response to the author..."
                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-sans leading-relaxed text-ink-950 bg-white placeholder-stone-400 shadow-2xs"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <span className="text-xs text-stone-500 font-medium">Update status to:</span>
                  <select
                    value={replyStatusChange}
                    onChange={(e) => setReplyStatusChange(e.target.value)}
                    className="text-xs py-2 px-3 rounded-lg border border-stone-200 bg-white text-stone-800 font-medium"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendReplyMutation.isPending || !replyText.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-ink-950 hover:bg-ink-900 text-white rounded-lg text-xs font-semibold shadow-2xs border border-ink-800 flex items-center justify-center space-x-2 transition-all duration-150 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5 text-brass-400" />
                  <span>Send Response to Author</span>
                </button>
              </div>
            </form>
          </div>

          {/* Full Conversation History */}
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-ink-950 text-base pb-3 border-b border-stone-100 flex items-center justify-between">
              <span>Public Conversation Thread</span>
              <MessageSquare className="w-4 h-4 text-stone-400" />
            </h3>

            <div className="space-y-4">
              {ticket.messages.map((m) => {
                const isAuthor = m.sender_role === 'author';
                const isSystem = m.sender_role === 'system';

                if (isSystem) {
                  return (
                    <div key={m.id} className="text-center my-3">
                      <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-mono border border-stone-200 shadow-2xs">
                        {m.message}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl text-xs sm:text-sm border ${
                      isAuthor
                        ? 'bg-stone-50/80 border-stone-200/80'
                        : 'bg-teal-50/60 border-teal-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-ink-950">
                        {m.sender_name}{' '}
                        <span className="text-[10px] font-mono text-stone-400">
                          ({m.sender_role})
                        </span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-stone-800 font-sans">
                      {m.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};