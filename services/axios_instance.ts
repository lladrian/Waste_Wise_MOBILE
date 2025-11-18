import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://waste-wise-backend-chi.vercel.app',
  //baseURL: 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true, // if using cookies for auth
});

// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default instance;