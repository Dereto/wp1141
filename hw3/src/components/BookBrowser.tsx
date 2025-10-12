import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Book, Account, ReadingListBook } from '../types';

interface BookBrowserProps {
  books: Book[];
  onAddToReadingList: (book: Book) => void;
  currentUser: Account;
  readingList: ReadingListBook[];
}

const BookBrowser: React.FC<BookBrowserProps> = ({ books, onAddToReadingList, currentUser, readingList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const genres = useMemo(() => {
    const genreSet = new Set(books.map(book => book.genre));
    return Array.from(genreSet).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
      const matchesStatus = selectedStatus === '' || book.status === selectedStatus;
      
      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [books, searchTerm, selectedGenre, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'borrowed': return 'warning';
      case 'reserved': return 'info';
      case 'out_of_order': return 'error';
      default: return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'damaged': return 'error';
      default: return 'default';
    }
  };

  const handleAddToReadingList = (book: Book) => {
    if (book.status === 'available') {
      onAddToReadingList(book);
    }
  };

  const isBookInReadingList = (bookId: string) => {
    return readingList.some(book => book.id === bookId);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBook(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📚 Browse Our Library Collection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Discover and explore our extensive collection of books. Use filters and search to find exactly what you're looking for.
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={selectedGenre}
                label="Genre"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <MenuItem value="">All Genres</MenuItem>
                {genres.map(genre => (
                  <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="borrowed">Borrowed</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="out_of_order">Out of Order</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('');
                setSelectedStatus('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Found {filteredBooks.length} books
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome, {currentUser.first_name}! You can select up to {currentUser.max_books_allowed} books.
        </Typography>
      </Box>

      {/* Books Grid */}
      <Grid container spacing={3}>
        {filteredBooks.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                opacity: isBookInReadingList(book.id) ? 0.7 : 1,
                '&:hover': {
                  transform: isBookInReadingList(book.id) ? 'none' : 'translateY(-4px)',
                  boxShadow: isBookInReadingList(book.id) ? 1 : 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {book.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  by {book.author}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={book.genre} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={book.status} 
                    size="small" 
                    color={getStatusColor(book.status) as any}
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={book.condition} 
                    size="small" 
                    color={getConditionColor(book.condition) as any}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {book.pages} pages • {book.publication_year} • {book.language}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {book.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {book.location}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleBookClick(book)}
                      color="primary"
                    >
                      <InfoIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant={isBookInReadingList(book.id) ? "outlined" : "contained"}
                      startIcon={<AddIcon />}
                      onClick={() => handleAddToReadingList(book)}
                      disabled={book.status !== 'available' || isBookInReadingList(book.id)}
                      color={isBookInReadingList(book.id) ? "secondary" : "primary"}
                    >
                      {isBookInReadingList(book.id) 
                        ? 'Already Reserved' 
                        : book.status === 'available' 
                          ? 'Reserve Book' 
                          : 'Unavailable'
                      }
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredBooks.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No books found matching your criteria. Try adjusting your search terms or filters.
        </Alert>
      )}

      {/* Book Detail Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5">{selectedBook?.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            by {selectedBook?.author}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedBook && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">ISBN:</Typography>
                  <Typography variant="body1">{selectedBook.isbn}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Publisher:</Typography>
                  <Typography variant="body1">{selectedBook.publisher}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Pages:</Typography>
                  <Typography variant="body1">{selectedBook.pages}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Language:</Typography>
                  <Typography variant="body1">{selectedBook.language}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Location:</Typography>
                  <Typography variant="body1">{selectedBook.location}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Condition:</Typography>
                  <Chip 
                    label={selectedBook.condition} 
                    color={getConditionColor(selectedBook.condition) as any}
                    size="small"
                  />
                </Grid>
              </Grid>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>Description:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedBook.description}
              </Typography>

              {selectedBook.status === 'borrowed' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This book is currently borrowed. Due date: {selectedBook.due_date}
                </Alert>
              )}

              {selectedBook.status === 'reserved' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This book is reserved. Reservation date: {selectedBook.reservation_date}
                </Alert>
              )}

              {selectedBook.status === 'out_of_order' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  This book is currently out of order and unavailable.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (selectedBook) {
                handleAddToReadingList(selectedBook);
                handleCloseDialog();
              }
            }}
            disabled={selectedBook?.status !== 'available'}
          >
            Add to Reading List
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookBrowser;
