import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Box, Fab, Badge } from '@mui/material';
import { Book, Account, ReadingListBook, Reservation } from './types';
import { loadBooks, loadAccounts } from './utils/dataLoader';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import BookBrowser from './components/BookBrowser';
import ReadingList from './components/ReadingList';
import ReservationSubmission from './components/ReservationSubmission';
import { BookmarkBorder as BookmarkIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState<'browse' | 'reading-list' | 'reservation'>('browse');
  const [books, setBooks] = useState<Book[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
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
    setCurrentUser(null);
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

  const updateReadingListBook = (bookId: string, updates: Partial<ReadingListBook>) => {
    setReadingList(prev => prev.map(book => 
      book.id === bookId ? { ...book, ...updates } : book
    ));
  };

  const submitReservations = (submittedReservations: Reservation[]) => {
    setReservations(submittedReservations);
    setCurrentView('browse');
    setReadingList([]);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4">Loading Library Data...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  // Show login form if no user is logged in
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              📚 Digital Library Service
            </Typography>
            <UserProfile user={currentUser} onLogout={handleLogout} />
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
          {currentView === 'browse' && (
            <BookBrowser 
              books={books}
              onAddToReadingList={addToReadingList}
              currentUser={currentUser}
              readingList={readingList}
            />
          )}

          {currentView === 'reading-list' && (
            <ReadingList 
              readingList={readingList}
              onRemoveFromReadingList={removeFromReadingList}
              onUpdateReadingListBook={updateReadingListBook}
              onBack={() => setCurrentView('browse')}
              onNext={() => setCurrentView('reservation')}
            />
          )}

          {currentView === 'reservation' && (
            <ReservationSubmission 
              readingList={readingList}
              onSubmitReservations={submitReservations}
              onBack={() => setCurrentView('reading-list')}
              currentUser={currentUser}
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
              onClick={() => setCurrentView('reading-list')}
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
