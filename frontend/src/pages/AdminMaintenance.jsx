import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import {
  AppBar, Toolbar, IconButton, Container, Typography, Card, CardContent, Grid, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Box
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon, Build as BuildIcon, Brightness4, Brightness7 } from '@mui/icons-material';

const AdminMaintenance = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState({}); // id -> { status, dueDate }

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/maintenance', config);
      setRequests(res.data);
    } catch (e) {
      setError('Failed to load maintenance requests');
    }
  };

  useEffect(() => { load(); }, []);

  const setField = (id, field, value) => {
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const saveRow = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = editing[id] || {};
      await axios.put(`http://localhost:5000/api/maintenance/${id}`, body, config);
      setSuccess('Updated');
      await load();
    } catch (e) {
      setError(e.response?.data?.error || 'Update failed');
    }
  };

  const statusColor = (s) => (s === 'Resolved' ? 'success' : s === 'In Progress' ? 'warning' : 'default');

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
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin-dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Maintenance Requests
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card sx={{ p: 2, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>All Requests</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.item?.itemName} ({r.item?.serialNumber})</TableCell>
                      <TableCell>{r.requestedBy?.fullName}</TableCell>
                      <TableCell><Chip label={r.priority} size="small" /></TableCell>
                      <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" /></TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          size="small"
                          value={(editing[r._id]?.dueDate) || (r.dueDate ? new Date(r.dueDate).toISOString().split('T')[0] : '')}
                          onChange={(e) => setField(r._id, 'dueDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ mr: 1, minWidth: 140 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            label="Status"
                            value={(editing[r._id]?.status) || r.status}
                            onChange={(e) => setField(r._id, 'status', e.target.value)}
                          >
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                          </Select>
                        </FormControl>
                        <Button variant="contained" startIcon={<BuildIcon />} onClick={() => saveRow(r._id)}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminMaintenance;


