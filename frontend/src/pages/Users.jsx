import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    employeeId: ''
  });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        employeeId: formData.employeeId
      };

      if (!editingUser) {
        userData.password = formData.password;
      }

      if (editingUser) {
        await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, userData, config);
        setSuccess('User updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/auth/register', userData, config);
        setSuccess('User created successfully!');
      }
      
      fetchUsers();
      handleClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed');
      console.error('Error:', error.response?.data);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuccess('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      fullName: userToEdit.fullName,
      email: userToEdit.email,
      password: '',
      role: userToEdit.role,
      department: userToEdit.department || '',
      employeeId: userToEdit.employeeId || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'Employee',
      department: '',
      employeeId: ''
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Manager': return 'warning';
      case 'Employee': return 'primary';
      default: return 'default';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/admin-dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            User Management
          </Typography>
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

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            System Users ({users.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add New User
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Employee ID</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem._id}>
                  <TableCell>{userItem.fullName}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={userItem.role} 
                      color={getRoleColor(userItem.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{userItem.department || 'N/A'}</TableCell>
                  <TableCell>{userItem.employeeId || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(userItem)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    {userItem._id !== user._id && (
                      <IconButton 
                        onClick={() => handleDelete(userItem._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit User Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="fullName"
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
                {!editingUser && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="password"
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      fullWidth
                      required
                      margin="normal"
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      label="Role"
                    >
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Employee">Employee</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="department"
                    label="Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="employeeId"
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingUser ? 'Update' : 'Add')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
};

export default Users;