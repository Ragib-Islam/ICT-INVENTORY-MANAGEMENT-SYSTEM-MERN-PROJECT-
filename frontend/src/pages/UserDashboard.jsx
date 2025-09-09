import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Computer as ComputerIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Brightness4,
  Brightness7,
  Assessment as ReportsIcon,
  Inventory as InventoryIcon,
  ReportProblem as ReportIcon
} from '@mui/icons-material';

const UserDashboard = () => {
  const [myAssignments, setMyAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    activeAssignments: 0,
    overdueAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({ availableItems: 0, assignedItems: 0, underRepairItems: 0 });

  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, theme } = useCustomTheme();

  const AnimatedRainbowText = ({ text }) => {
    const [step, setStep] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setStep(s => s + 1), 1000);
      return () => clearInterval(id);
    }, []);
    const colors = ['#ff3b30', '#ffcc00', '#007aff', '#34c759', '#00ffff', '#ff00ff', '#af52de']; // red, yellow, blue, green, cyan, magenta, purple
    const words = String(text).split(' ');
    return (
      <>
        {words.map((w, i) => (
          <span key={i} style={{ color: colors[(i + step) % colors.length], transition: 'color 0.6s ease' }}>
            {w}{i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </>
    );
  };

  console.log('UserDashboard render - user:', user, 'authLoading:', authLoading);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // If no user after auth loading is complete, redirect to login
    if (!user) {
      console.log('No user found after auth loading, redirecting to login');
      navigate('/login');
      return;
    }

    // User is available, fetch assignments
    console.log('User found, fetching assignments for:', user._id);
    fetchMyAssignments();
    fetchOverview();
  }, [user, authLoading, navigate]);

  // Keep assignments fresh across tab switches
  useEffect(() => {
    const onFocus = () => { if (!authLoading && user) fetchMyAssignments(); };
    const onVisibility = () => { if (!document.hidden && !authLoading && user) fetchMyAssignments(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authLoading, user]);

  const fetchMyAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        navigate('/login');
        return;
      }

      console.log('Fetching assignments for user:', user._id);
      
      const response = await axios.get(`http://localhost:5000/api/assignments/user/${user._id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Assignments response:', response.data);
      
      const assignments = response.data;
      setMyAssignments(assignments);
      
      setStats({
        totalAssigned: assignments.length,
        activeAssignments: assignments.filter(a => a.status === 'Active').length,
        overdueAssignments: assignments.filter(a => a.status === 'Overdue').length
      });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (error.response?.status === 404) {
        // No assignments found - this is okay
        console.log('No assignments found for user');
        setMyAssignments([]);
        setStats({
          totalAssigned: 0,
          activeAssignments: 0,
          overdueAssignments: 0
        });
      } else {
        setError('Failed to fetch your assignments: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/reports/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOverview({
        availableItems: res.data?.availableItems || 0,
        assignedItems: res.data?.assignedItems || 0,
        underRepairItems: res.data?.underRepairItems || 0,
      });
    } catch (e) {
      // Non-blocking for users
      console.error('Overview fetch failed', e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'primary';
      case 'Returned': return 'success';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent': return 'success';
      case 'Good': return 'primary';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // If no user after auth loading is complete, show error
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">
          User not found. Redirecting to login...
        </Alert>
      </Box>
    );
  }

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
            User Dashboard
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              {user?.fullName} ({user?.department})
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Top-right user info panel */}
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
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}><strong>Department:</strong> {user?.department}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}><strong>Role:</strong> {user?.role}</Typography>
          </Box>
        </CardContent>
      </Card>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Fade in={!loading}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
            <AnimatedRainbowText text={`Welcome, ${user?.fullName}!`} />
          </Typography>
        </Fade>

        {/* Assignment/Status overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
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
                    <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Total Equipment Assigned
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      {stats.totalAssigned}
                    </Typography>
                  </Box>
                  <Box sx={{ color: theme.palette.primary.main, backgroundColor: `${theme.palette.primary.main}20`, borderRadius: '50%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ComputerIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                    <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Active Assignments
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      {stats.activeAssignments}
                    </Typography>
                  </Box>
                  <Box sx={{ color: theme.palette.success.main, backgroundColor: `${theme.palette.success.main}20`, borderRadius: '50%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
                    <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Overdue Items
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                      {stats.overdueAssignments}
                    </Typography>
                  </Box>
                  <Box sx={{ color: theme.palette.error.main, backgroundColor: `${theme.palette.error.main}20`, borderRadius: '50%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Inventory status overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Available Items
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                      {overview.availableItems}
                    </Typography>
                  </Box>
                  <Box sx={{ color: theme.palette.success.main, backgroundColor: `${theme.palette.success.main}20`, borderRadius: '50%', p: 2 }}>
                    <InventoryIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Assigned Items
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                      {overview.assignedItems}
                    </Typography>
                  </Box>
                  <Box sx={{ color: theme.palette.warning.main, backgroundColor: `${theme.palette.warning.main}20`, borderRadius: '50%', p: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Under Repair
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                      {overview.underRepairItems}
                    </Typography>
                  </Box>
                  <Box sx={{ color: theme.palette.info.main, backgroundColor: `${theme.palette.info.main}20`, borderRadius: '50%', p: 2 }}>
                    <InventoryIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main row: assignments large */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 2, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                My Equipment Assignments
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading assignments...</Typography>
                </Box>
              ) : myAssignments.length === 0 ? (
                <Typography color="textSecondary">No equipment assigned to you yet.</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Equipment</strong></TableCell>
                        <TableCell><strong>Assigned Date</strong></TableCell>
                        <TableCell><strong>Expected Return</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Condition</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myAssignments.map((assignment) => (
                        <TableRow key={assignment._id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">{assignment.item?.itemName || 'Unknown Item'}</Typography>
                              <Typography variant="caption" color="textSecondary">{assignment.item?.brand} {assignment.item?.model}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{assignment.assignmentDate ? new Date(assignment.assignmentDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{assignment.expectedReturnDate ? new Date(assignment.expectedReturnDate).toLocaleDateString() : 'Not specified'}</TableCell>
                          <TableCell>
                            <Chip label={assignment.status} color={getStatusColor(assignment.status)} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={assignment.condition || 'Good'} color={getConditionColor(assignment.condition)} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grid>

          {/* right column intentionally empty to let overlay card live at top-right */}
          <Grid item xs={12} lg={4}></Grid>
        </Grid>

        {/* Big actions on their own rows */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Card onClick={() => navigate('/inventory')} sx={{ cursor: 'pointer', p: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 20px rgba(0,0,0,0.15)' } }}>
              <Box display="flex" alignItems="center">
                <InventoryIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">View All Equipment</Typography>
                  <Typography color="textSecondary">Browse available equipment</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card onClick={() => navigate('/report-issue')} sx={{ cursor: 'pointer', p: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 20px rgba(0,0,0,0.15)' } }}>
              <Box display="flex" alignItems="center">
                <ReportIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">Report Issue</Typography>
                  <Typography color="textSecondary">Create a maintenance request for an item</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card onClick={() => navigate('/reports')} sx={{ cursor: 'pointer', p: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 20px rgba(0,0,0,0.15)' } }}>
              <Box display="flex" alignItems="center">
                <ReportsIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">View Reports</Typography>
                  <Typography color="textSecondary">Check status by availability, assigned, and repair</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card onClick={() => navigate('/my-discounts')} sx={{ cursor: 'pointer', p: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 20px rgba(0,0,0,0.15)' } }}>
              <Box display="flex" alignItems="center">
                <ReportsIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">My Discounts</Typography>
                  <Typography color="textSecondary">See items with date-based discounts</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDashboard;