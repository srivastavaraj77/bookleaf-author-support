import {
  AuthResponse,
  AuthorDashboardStats,
  AdminDashboardStats,
  Book,
  Ticket,
  TicketAdminDetail,
  TicketMessage,
  InternalNote,
  AIDraft,
  TicketCategory,
  TicketPriority,
} from '../types';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('bookleaf_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token and notify
    localStorage.removeItem('bookleaf_token');
    localStorage.removeItem('bookleaf_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=1';
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail || 'An unexpected error occurred';
    throw new ApiError(response.status, detail, data);
  }

  return data as T;
}

export const api = {
  // Authentication
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<any>('/auth/me'),

  // Author endpoints
  getAuthorDashboard: () => request<AuthorDashboardStats>('/authors/me/dashboard'),

  getAuthorBooks: (params?: { search?: string; status?: string; genre?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.genre) query.set('genre', params.genre);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Book[]>(`/books${qs}`);
  },

  getBookDetails: (bookId: string) => request<Book>(`/books/${bookId}`),

  // Ticket endpoints (Author)
  createTicket: (payload: { book_id?: string | null; subject: string; description: string }) =>
    request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyTickets: (status?: string) => {
    const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return request<Ticket[]>(`/tickets${qs}`);
  },

  getTicketDetail: (ticketId: number) => request<Ticket>(`/tickets/${ticketId}`),

  postAuthorMessage: (ticketId: number, message: string) =>
    request<TicketMessage>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ filename: string; stored_filename: string; file_url: string; size_bytes: number }>(
      '/tickets/upload',
      {
        method: 'POST',
        body: formData,
      }
    );
  },

  pollTicketUpdates: (ticketId: number, since?: string) => {
    const qs = since ? `?since=${encodeURIComponent(since)}` : '';
    return request<{
      ticket_id: number;
      status: string;
      category: string;
      priority: string;
      updated_at: string;
      new_messages: Array<{
        id: number;
        sender_role: string;
        sender_name: string;
        message: string;
        created_at: string;
      }>;
    }>(`/tickets/${ticketId}/updates${qs}`);
  },

  // Admin endpoints
  getAdminDashboard: () => request<AdminDashboardStats>('/admin/dashboard'),

  getAdminTicketQueue: (params?: {
    status?: string;
    category?: string;
    priority?: string;
    author_id?: string;
    book_id?: string;
    search?: string;
    sort_by?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params?.author_id && params.author_id !== 'all') query.set('author_id', params.author_id);
    if (params?.book_id && params.book_id !== 'all') query.set('book_id', params.book_id);
    if (params?.search) query.set('search', params.search);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Ticket[]>(`/admin/tickets${qs}`);
  },

  getAdminTicketDetail: (ticketId: number) => request<TicketAdminDetail>(`/admin/tickets/${ticketId}`),

  updateTicketStatus: (ticketId: number, status: string) =>
    request<{ message: string; status: string }>(`/admin/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  overrideClassification: (ticketId: number, payload: { category?: TicketCategory; priority?: TicketPriority }) =>
    request<{
      message: string;
      category: string;
      priority: string;
      ai_category?: string;
      ai_priority?: string;
    }>(`/admin/tickets/${ticketId}/override`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  assignTicket: (ticketId: number, payload: { admin_id?: number | null; admin_name?: string | null }) =>
    request<{ message: string; assigned_admin_id: number; assigned_admin_name: string }>(
      `/admin/tickets/${ticketId}/assign`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),


  addInternalNote: (ticketId: number, note: string) =>
    request<InternalNote>(`/admin/tickets/${ticketId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  sendAdminReply: (ticketId: number, payload: { message: string; status_change?: string; draft_id?: number }) =>
    request<{
      message: string;
      reply: { id: number; message: string; sender_name: string; created_at: string };
      ticket_status: string;
    }>(`/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  generateAIDraft: (ticketId: number, regenerate = true) =>
    request<AIDraft>(`/admin/tickets/${ticketId}/draft/generate?regenerate=${regenerate}`, {
      method: 'POST',
    }),
};
