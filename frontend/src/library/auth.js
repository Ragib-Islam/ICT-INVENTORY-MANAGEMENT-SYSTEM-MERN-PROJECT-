export const getToken = () => {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

export const setSessionAuth = (token, user) => {
  if (token) sessionStorage.setItem('token', token);
  if (user) sessionStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};


