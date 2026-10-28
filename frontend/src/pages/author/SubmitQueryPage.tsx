import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck,
  FileText,
  HelpCircle,
  Paperclip,
  Printer,
  Radio,
  Send,
  Shield,
  Sparkles,
  Store,
  Upload,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

export const SubmitQueryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [bookId, setBookId] = useState<string>('general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch author's books for the selector
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['authorBooksList'],
    queryFn: () => api.getAuthorBooks(),
  });

  useEffect(() => {
    const prefillBookId = searchParams.get('book_id');
    if (prefillBookId) {
      setBookId(prefillBookId);
    }
  }, [searchParams]);

  // Query templates for quick author convenience
  const templates = [
    {
      label: 'Royalty Inquiry',
      icon: Coins,
      subject: 'Royalty payout inquiry for my title',
      desc: 'I noticed pending royalties in my author dashboard from the previous quarter. Could you please confirm if this payment has been initiated to my linked bank account?',
      badge: 'Finance',
    },
    {
      label: 'ISBN Discrepancy',
      icon: BookOpen,
      subject: 'Incorrect or mismatching ISBN listed on marketplace',
      desc: 'Readers are reporting that the ISBN shown on Amazon India does not match the physical ISBN barcode on the back of my printed copies. Please escalate to the production team.',
      badge: 'Catalog',
    },
    {
      label: 'Print Quality Issue',
      icon: Printer,
      subject: 'Defective print copies received with misalignment',
      desc: 'I received my author copies today and noticed severe misalignments in the page trimming and blurry cover text. I am attaching photographs for your verification to arrange a reprint.',
      badge: 'Manufacturing',
    },
    {
      label: 'Stock Availability',
      icon: Store,
      subject: 'Book showing as Currently Unavailable on Amazon',
      desc: 'My published title is displaying "Currently Unavailable" on Amazon India even though the listing was live. Could we trigger an electronic stock re-sync with the distribution team?',
      badge: 'Distribution',
    },
  ];

  const applyTemplate = (t: { subject: string; desc: string }) => {
    setSubject(t.subject);
    setDescription(t.desc);
    setError(null);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      let attachmentUrl = null;
      let attachmentFilename = null;

      if (attachment) {
        setUploadProgress(true);
        const uploadResult = await api.uploadAttachment(attachment);
        attachmentUrl = uploadResult.file_url;
        attachmentFilename = uploadResult.filename;
        setUploadProgress(false);
      }

      const ticketPayload = {
        book_id: bookId === 'general' ? null : bookId,
        subject: subject.trim(),
        description: description.trim(),
      };

      return api.createTicket(ticketPayload);
    },
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['myRecentTickets'] });
      queryClient.invalidateQueries({ queryKey: ['authorDashboard'] });
      navigate(`/author/tickets/${newTicket.id}`);
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to submit query. Please check your inputs.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 3) {
      setError('Please provide a subject line with at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }
    setError(null);
    submitMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="pb-2 border-b border-stone-200/80">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-teal-800 uppercase tracking-widest">
          <HelpCircle className="w-4 h-4 text-brass-500" />
          <span>Direct Author Support Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950 mt-1 tracking-tight">
          Submit an Author Support Query
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans leading-relaxed">
          Our automated dispatch system immediately classifies your query and links your sales & production context for the support desk.
        </p>
      </div>

      {/* Query Topic Templates */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-ink-950 font-serif">
            <Sparkles className="w-3.5 h-3.5 text-brass-500" />
            <span>Select a Common Topic Template (1-Click Autofill):</span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">Optional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {templates.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(t)}
                className="p-3 rounded-lg bg-stone-50/70 hover:bg-teal-50/50 border border-stone-200/80 hover:border-teal-400 text-left transition-all duration-150 flex items-start space-x-2.5 group"
              >
                <div className="w-7 h-7 rounded-md bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-0.5 text-teal-800 group-hover:border-teal-400 shadow-2xs">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-950 group-hover:text-teal-950">
                      {t.label}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-white text-stone-500 border border-stone-200">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-sans">
                    {t.subject}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-5"
      >
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start space-x-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium font-sans">{error}</span>
          </div>
        )}

        {/* Book Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-mono">
            Related Book
          </label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            disabled={booksLoading}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white text-ink-950 transition-colors"
          >
            <option value="general">General / Account Level (Not Book Specific)</option>
            {books?.map((b) => (
              <option key={b.book_id} value={b.book_id}>
                {b.book_id} &mdash; {b.title} ({b.status})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-stone-400 font-sans">
            Selecting your specific title allows our support desk and AI to pull live sales and distribution records immediately.
          </p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-mono">
            Subject Line
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Incomplete royalty calculation or missing author copies"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white placeholder-stone-400 text-ink-950 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono">
              Detailed Query Description
            </label>
            <span className="text-[11px] text-stone-400 tabular-nums font-mono">
              {description.length} characters
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail your question, including relevant dates, platforms (Amazon, Flipkart, etc.), or specific concerns so we can investigate accurately..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 bg-white placeholder-stone-400 text-ink-950 font-sans transition-colors leading-relaxed"
          />
        </div>

        {/* Optional Attachment */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-mono">
            Optional File Attachment
          </label>
          <div className="border-2 border-dashed border-stone-200 hover:border-teal-400 rounded-xl p-4 sm:p-5 text-center transition-colors bg-stone-50/30">
            {attachment ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200 shadow-2xs">
                <div className="flex items-center space-x-2.5 text-xs text-stone-700 truncate">
                  <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left truncate">
                    <p className="font-semibold text-ink-950 truncate">{attachment.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {Math.round(attachment.size / 1024)} KB &bull; Attached
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                <label className="cursor-pointer text-xs font-semibold text-teal-800 hover:text-teal-950 transition-colors">
                  <span>Click to browse files</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachment(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-stone-400 mt-1 font-sans">
                  JPG, PNG, PDF up to 5MB (Useful for book defect photos, bank statements, or barcode scans)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button & SLA note */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-[11px] text-stone-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            <span>Guaranteed First Response SLA: &lt; 24h</span>
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending || uploadProgress}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-ink-950 hover:bg-ink-900 text-white font-semibold text-sm shadow-2xs border border-ink-800 transition-all duration-150 disabled:opacity-50"
          >
            {submitMutation.isPending || uploadProgress ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting to Dispatch Queue...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-brass-400" />
                <span>Submit Support Query</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};