import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Box, Fab, Badge, Button } from '@mui/material';
import { Book, Account, ReadingListBook, Reservation } from './types';
import { loadBooks, loadAccounts } from './utils/dataLoader';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import BookBrowser from './components/BookBrowser';
// Removed ReadingList to consolidate into ReservationSubmission flow
import ReservationSubmission from './components/ReservationSubmission';
import { BookmarkBorder as BookmarkIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c5530', // Deep forest green - academic, trustworthy
      light: '#4a7c59',
      dark: '#1a3a1e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b4513', // Saddle brown - warm, book-like
      light: '#a0522d',
      dark: '#654321',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa', // Light gray - clean, readable
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50', // Dark blue-gray - professional
      secondary: '#5a6c7d',
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h1: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2c5530',
          boxShadow: '0 2px 4px rgba(44, 85, 48, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(44, 85, 48, 0.1)',
          border: '1px solid #e8f5e8',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(44, 85, 48, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(44, 85, 48, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(44, 85, 48, 0.3)',
          },
        },
      },
    },
  },
});

function App() {
  // Helper function to create guest account
  const createGuestAccount = (): Account => ({
    id: 'guest',
    username: 'guest',
    password: 'guest',
    email: 'guest@library.com',
    first_name: 'Guest',
    last_name: 'User',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    membership_type: 'Standard',
    join_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'active',
    max_books_allowed: 2,
    current_books_borrowed: 0,
    fines_owed: 0,
    last_login: new Date().toISOString().split('T')[0]
  });

  const [currentView, setCurrentView] = useState<'browse' | 'reservation'>('browse');
  const [books, setBooks] = useState<Book[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentUser, setCurrentUser] = useState<Account | null>(() => createGuestAccount());
  const [readingList, setReadingList] = useState<ReadingListBook[]>([]);
  const [, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [booksData, accountsData] = await Promise.all([
          loadBooks(),
          loadAccounts()
        ]);
        setBooks(booksData);
        setAccounts(accountsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogin = (user: Account) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // Return to guest account instead of null
    setCurrentUser(createGuestAccount());
    setReadingList([]);
    setReservations([]);
    setCurrentView('browse');
  };


  const addToReadingList = (book: Book) => {
    if (!currentUser) return;
    
    // Check if user has reached their limit
    if (readingList.length >= currentUser.max_books_allowed) {
      alert(`You can only select up to ${currentUser.max_books_allowed} books.`);
      return;
    }

    const readingListBook: ReadingListBook = {
      ...book,
      selectedDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
    setReadingList(prev => [...prev, readingListBook]);
  };

  const removeFromReadingList = (bookId: string) => {
    setReadingList(prev => prev.filter(book => book.id !== bookId));
  };

  // Note editing per-book in a dedicated page has been removed with consolidation

  const submitReservations = (submittedReservations: Reservation[]) => {
    setReservations(submittedReservations);
    // Do not navigate yet; wait for success page action
  };

  const handleSuccessDone = () => {
    setReadingList([]);
    setCurrentView('browse');
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Loading Library Catalog...
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            Please wait while we prepare our collection for you.
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }

  // Show login form if user clicked login button (currentUser is null)
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginForm accounts={accounts} onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              📖 Springfield Public Library
            </Typography>
            {currentUser?.id === 'guest' ? (
              <Button 
                color="inherit" 
                onClick={() => {
                  // Show login form by temporarily setting currentUser to null
                  setCurrentUser(null);
                }}
              >
                Login
              </Button>
            ) : (
              <UserProfile user={currentUser} onLogout={handleLogout} />
            )}
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
          {currentView === 'browse' && (
            <BookBrowser 
              books={books}
              onAddToReadingList={addToReadingList}
              onRemoveFromReadingList={removeFromReadingList}
              currentUser={currentUser}
              readingList={readingList}
            />
          )}

          {/* ReadingList page removed; users go directly to reservation flow */}

          {currentView === 'reservation' && (
            <ReservationSubmission 
              readingList={readingList}
              onSubmitReservations={submitReservations}
              onBack={() => setCurrentView('browse')}
              currentUser={currentUser}
              onSuccessDone={handleSuccessDone}
            />
          )}

          {/* Floating Action Button for Reading List */}
          {currentView === 'browse' && readingList.length > 0 && (
            <Fab
              color="primary"
              aria-label="reading list"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={() => setCurrentView('reservation')}
            >
              <Badge badgeContent={readingList.length} color="secondary">
                <BookmarkIcon />
              </Badge>
            </Fab>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
