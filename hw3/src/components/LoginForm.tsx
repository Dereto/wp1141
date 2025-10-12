import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Paper
} from '@mui/material';
import { Account } from '../types';

interface LoginFormProps {
  accounts: Account[];
  onLogin: (account: Account) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ accounts, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Proper authentication - check both username and password
    const account = accounts.find(acc => 
      acc.username === username && acc.password === password && acc.status === 'active'
    );

    if (account) {
      onLogin(account);
    } else {
      setError('Invalid username, password, or account is inactive');
    }
  };

  const handleGuestAccess = () => {
    // Create a guest account
    const guestAccount: Account = {
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
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      max_books_allowed: 2,
      current_books_borrowed: 0,
      fines_owed: 0,
      last_login: new Date().toISOString().split('T')[0]
    };
    onLogin(guestAccount);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            📚 Digital Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to access the full library experience
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                or
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGuestAccess}
                size="large"
              >
                Continue as Guest
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Guest users have limited access (2 books max)
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Demo Login Credentials:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Username:</strong> john_doe | <strong>Password:</strong> password123<br/>
            <strong>Username:</strong> jane_smith | <strong>Password:</strong> password123<br/>
            <strong>Username:</strong> mike_wilson | <strong>Password:</strong> password123<br/>
            <strong>Username:</strong> sarah_jones | <strong>Password:</strong> password123<br/>
            <strong>Username:</strong> david_brown | <strong>Password:</strong> password123
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Membership Types:</strong> Premium (10 books) | Standard (5 books)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;
