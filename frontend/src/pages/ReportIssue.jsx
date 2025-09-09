import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import {
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Box
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon, ReportProblem as ReportIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';

const ReportIssue = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const [items, setItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ item: null, priority: 'Low', notes: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [itemsRes, myRes] = await Promise.all([
          axios.get('http://localhost:5000/api/items', config),
          axios.get('http://localhost:5000/api/maintenance/my', config)
        ]);
        setItems(itemsRes.data);
        setMyRequests(myRes.data);
      } catch (e) {
        setError('Failed to load data');
      }
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.item) {
      setError('Please select an item');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { item: form.item._id, priority: form.priority, notes: form.notes };
      await axios.post('http://localhost:5000/api/maintenance', body, config);
      setSuccess('Issue reported successfully');
      setForm({ item: null, priority: 'Low', notes: '' });
      const mine = await axios.get('http://localhost:5000/api/maintenance/my', config);
      setMyRequests(mine.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false);
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
          <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Report Issue
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 2, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  New Maintenance Request
                </Typography>
                <form onSubmit={submit}>
                  <Autocomplete
                    options={items}
                    getOptionLabel={(opt) => `${opt.itemName} - ${opt.serialNumber}`}
                    value={form.item}
                    onChange={(e, val) => setForm({ ...form, item: val })}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Item" required margin="normal" fullWidth />
                    )}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Priority</InputLabel>
                    <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Describe the issue"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                  />
                  <Button type="submit" variant="contained" startIcon={<ReportIcon />} disabled={loading} sx={{ mt: 1 }}>
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>My Requests</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myRequests.map((r) => (
                        <TableRow key={r._id}>
                          <TableCell>{r.item?.itemName} ({r.item?.serialNumber})</TableCell>
                          <TableCell><Chip label={r.priority} size="small" /></TableCell>
                          <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" /></TableCell>
                          <TableCell>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {myRequests.length === 0 && (
                        <TableRow><TableCell colSpan={4}>No requests yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ReportIssue;


