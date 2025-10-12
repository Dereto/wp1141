import { Book, Account } from '../types';

export const loadBooks = async (): Promise<Book[]> => {
  try {
    const response = await fetch('/data/books.csv');
    const csvText = await response.text();
    return parseCSVToBooks(csvText);
  } catch (error) {
    console.error('Error loading books:', error);
    return [];
  }
};

export const loadAccounts = async (): Promise<Account[]> => {
  try {
    const response = await fetch('/data/accounts.csv');
    const csvText = await response.text();
    return parseCSVToAccounts(csvText);
  } catch (error) {
    console.error('Error loading accounts:', error);
    return [];
  }
};

const parseCSVToBooks = (csvText: string): Book[] => {
  const lines = csvText.trim().split('\n');
  // const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    return {
      id: values[0],
      title: values[1].replace(/"/g, ''),
      author: values[2].replace(/"/g, ''),
      isbn: values[3].replace(/"/g, ''),
      genre: values[4].replace(/"/g, ''),
      publication_year: parseInt(values[5]),
      publisher: values[6].replace(/"/g, ''),
      language: values[7].replace(/"/g, ''),
      pages: parseInt(values[8]),
      description: values[9].replace(/"/g, ''),
      status: values[10].replace(/"/g, '') as Book['status'],
      current_borrower_id: values[11].replace(/"/g, ''),
      borrow_date: values[12].replace(/"/g, ''),
      due_date: values[13].replace(/"/g, ''),
      reserved_by_id: values[14].replace(/"/g, ''),
      reservation_date: values[15].replace(/"/g, ''),
      condition: values[16].replace(/"/g, '') as Book['condition'],
      location: values[17].replace(/"/g, ''),
      acquisition_date: values[18].replace(/"/g, '')
    };
  });
};

const parseCSVToAccounts = (csvText: string): Account[] => {
  const lines = csvText.trim().split('\n');
  // const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    return {
      id: values[0].replace(/"/g, ''),
      username: values[1].replace(/"/g, ''),
      password: values[2].replace(/"/g, ''),
      email: values[3].replace(/"/g, ''),
      first_name: values[4].replace(/"/g, ''),
      last_name: values[5].replace(/"/g, ''),
      phone: values[6].replace(/"/g, ''),
      address: values[7].replace(/"/g, ''),
      city: values[8].replace(/"/g, ''),
      state: values[9].replace(/"/g, ''),
      zip_code: values[10].replace(/"/g, ''),
      membership_type: values[11].replace(/"/g, '') as Account['membership_type'],
      join_date: values[12].replace(/"/g, ''),
      expiry_date: values[13].replace(/"/g, ''),
      status: values[14].replace(/"/g, '') as Account['status'],
      max_books_allowed: parseInt(values[15]),
      current_books_borrowed: parseInt(values[16]),
      fines_owed: parseFloat(values[17]),
      last_login: values[18].replace(/"/g, '')
    };
  });
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};
