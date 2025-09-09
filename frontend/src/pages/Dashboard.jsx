import axios from 'axios';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Inventory as InventoryIcon,
  Computer as ComputerIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Assessment as ReportsIcon,
  Logout as LogoutIcon,
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Fade
} from '@mui/material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    inUseItems: 0,
    maintenanceItems: 0
  });
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode, theme } = useCustomTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh stats when window regains focus or tab becomes visible
  useEffect(() => {
    const onFocus = () => fetchStats();
    const onVisibility = () => { if (!document.hidden) fetchStats(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const items = response.data;
      setStats({
        totalItems: items.length,
        availableItems: items.filter(item => item.status === 'Available').length,
        inUseItems: items.filter(item => item.status === 'Assigned').length,
        maintenanceItems: items.filter(item => item.status === 'Under Repair').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              color="textSecondary" 
              gutterBottom 
              variant="h6"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                color: color,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              color: color,
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ title, description, icon, color, onClick }) => (
    <Card 
      onClick={onClick}
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          backgroundColor: `${color}10`,
        }
      }}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Box 
          sx={{ 
            color: color,
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="h5" 
          component="h2"
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          color="textSecondary"
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'auto',
      }}
    >
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            ICT Inventory System
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="body2">
              Welcome, {user?.fullName}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        <Fade in={!loading}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              textAlign: 'center',
              mb: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Dashboard
          </Typography>
        </Fade>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Items"
              value={stats.totalItems}
              icon={<ComputerIcon sx={{ fontSize: 40 }} />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Available Items"
              value={stats.availableItems}
              icon={<StorageIcon sx={{ fontSize: 40 }} />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Use"
              value={stats.inUseItems}
              icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Maintenance"
              value={stats.maintenanceItems}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="#f44336"
            />
          </Grid>
        </Grid>

        {/* Action Cards */}
        <Fade in={!loading}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              textAlign: 'center',
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Quick Actions
          </Typography>
        </Fade>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <ActionCard
              title="View Inventory"
              description="Browse and search ICT items"
              icon={<InventoryIcon sx={{ fontSize: 40 }} />}
              color="#2196f3"
              onClick={() => navigate('/inventory')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <ActionCard
              title="View Reports"
              description="Check system reports and analytics"
              icon={<ReportsIcon sx={{ fontSize: 40 }} />}
              color="#4caf50"
              onClick={() => navigate('/reports')}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;