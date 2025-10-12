export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publication_year: number;
  publisher: string;
  language: string;
  pages: number;
  description: string;
  status: 'available' | 'borrowed' | 'reserved' | 'out_of_order';
  current_borrower_id: string;
  borrow_date: string;
  due_date: string;
  reserved_by_id: string;
  reservation_date: string;
  condition: 'good' | 'excellent' | 'damaged';
  location: string;
  acquisition_date: string;
}

export interface Account {
  id: string;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  membership_type: 'Premium' | 'Standard';
  join_date: string;
  expiry_date: string;
  status: 'active' | 'expired';
  max_books_allowed: number;
  current_books_borrowed: number;
  fines_owed: number;
  last_login: string;
}

export interface ReadingListBook extends Book {
  selectedDate: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  reservationDate: string;
  estimatedPickupDate: string;
  status: 'pending' | 'ready' | 'picked_up' | 'cancelled';
  notes?: string;
}

