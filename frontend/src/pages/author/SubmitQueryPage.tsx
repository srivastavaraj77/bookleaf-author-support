import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Paperclip,
  Send,
  Sparkles,
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
      subject: 'Royalty payout inquiry for my title',
      desc: 'I noticed pending royalties in my author dashboard from the previous quarter. Could you please confirm if this payment has been initiated to my linked bank account?',
    },
    {
      label: 'ISBN Discrepancy',
      subject: 'Incorrect or mismatching ISBN listed on marketplace',
      desc: 'Readers are reporting that the ISBN shown on Amazon India does not match the physical ISBN barcode on the back of my printed copies. Please escalate to the production team.',
    },
    {
      label: 'Print Quality Issue',
      subject: 'Defective print copies received with misalignment',
      desc: 'I received my author copies today and noticed severe misalignments in the page trimming and blurry cover text. I am attaching photographs for your verification to arrange a reprint.',
    },
    {
      label: 'Stock Availability',
      subject: 'Book showing as Currently Unavailable on Amazon',
      desc: 'My published title is displaying "Currently Unavailable" on Amazon India even though the listing was live. Could we trigger an electronic stock re-sync with the distribution team?',
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
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-leaf-800 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>BookLeaf Author Support</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
          Submit an Author Support Query
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
          Our automated dispatch system immediately classifies and routes your query to the appropriate Delhi operations team.
        </p>
      </div>

      {/* Query Topic Templates */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-gold" />
          <span>Quick Topic Templates:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-leaf-50 text-slate-700 hover:text-leaf-900 border border-slate-200 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Book Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Related Book
          </label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            disabled={booksLoading}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 bg-white text-slate-900"
          >
            <option value="general">General / Account Level (Not Book Specific)</option>
            {books?.map((b) => (
              <option key={b.book_id} value={b.book_id}>
                {b.book_id} &mdash; {b.title} ({b.status})
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Selecting your specific title allows our AI and support team to pull live distribution & royalty context automatically.
          </p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Subject Line
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Incomplete royalty calculation or missing author copies"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 bg-white placeholder-slate-400 text-slate-900"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Detailed Query Description
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail your question, including relevant dates, platforms (Amazon, Flipkart, etc.), or specific concerns so we can investigate accurately..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 bg-white placeholder-slate-400 text-slate-900 font-sans"
          />
        </div>

        {/* Optional Attachment */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Optional File Attachment
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-300 transition-colors">
            {attachment ? (
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 text-xs text-slate-700 truncate">
                  <FileText className="w-4 h-4 text-leaf-700 shrink-0" />
                  <span className="truncate">{attachment.name}</span>
                  <span className="text-[10px] text-slate-400">({Math.round(attachment.size / 1024)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <label className="cursor-pointer text-xs font-semibold text-leaf-800 hover:text-leaf-900">
                  <span>Upload a file</span>
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
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG, PDF up to 5MB (Useful for defective copy photos or statements)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Powered by BookLeaf Knowledge Base &bull; Delhi Press Operations
          </p>
          <button
            type="submit"
            disabled={submitMutation.isPending || uploadProgress}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-leaf-900 hover:bg-leaf-800 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
          >
            {submitMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Ticket...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-gold" />
                <span>Submit Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
