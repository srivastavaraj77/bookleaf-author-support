export type Role = 'admin' | 'author';

export type TicketCategory =
  | 'Royalty & Payments'
  | 'ISBN & Metadata Issues'
  | 'Printing & Quality'
  | 'Distribution & Availability'
  | 'Book Status & Production Updates'
  | 'General Inquiry';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  author_id?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: Role;
  user_id: number;
  author_id?: string;
  name: string;
  email: string;
}

export interface Book {
  id: number;
  book_id: string;
  author_id: string;
  title: string;
  isbn?: string | null;
  genre?: string | null;
  publication_date?: string | null;
  status: string;
  mrp?: number | null;
  author_royalty_per_copy?: number | null;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  last_royalty_payout_date?: string | null;
  print_partner?: string | null;
  available_on: string[];
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_role: 'author' | 'admin' | 'system';
  sender_name: string;
  sender_email?: string | null;
  message: string;
  created_at: string;
}

export interface InternalNote {
  id: number;
  ticket_id: number;
  admin_id?: number | null;
  admin_name: string;
  note: string;
  created_at: string;
}

export interface AIDraft {
  id: number;
  ticket_id: number;
  draft_content: string;
  provider: string;
  model_name: string;
  estimated_tokens: number;
  was_edited: boolean;
  final_sent_content?: string | null;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  author_id: string;
  author_name?: string;
  author_email?: string;
  book_id?: string | null;
  book_title?: string | null;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  ai_category?: string | null;
  ai_priority?: string | null;
  ai_confidence?: number | null;
  ai_reasoning?: string | null;
  ai_processing_status: 'success' | 'fallback' | 'failed' | 'pending';
  ai_provider?: string | null;
  assigned_admin_id?: number | null;
  assigned_admin_name?: string | null;
  attachment_filename?: string | null;
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
  latest_message?: TicketMessage | null;
}

export interface TicketAdminDetail extends Ticket {
  internal_notes: InternalNote[];
  ai_drafts: AIDraft[];
  book_details?: Book | null;
  author_details?: {
    author_id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    joined_date?: string;
  } | null;
}

export interface AuthorDashboardStats {
  author_id: string;
  author_name: string;
  total_books: number;
  published_books: number;
  books_in_production: number;
  total_copies_sold: number;
  total_royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
  open_tickets_count: number;
  recent_tickets_count: number;
}

export interface CategoryVolume {
  category: string;
  count: number;
}

export interface OldestUnresolvedTicket {
  id: number;
  ticket_number: string;
  subject: string;
  author_name: string;
  priority: TicketPriority;
  status: TicketStatus;
  age_hours: number;
  created_at: string;
}

export interface AdminDashboardStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  critical_tickets: number;
  high_priority_tickets: number;
  category_volume: CategoryVolume[];
  oldest_unresolved: OldestUnresolvedTicket[];
  recent_tickets: Ticket[];
}

