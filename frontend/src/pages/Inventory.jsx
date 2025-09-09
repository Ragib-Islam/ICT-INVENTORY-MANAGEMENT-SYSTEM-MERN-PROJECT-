import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Brightness4,
  Brightness7
} from '@mui/icons-material';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    status: 'Available',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    description: ''
  });

  // Filtering and searching state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { logout, user, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/items', config);
      setItems(res.data);
    } catch (err) {
      setError('Failed to fetch inventory items. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Refresh when window regains focus or tab becomes visible
  useEffect(() => {
    const onFocus = () => fetchItems();
    const onVisibility = () => { if (!document.hidden) fetchItems(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Assigned': return 'primary';
      case 'Under Repair': return 'warning';
      case 'Damaged': return 'error';
      case 'Disposed': return 'default';
      default: return 'secondary';
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()));

      const categoryMatch = filterCategory === '' || item.category === filterCategory;
      const statusMatch = filterStatus === '' || item.status === filterStatus;

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [items, searchTerm, filterCategory, filterStatus]);

  const handleOpen = () => {
    setEditingItem(null);
    setFormData({
      name: '', category: '', brand: '', model: '', serialNumber: '',
      status: 'Available', location: '', purchaseDate: '', purchasePrice: '', description: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.itemName,
      category: item.category,
      brand: item.brand || '',
      model: item.model || '',
      serialNumber: item.serialNumber,
      status: item.status,
      location: item.location,
      purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: item.purchasePrice || '',
      description: item.description || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/items/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchItems(); // Refresh list
      } catch (err) {
        setError('Failed to delete item.');
        console.error(err);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    
    const normalizeDate = (value) => {
      if (!value) return null;
      // Accept formats: yyyy-mm-dd (native) or dd/mm/yyyy (typed)
      if (value.includes('-')) return value; // assume browser date format
      if (value.includes('/')) {
        const [dd, mm, yyyy] = value.split('/');
        if (dd && mm && yyyy) {
          const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
          if (!isNaN(d.getTime())) return d.toISOString();
        }
      }
      return value;
    };

    const payload = {
      itemName: formData.name,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      status: formData.status,
      location: formData.location,
      purchaseDate: normalizeDate(formData.purchaseDate),
      purchasePrice: formData.purchasePrice || null,
      description: formData.description
    };

    // ... existing code
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/items/${editingItem._id}`, payload, config);
      } else {
        await axios.post('http://localhost:5000/api/items', payload, config);
      }
      fetchItems();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || `Failed to ${editingItem ? 'update' : 'add'} item.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const statuses = ['Available', 'Assigned', 'Under Repair', 'Damaged', 'Disposed'];

  // Dialog for status change & history
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusItem, setStatusItem] = useState(null);
  const [newStatus, setNewStatus] = useState('Available');
  const [statusNote, setStatusNote] = useState('');
  const [history, setHistory] = useState([]);

  const openStatusDialog = async (item) => {
    setStatusItem(item);
    setNewStatus(item.status);
    setStatusNote('');
    setHistory([]);
    setStatusOpen(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5000/api/items/${item._id}/status/history`, config);
      setHistory(res.data);
    } catch {}
  };

  const submitStatus = async () => {
    if (!statusItem) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
      await axios.put(`http://localhost:5000/api/items/${statusItem._id}/status`, { status: newStatus, note: statusNote }, config);
      setStatusOpen(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading && items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
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
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Inventory Management
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <AdminIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              {user?.fullName} ({user?.role})
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper sx={{ p: 2, mb: 3, background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search by Name, S/N, Brand..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {uniqueCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {statuses.map(stat => <MenuItem key={stat} value={stat}>{stat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterStatus(''); }}
              >
                Clear Filters
              </Button>
            </Grid>
            {isAdmin() && (
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpen}
                >
                  Add Item
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>

        <TableContainer component={Paper} sx={{ background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="inventory table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                {isAdmin() && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">{item.itemName}</Typography>
                    <Typography variant="caption" color="textSecondary">{item.brand} {item.model}</Typography>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.serialNumber}</TableCell>
                  <TableCell>
                    <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  {isAdmin() && (
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(item)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(item._id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                      <Button size="small" sx={{ ml: 1 }} onClick={() => openStatusDialog(item)}>Status</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField name="name" label="Item Name" value={formData.name} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="category" label="Category" value={formData.category} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="brand" label="Brand" value={formData.brand} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="model" label="Model" value={formData.model} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="serialNumber" label="Serial Number" value={formData.serialNumber} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      {statuses.map(stat => <MenuItem key={stat} value={stat}>{stat}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="location" label="Location" value={formData.location} onChange={handleChange} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="purchaseDate"
                    label="Purchase Date"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="purchasePrice"
                    label="Purchase Price"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : (editingItem ? 'Save Changes' : 'Add Item')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Status dialog */}
        <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Update Status</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>New Status</InputLabel>
                  <Select value={newStatus} label="New Status" onChange={(e) => setNewStatus(e.target.value)}>
                    {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Note (optional)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Recent History</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>By</TableCell>
                      <TableCell>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map(h => (
                      <TableRow key={h._id}>
                        <TableCell>{new Date(h.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{h.fromStatus}</TableCell>
                        <TableCell>{h.toStatus}</TableCell>
                        <TableCell>{h.changedBy?.fullName || '-'}</TableCell>
                        <TableCell>{h.note || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {history.length === 0 && (
                      <TableRow><TableCell colSpan={5}>No history</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button onClick={submitStatus} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Inventory;