import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            通勤地圖
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            歡迎, {user?.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            登出
          </Button>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="xl" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          py: 2,
          overflow: 'hidden' // Prevent content from overflowing
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
