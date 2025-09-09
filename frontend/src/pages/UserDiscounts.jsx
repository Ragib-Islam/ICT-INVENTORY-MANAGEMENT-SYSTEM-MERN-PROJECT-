import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../library/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { AppBar, Toolbar, IconButton, Container, Typography, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip, Alert, Box } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Logout as LogoutIcon, Brightness4, Brightness7, LocalOffer as OfferIcon } from '@mui/icons-material';

const UserDiscounts = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const token = getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/discounts/my', config);
      setList(res.data);
      setError('');
    } catch (e) {
      setError('Failed to load discounts');
    }
  };

  useEffect(() => { load(); }, []);
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

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', overflow: 'auto' }}>
      <AppBar position="static" elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/home')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            My Discounts
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
        <Card sx={{ p: 2, background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Percent</TableCell>
                    <TableCell>Original</TableCell>
                    <TableCell>Discounted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map(d => (
                    <TableRow key={d._id}>
                      <TableCell>{d.item?.itemName}</TableCell>
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
      </Container>
    </Box>
  );
};

export default UserDiscounts;


