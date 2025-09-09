import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent, AppBar, Toolbar,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Chip, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon, AdminPanelSettings as AdminIcon, Brightness4, Brightness7, Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

const Reports = () => {
  const { logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const isAdminUser = isAdmin();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const [reportType, setReportType] = useState(isAdminUser ? 'inventory' : 'my_assignments');
  const [items, setItems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({ total: 0, byStatus: {} });
  const [assignmentStats, setAssignmentStats] = useState({ total: 0, active: 0, returned: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Keep report type in sync with current role
    setReportType(isAdminUser ? 'inventory' : 'my_assignments');
  }, [isAdminUser]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        if (isAdminUser) {
          const [itemsRes, assignmentsRes] = await Promise.all([
            axios.get('http://localhost:5000/api/items', config),
            axios.get('http://localhost:5000/api/assignments', config)
          ]);
          setItems(itemsRes.data);
          setAssignments(assignmentsRes.data);
          calculateInventoryStats(itemsRes.data);
          calculateAssignmentStats(assignmentsRes.data);
        } else {
          const uid = user?._id || user?.id;
          if (uid) {
            const res = await axios.get(`http://localhost:5000/api/assignments/user/${uid}`, config);
            setMyAssignments(res.data);
            calculateAssignmentStats(res.data);
          }
        }
      } catch (err) {
        setError('Failed to fetch report data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [isAdminUser, user?._id, user?.id]);

  const calculateInventoryStats = (itemsData) => {
    const byStatus = itemsData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    const total = itemsData.length;
    setInventoryStats({ total, byStatus });
  };

  const getAssignmentStatus = (assignment) => {
    if (assignment.actualReturnDate || assignment.returnDate) return 'Returned';
    if (assignment.expectedReturnDate && new Date(assignment.expectedReturnDate) < new Date()) return 'Overdue';
    return 'Active';
  };

  const getAssignmentStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'primary';
      case 'Returned': return 'success';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Assigned': return 'primary';
      case 'Under Repair': return 'warning';
      case 'Damaged': return 'error';
      default: return 'default';
    }
  };

  const calculateAssignmentStats = (assignmentsData) => {
    const stats = {
      total: assignmentsData.length,
      active: 0,
      returned: 0,
      overdue: 0,
    };
    assignmentsData.forEach(a => {
      const status = getAssignmentStatus(a);
      if (status === 'Returned') {
        stats.returned++;
      } else {
        stats.active++;
        if (status === 'Overdue') {
          stats.overdue++;
        }
      }
    });
    setAssignmentStats(stats);
  };

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
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Reports
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {isAdminUser ? <AdminIcon sx={{ mr: 1 }} /> : <PersonIcon sx={{ mr: 1 }} />}
            <Typography variant="body2">
              {user?.fullName} ({user?.role})
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {isAdminUser ? 'System Reports' : 'My Reports'}
          </Typography>
          {isAdmin() && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="inventory">Inventory Status</MenuItem>
                <MenuItem value="assignments">Assignment Status</MenuItem>
                <MenuItem value="categories">Category Breakdown</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

        <Grid container spacing={3}>
          {!isAdminUser && (
            <>
              {/* Left: My Overview with percentages */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%', background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>My Overview</Typography>
                  <Typography variant="h4">{assignmentStats.total} Items</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                    {['Active','Returned','Overdue'].map((label) => {
                      const count = assignmentStats[label.toLowerCase()] ?? (label==='Active'?assignmentStats.active:label==='Returned'?assignmentStats.returned:assignmentStats.overdue);
                      const pct = assignmentStats.total ? Math.round((count / assignmentStats.total) * 100) : 0;
                      return (
                        <Box key={label}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{label}</Typography>
                            <Typography variant="body2">{count} ({pct}%)</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              </Grid>

              {/* Right: My Assignment Details */}
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>My Assignment Details</Typography>
                  {myAssignments.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Serial Number</TableCell>
                            <TableCell>Date Assigned</TableCell>
                            <TableCell>Expected Return Date</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {myAssignments.map((assignment) => {
                            const status = getAssignmentStatus(assignment);
                            return (
                              <TableRow key={assignment._id}>
                                <TableCell>{assignment.item?.itemName || 'N/A'}</TableCell>
                                <TableCell>{assignment.item?.category || 'N/A'}</TableCell>
                                <TableCell>{assignment.item?.serialNumber || 'N/A'}</TableCell>
                                <TableCell>{new Date(assignment.assignmentDate).toLocaleDateString()}</TableCell>
                                <TableCell>{assignment.expectedReturnDate ? new Date(assignment.expectedReturnDate).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                  <Chip label={status} color={getAssignmentStatusColor(status)} size="small" />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>You have no items assigned to you.</Typography>
                  )}
                </Card>
              </Grid>
            </>
          )}

          {/* Admin Reports */}
          {isAdminUser && reportType === 'inventory' && (
            <>
              <Grid item xs={12}>
                <Card sx={{ background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6">Inventory Overview</Typography>
                    <Typography variant="h4">{inventoryStats.total} Items</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                      {Object.entries(inventoryStats.byStatus).map(([status, count]) => {
                        const pct = inventoryStats.total ? Math.round((count / inventoryStats.total) * 100) : 0;
                        return (
                          <Box key={status}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">{status}</Typography>
                              <Typography variant="body2">{count} ({pct}%)</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 2, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>Inventory Details</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.serialNumber}</TableCell>
                            <TableCell>
                              <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                            </TableCell>
                            <TableCell>{item.location}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </>
          )}

          {isAdminUser && reportType === 'assignments' && (
            <>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Assignments Overview</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}><Typography>Total: {assignmentStats.total}</Typography></Grid>
                      <Grid item xs={6} md={3}><Typography>Active: {assignmentStats.active}</Typography></Grid>
                      <Grid item xs={6} md={3}><Typography>Returned: {assignmentStats.returned}</Typography></Grid>
                      <Grid item xs={6} md={3}><Typography color="error">Overdue: {assignmentStats.overdue}</Typography></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 2, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>Assignment Details</Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Assigned To</TableCell>
                          <TableCell>Assignment Date</TableCell>
                          <TableCell>Expected Return</TableCell>
                          <TableCell>Actual Return</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assignments.map((assignment) => {
                          const status = getAssignmentStatus(assignment);
                          return (
                            <TableRow key={assignment._id}>
                              <TableCell>{assignment.item?.itemName || 'N/A'}</TableCell>
                              <TableCell>{assignment.user?.fullName || 'N/A'}</TableCell>
                              <TableCell>{new Date(assignment.assignmentDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(assignment.expectedReturnDate).toLocaleDateString()}</TableCell>
                              <TableCell>{assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                <Chip label={status} color={getAssignmentStatusColor(status)} size="small" />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </>
          )}

          {isAdminUser && reportType === 'categories' && (
            <Grid item xs={12}>
              <Card sx={{ p: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Items by Category
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Total Items</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Assigned</TableCell>
                        <TableCell>Under Repair</TableCell>
                        <TableCell>Damaged</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(
                        items.reduce((acc, item) => {
                          if (!acc[item.category]) {
                            acc[item.category] = { total: 0, Available: 0, Assigned: 0, 'Under Repair': 0, Damaged: 0 };
                          }
                          acc[item.category].total++;
                          if (acc[item.category][item.status] !== undefined) {
                            acc[item.category][item.status]++;
                          }
                          return acc;
                        }, {})
                      ).map(([category, counts]) => (
                        // ... existing code
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell>{counts.total}</TableCell>
                          <TableCell>{counts.Available}</TableCell>
                          <TableCell>{counts.Assigned}</TableCell>
                          <TableCell>{counts['Under Repair']}</TableCell>
                          <TableCell>{counts.Damaged}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Reports;