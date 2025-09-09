import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import {
  AppBar, Toolbar, IconButton, Container, Typography, Card, CardContent, Grid, Alert,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip, TextField, Button,
  Box
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon, LocalOffer as OfferIcon, Brightness4, Brightness7 } from '@mui/icons-material';

const AdminDiscounts = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ item: null, user: null, date: '' });

  const load = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const [itemsRes, usersRes, listRes] = await Promise.allSettled([
      axios.get('http://localhost:5000/api/items', config),
      axios.get('http://localhost:5000/api/users/employees', config),
      axios.get('http://localhost:5000/api/discounts', config)
    ]);
    if (itemsRes.status === 'fulfilled') {
      setItems((itemsRes.value.data || []).filter(i => i.status === 'Available'));
    }
    if (usersRes.status === 'fulfilled') {
      setUsers(usersRes.value.data || []);
    }
    if (listRes.status === 'fulfilled') {
      setDiscounts(listRes.value.data || []);
    }
    if (itemsRes.status === 'rejected' || usersRes.status === 'rejected' || listRes.status === 'rejected') {
      setError('Failed to load data');
    } else {
      setError('');
    }
  };

  // Only load data if admin; otherwise redirect
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/home');
      return;
    }
    load();
  }, [isAdmin, navigate]);

  // Refresh data when returning to the tab/window
  useEffect(() => {
    const onFocus = () => load();
    const onVisibility = () => { if (!document.hidden) load(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.item || !form.user || !form.date) { setError('Select item, user and date'); return; }
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/discounts', {
        itemId: form.item._id,
        userId: form.user._id,
        date: form.date
      }, config);
      setSuccess('Discount assigned');
      setForm({ item: null, user: null, date: '' });
      await load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to assign discount');
    }
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', overflow: 'auto' }}>
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin-dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Discounts
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
                <Typography variant="h6" gutterBottom>Assign Discount</Typography>
                <form onSubmit={submit}>
                  <Autocomplete options={items} getOptionLabel={(o) => `${o.itemName} - ${o.serialNumber}`} value={form.item} onChange={(e,v)=>setForm({...form,item:v})} renderInput={(p)=>(<TextField {...p} label="Select Item" required margin="normal" fullWidth />)} />
                  <Autocomplete options={users} getOptionLabel={(o) => `${o.fullName} - ${o.department||''}`} value={form.user} onChange={(e,v)=>setForm({...form,user:v})} renderInput={(p)=>(<TextField {...p} label="Select User" required margin="normal" fullWidth />)} />
                  <TextField type="date" label="Discount Date (1-15)" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} fullWidth margin="normal" InputLabelProps={{ shrink:true }} required />
                  <Button type="submit" variant="contained" startIcon={<OfferIcon />} sx={{ mt: 1 }}>Assign</Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Discounts</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Percent</TableCell>
                        <TableCell>Original</TableCell>
                        <TableCell>Discounted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {discounts.map(d => (
                        <TableRow key={d._id}>
                          <TableCell>{d.item?.itemName}</TableCell>
                          <TableCell>{d.assignedTo?.fullName}</TableCell>
                          <TableCell>{new Date(d.date).toLocaleDateString()}</TableCell>
                          <TableCell><Chip label={`${d.percent}%`} size="small" /></TableCell>
                          <TableCell>{d.originalPrice}</TableCell>
                          <TableCell>{d.discountedPrice}</TableCell>
                        </TableRow>
                      ))}
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

export default AdminDiscounts;


