import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ReadingListBook, Reservation, Account } from '../types';

interface ReservationSubmissionProps {
  readingList: ReadingListBook[];
  onSubmitReservations: (reservations: Reservation[]) => void;
  onBack: () => void;
  currentUser?: Account;
  onSuccessDone?: () => void; // optional callback when leaving success screen
}

const ReservationSubmission: React.FC<ReservationSubmissionProps> = ({
  readingList,
  onSubmitReservations,
  onBack,
  currentUser,
  onSuccessDone
}) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'contact' | 'review' | 'success'>('select');
  const [selectedBooks, setSelectedBooks] = useState<string[]>(readingList.map(book => book.id));
  const [userInfo, setUserInfo] = useState({
    firstName: (currentUser && currentUser.id !== 'guest') ? currentUser.first_name : '',
    lastName: (currentUser && currentUser.id !== 'guest') ? currentUser.last_name : '',
    email: (currentUser && currentUser.id !== 'guest') ? currentUser.email : '',
    phone: (currentUser && currentUser.id !== 'guest') ? currentUser.phone : '',
    membershipNumber: (currentUser && currentUser.id !== 'guest') ? currentUser.id : ''
  });
  const [notes, setNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleBookSelection = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleNext = () => {
    if (currentStep === 'select') setCurrentStep('contact');
    else if (currentStep === 'contact') setCurrentStep('review');
  };

  const handleBack = () => {
    if (currentStep === 'contact') setCurrentStep('select');
    else if (currentStep === 'review') setCurrentStep('contact');
  };

  const handleSubmit = () => {
    const selectedBooksData = readingList.filter(book => selectedBooks.includes(book.id));
    const reservations: Reservation[] = selectedBooksData.map((book, index) => ({
      id: `res_${Date.now()}_${index}`,
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      reservationDate: new Date().toISOString().split('T')[0],
      estimatedPickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      status: 'pending' as const,
      notes: notes
    }));

    onSubmitReservations(reservations);
    // Move to success page instead of navigating away immediately
    setCurrentStep('success');
  };

  const selectedBooksData = readingList.filter(book => selectedBooks.includes(book.id));
  const totalPages = selectedBooksData.reduce((sum, book) => sum + book.pages, 0);


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📋 Submit Book Reservations
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Complete your reservation by providing your information and confirming your selections.
      </Typography>

      {/* Step 1: Select Books */}
      {currentStep === 'select' && (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which books from your reading list you'd like to reserve. You can select all or just a few.
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2 }}>
              <List>
                {readingList.map((book) => (
                  <ListItem key={book.id} divider>
                    <Checkbox
                      checked={selectedBooks.includes(book.id)}
                      onChange={() => handleBookSelection(book.id)}
                    />
                    <ListItemIcon>
                      <BookmarkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={book.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            by {book.author} • {book.genre} • {book.pages} pages
                          </Typography>
                          <Typography variant="body2" color="primary">
                            Reading Date: {book.selectedDate}
                          </Typography>
                          {book.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Notes: {book.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Selected {selectedBooks.length} of {readingList.length} books. 
                Total pages: {totalPages}
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={selectedBooks.length === 0}
              >
                Continue to Contact Info
              </Button>
            <Button onClick={onBack} sx={{ ml: 1 }}>
              Back to Browsing
            </Button>
            </Box>
        </Box>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === 'contact' && (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please provide your contact information so we can notify you when your books are ready for pickup.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userInfo.firstName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userInfo.lastName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Library Membership Number (Optional)"
                  value={userInfo.membershipNumber}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, membershipNumber: e.target.value }))}
                  helperText="If you have a library membership, please provide your membership number for faster processing."
                />
              </Grid>
            </Grid>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.email || !userInfo.phone}
              >
                Continue to Review
              </Button>
              <Button onClick={handleBack} sx={{ ml: 1 }}>
                Back
              </Button>
            </Box>
        </Box>
      )}

      {/* Step 3: Review & Confirm */}
      {currentStep === 'review' && (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please review your reservation details before submitting.
            </Typography>

            {/* Contact Information Summary */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Contact Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <EmailIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      {userInfo.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <PhoneIcon sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
                      {userInfo.phone}
                    </Typography>
                  </Grid>
                  {userInfo.membershipNumber && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Membership:</strong> {userInfo.membershipNumber}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Selected Books Summary */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <BookmarkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Selected Books ({selectedBooks.length})
                </Typography>
                <List dense>
                  {selectedBooksData.map((book) => (
                    <ListItem key={book.id}>
                      <ListItemText
                        primary={book.title}
                        secondary={`by ${book.author} • ${book.genre} • ${book.pages} pages`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" color="primary">
                  Total Pages: {totalPages}
                </Typography>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes for your reservation..."
              sx={{ mb: 2 }}
            />

            {/* Terms and Conditions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the library's terms and conditions. I understand that books must be picked up within 7 days of notification, and late fees may apply.
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            {/* Important Information */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> You will receive an email notification when your books are ready for pickup. 
                Books must be picked up within 7 days of notification. Estimated pickup date: {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={!agreedToTerms}
                startIcon={<CheckCircleIcon />}
              >
                Submit Reservations
              </Button>
              <Button onClick={handleBack} sx={{ ml: 1 }}>
                Back
              </Button>
            </Box>
        </Box>
      )}

      {/* Step 4: Success */}
      {currentStep === 'success' && (
        <Box sx={{ textAlign: 'center' }}>
          <Paper sx={{ p: 4, mb: 3 }}>
            <CheckCircleIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Reservation Request Sent
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you! Your reservation request has been submitted. We will notify you by email when your books are ready for pickup.
            </Typography>
          </Paper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (onSuccessDone) onSuccessDone();
            }}
          >
            Back to Browsing
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReservationSubmission;
