import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Alert,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    item: null,
    employee: null,
    assignmentDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    condition: 'Good',
    notes: '',
    status: 'Active'
  });

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnData, setReturnData] = useState({ condition: 'Good', notes: '' });
  const [returningAssignment, setReturningAssignment] = useState(null);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
    fetchItems();
    fetchEmployees();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAssignments(response.data);
    } catch (error) {
      setError('Failed to fetch assignments');
      console.error('Error:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Only show available items for new assignments
      setItems(response.data.filter(item => item.status === 'Available'));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.item || !formData.employee) {
      setError('Please select both an item and an employee');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const assignmentData = {
        item: formData.item._id,
        employee: formData.employee._id,
        assignmentDate: formData.assignmentDate,
        expectedReturnDate: formData.expectedReturnDate || null,
        condition: formData.condition,
        notes: formData.notes,
        status: formData.status,
        assignedBy: user._id
      };

      console.log('Sending assignment data:', assignmentData); // Debug log

      if (editingAssignment) {
        await axios.put(`http://localhost:5000/api/assignments/${editingAssignment._id}`, assignmentData, config);
        setSuccess('Assignment updated successfully!');
      } else {
        const response = await axios.post('http://localhost:5000/api/assignments', assignmentData, config);
        console.log('Assignment created:', response.data); // Debug log
        setSuccess('Assignment created successfully!');
      }
      
      fetchAssignments();
      fetchItems(); // Refresh items to update availability
      handleClose();
    } catch (error) {
      console.error('Assignment error:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.response?.data?.message || 'Operation failed');
    }
    
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/assignments/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuccess('Assignment deleted successfully!');
        fetchAssignments();
        fetchItems(); // Refresh items to update availability
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete assignment');
      }
    }
  };

  const openReturnDialog = (assignment) => {
    setReturningAssignment(assignment);
    setReturnData({ condition: 'Good', notes: '' });
    setReturnDialogOpen(true);
  };

  const handleReturn = async () => {
    if (!returningAssignment) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/assignments/${returningAssignment._id}/return`, {
        condition: returnData.condition,
        notes: returnData.notes
      }, config);
      setSuccess('Assignment marked as returned');
      setReturnDialogOpen(false);
      setReturningAssignment(null);
      fetchAssignments();
      // Proactively refresh items so Inventory status updates for both admin and user views
      fetchItems();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to return assignment');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      item: assignment.item,
      employee: assignment.employee,
      assignmentDate: new Date(assignment.assignmentDate).toISOString().split('T')[0],
      expectedReturnDate: assignment.expectedReturnDate 
        ? new Date(assignment.expectedReturnDate).toISOString().split('T')[0] 
        : '',
      condition: assignment.condition,
      notes: assignment.notes || '',
      status: assignment.status
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAssignment(null);
    setFormData({
      item: null,
      employee: null,
      assignmentDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
      condition: 'Good',
      notes: '',
      status: 'Active'
    });
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
            Assignment Management
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

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Equipment Assignments ({assignments.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            New Assignment
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Equipment</strong></TableCell>
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Assigned Date</strong></TableCell>
                <TableCell><strong>Expected Return</strong></TableCell>
                <TableCell><strong>Condition</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {assignment.item?.itemName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {assignment.item?.brand} {assignment.item?.model}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {assignment.employee?.fullName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {assignment.employee?.department}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {assignment.expectedReturnDate 
                      ? new Date(assignment.expectedReturnDate).toLocaleDateString()
                      : 'Not specified'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.condition} 
                      color={getConditionColor(assignment.condition)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.status} 
                      color={getStatusColor(assignment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {(assignment.status === 'Active' || assignment.status === 'Overdue') && (
                      <IconButton 
                        onClick={() => openReturnDialog(assignment)}
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <AssignmentTurnedInIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      onClick={() => handleDelete(assignment._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No assignments found
                                       </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Assignment Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={items}
                    getOptionLabel={(option) => `${option.itemName} - ${option.serialNumber}`}
                    value={formData.item}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, item: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Equipment"
                        required
                        margin="normal"
                        fullWidth
                      />
                    )}
                    disabled={editingAssignment} // Can't change item in edit mode
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={employees}
                    getOptionLabel={(option) => `${option.fullName} - ${option.department}`}
                    value={formData.employee}
                    onChange={(event, newValue) => {
                      setFormData({ ...formData, employee: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Employee"
                        required
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="assignmentDate"
                    label="Assignment Date"
                    type="date"
                    value={formData.assignmentDate}
                    onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="expectedReturnDate"
                    label="Expected Return Date"
                    type="date"
                    value={formData.expectedReturnDate}
                    onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      name="condition"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      label="Condition"
                    >
                      <MenuItem value="Excellent">Excellent</MenuItem>
                      <MenuItem value="Good">Good</MenuItem>
                      <MenuItem value="Fair">Fair</MenuItem>
                      <MenuItem value="Poor">Poor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Returned">Returned</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    placeholder="Additional notes about the assignment..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !formData.item || !formData.employee}
              >
                {loading ? 'Saving...' : (editingAssignment ? 'Update' : 'Assign')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>

      {/* Return Assignment Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark as Returned</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Condition</InputLabel>
            <Select
              value={returnData.condition}
              label="Condition"
              onChange={(e) => setReturnData({ ...returnData, condition: e.target.value })}
            >
              <MenuItem value="Excellent">Excellent</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Fair">Fair</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Notes (optional)"
            value={returnData.notes}
            onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReturn} variant="contained">Confirm Return</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Assignments;