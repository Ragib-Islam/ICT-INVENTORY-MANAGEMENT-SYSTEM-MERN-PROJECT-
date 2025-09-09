import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('User');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({ fullName, email, password, username, department, employeeId, role });
    setLoading(false);
    if (result.success) {
      const role = result.user?.role;
      if (role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <PersonAddIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1" fontWeight="bold">
            Create an Account
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Username (optional)"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Department (optional)"
            fullWidth
            margin="normal"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <TextField
            label="Employee ID (optional)"
            fullWidth
            margin="normal"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Button
            onClick={() => navigate('/login')}
            fullWidth
            sx={{ mt: 1 }}
          >
            Already have an account? Log in
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;


