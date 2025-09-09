import {
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Computer as ComputerIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Assessment as ReportsIcon
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
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
  Alert,
  Fade,
  Zoom,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { Brightness4, Brightness7, Person as PersonIcon } from '@mui/icons-material';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    assignedItems: 0,
    totalUsers: 0,
    activeAssignments: 0,
    overdueAssignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, theme } = useCustomTheme();

  const AnimatedRainbowHeading = ({ text }) => {
    const [step, setStep] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setStep(s => s + 1), 1000);
      return () => clearInterval(id);
    }, []);
    const colors = ['#ff3b30', '#ffcc00', '#007aff', '#34c759', '#00ffff', '#ff00ff', '#af52de'];
    const words = String(text).split(' ');
    return (
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: colors[(i + step) % colors.length], transition: 'color 0.6s ease' }}>
            {w}{i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Typography>
    );
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          navigate('/login');
          return;
        }

        // Fetch dashboard stats
        const response = await axios.get('http://localhost:5000/api/reports/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats(response.data);

      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard statistics. Please try again later.');
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  // Live refresh when admin returns to tab/window
  useEffect(() => {
    const onFocus = () => fetchDashboardStatsSafe();
    const onVisibility = () => { if (!document.hidden) fetchDashboardStatsSafe(); };
    const fetchDashboardStatsSafe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://localhost:5000/api/reports/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ title, value, icon, color, delay }) => (
    <Zoom in={!loading} style={{ transitionDelay: `${delay}ms` }}>
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
    </Zoom>
  );

  // ... existing code
  const ActionCard = ({ title, description, icon, color, onClick, delay }) => (
    <Zoom in={!loading} style={{ transitionDelay: `${delay}ms` }}>
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
            color="text.secondary"
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );

  const actionCards = [
    { title: 'Manage Inventory', description: 'Add, view, edit, and delete items.', icon: <InventoryIcon fontSize="large" />, color: theme.palette.primary.main, onClick: () => navigate('/inventory'), delay: 300 },
    { title: 'Manage Users', description: 'View and manage user accounts.', icon: <PeopleIcon fontSize="large" />, color: theme.palette.success.main, onClick: () => navigate('/users'), delay: 400 },
    { title: 'Manage Assignments', description: 'Assign items and track their status.', icon: <AssignmentIcon fontSize="large" />, color: theme.palette.warning.main, onClick: () => navigate('/assignments'), delay: 500 },
    { title: 'Reports', description: 'Generate inventory and assignment reports.', icon: <ReportsIcon fontSize="large" />, color: theme.palette.info.main, onClick: () => navigate('/reports'), delay: 600 },
    { title: 'Maintenance', description: 'Track and resolve maintenance requests.', icon: <ReportsIcon fontSize="large" />, color: theme.palette.error.main, onClick: () => navigate('/maintenance'), delay: 700 },
    { title: 'Discounts', description: 'Assign date-based discounts to users.', icon: <ReportsIcon fontSize="large" />, color: theme.palette.secondary.main, onClick: () => navigate('/discounts'), delay: 800 },
  ];

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
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              {user?.fullName} (Admin)
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Top-right admin info panel */}
      <Card
        sx={{
          position: 'absolute',
          top: 80,
          right: 16,
          width: 320,
          zIndex: 10,
          background: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Your Information
          </Typography>
          <Box>
            <Typography variant="body2" color="textSecondary"><strong>Name:</strong> {user?.fullName}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}><strong>Email:</strong> {user?.email}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}><strong>Department:</strong> {user?.department || 'N/A'}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}><strong>Role:</strong> Admin</Typography>
          </Box>
        </CardContent>
      </Card>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, position: 'relative', zIndex: 1, pr: { xs: 0, md: '360px' } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          </Fade>
        ) : (
          <Fade in={!loading}>
            <div>
              <AnimatedRainbowHeading text="System Overview" />
              <Grid container spacing={2}>
                {/* Stat Cards */}
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <StatCard title="Total Items" value={stats.totalItems} icon={<StorageIcon sx={{ fontSize: 40 }} />} color={theme.palette.primary.main} delay={100} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <StatCard title="Assigned Items" value={stats.assignedItems} icon={<AssignmentTurnedInIcon sx={{ fontSize: 40 }} />} color={theme.palette.success.main} delay={200} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <StatCard title="Available Items" value={stats.availableItems} icon={<ComputerIcon sx={{ fontSize: 40 }} />} color={theme.palette.info.main} delay={300} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon sx={{ fontSize: 40 }} />} color={theme.palette.secondary.main} delay={400} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <StatCard title="Active Assignments" value={stats.activeAssignments} icon={<AssignmentIcon sx={{ fontSize: 40 }} />} color={theme.palette.warning.dark} delay={500} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3}>
                  <StatCard title="Overdue Assignments" value={stats.overdueAssignments} icon={<WarningIcon sx={{ fontSize: 40 }} />} color={theme.palette.error.main} delay={600} />
                </Grid>
              </Grid>

              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary, mt: 5, mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={4}>
                {actionCards.map((card, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <ActionCard {...card} />
                  </Grid>
                ))}
              </Grid>
            </div>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;