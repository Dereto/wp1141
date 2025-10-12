import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Account } from '../types';

interface UserProfileProps {
  user: Account;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const getMembershipColor = (type: string) => {
    return type === 'Premium' ? 'primary' : 'secondary';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={`${user.membership_type} Member`}
        color={getMembershipColor(user.membership_type) as any}
        size="small"
        variant="outlined"
      />
      
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 1 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {user.id === 'guest' ? 'G' : getInitials(user.first_name, user.last_name)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <PersonIcon sx={{ mr: 1 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">
            <strong>Membership:</strong> {user.membership_type}
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">
            <strong>Books Allowed:</strong> {user.max_books_allowed}
          </Typography>
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <Typography variant="body2">
            <strong>Currently Borrowed:</strong> {user.current_books_borrowed}
          </Typography>
        </MenuItem>
        
        {user.fines_owed > 0 && (
          <MenuItem onClick={handleClose}>
            <Typography variant="body2" color="error">
              <strong>Fines Owed:</strong> ${user.fines_owed.toFixed(2)}
            </Typography>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfile;
