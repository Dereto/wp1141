import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  TextField,
  Chip,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { ReadingListBook } from '../types';

interface ReadingListProps {
  readingList: ReadingListBook[];
  onRemoveFromReadingList: (bookId: string) => void;
  onUpdateReadingListBook: (bookId: string, updates: Partial<ReadingListBook>) => void;
  onBack: () => void;
  onNext: () => void;
}

const ReadingList: React.FC<ReadingListProps> = ({
  readingList,
  onRemoveFromReadingList,
  onUpdateReadingListBook,
  onBack,
  onNext
}) => {
  const [editingBook, setEditingBook] = useState<ReadingListBook | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [tempDate, setTempDate] = useState('');

  const handleEditBook = (book: ReadingListBook) => {
    setEditingBook(book);
    setTempNotes(book.notes || '');
    setTempDate(book.selectedDate);
    setDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingBook) {
      onUpdateReadingListBook(editingBook.id, {
        notes: tempNotes,
        selectedDate: tempDate
      });
      setDialogOpen(false);
      setEditingBook(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBook(null);
    setTempNotes('');
    setTempDate('');
  };

  const getTotalEstimatedTime = () => {
    const totalPages = readingList.reduce((sum, book) => sum + book.pages, 0);
    const estimatedHours = Math.ceil(totalPages / 20); // Assuming 20 pages per hour
    return { totalPages, estimatedHours };
  };

  const { totalPages, estimatedHours } = getTotalEstimatedTime();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📖 My Reading List
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and organize your selected books. Add notes and reading dates to personalize your reading experience.
      </Typography>

      {readingList.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Your reading list is empty. Browse and add some books to get started!
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={onBack}
          >
            Continue Browsing
          </Button>
        </Box>
      ) : (
        <>
          {/* Reading List Summary */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {readingList.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Books Selected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {totalPages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {estimatedHours}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Est. Reading Time
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {readingList.length > 0 ? Math.ceil(readingList.reduce((sum, book) => sum + book.pages, 0) / 20) : 0}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Est. Reading Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Reading List Items */}
          <Grid container spacing={3}>
            {readingList.map((book) => (
              <Grid item xs={12} key={book.id}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
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
                            label={`${book.pages} pages`} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip 
                            label={`${book.publication_year}`} 
                            size="small" 
                            color="default" 
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ScheduleIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Reading Date: {book.selectedDate}
                          </Typography>
                        </Box>

                        {book.notes && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <NotesIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary', mt: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              Notes: {book.notes}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {book.location}
                          </Typography>
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditBook(book)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => onRemoveFromReadingList(book.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={onBack}
              size="large"
            >
              Continue Browsing
            </Button>
            <Button
              variant="contained"
              onClick={onNext}
              size="large"
              startIcon={<BookmarkIcon />}
            >
              Reserve These Books ({readingList.length})
            </Button>
          </Box>
        </>
      )}

      {/* Edit Book Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Book Details
        </DialogTitle>
        <DialogContent>
          {editingBook && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {editingBook.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                by {editingBook.author}
              </Typography>
              
              <TextField
                fullWidth
                label="Reading Date"
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2, mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Personal Notes"
                multiline
                rows={4}
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Add your thoughts, reading goals, or any notes about this book..."
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReadingList;
