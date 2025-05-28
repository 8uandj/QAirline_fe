import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFlights = () => axios.get(`${API_URL}/flights`, { headers: getAuthHeaders() });
export const getFlight = (id) => axios.get(`${API_URL}/flights/${id}`, { headers: getAuthHeaders() });
export const deleteFlight = (id) => axios.delete(`${API_URL}/flights/${id}`, { headers: getAuthHeaders() });
export const getLocations = () => axios.get(`${API_URL}/locations`, { headers: getAuthHeaders() });
export const getTickets = () => axios.get(`${API_URL}/tickets`, { headers: getAuthHeaders() });
export const bookTicket = (data) => axios.post(`${API_URL}/tickets`, data, { headers: getAuthHeaders() });
export const cancelTicket = (id) => axios.delete(`${API_URL}/tickets/${id}`, { headers: getAuthHeaders() });
export const getTicketStats = () => axios.get(`${API_URL}/tickets/stats`, { headers: getAuthHeaders() });
export const login = (data) => axios.post(`${API_URL}/auth/login`, data);
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const getPromotions = () => axios.get(`${API_URL}/promotions`, { headers: getAuthHeaders() });