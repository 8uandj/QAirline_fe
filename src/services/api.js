import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = (includeUserId = false) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const headers = {
        Authorization: `Bearer ${token || ''}`
    };
    if (includeUserId && userId) {
        headers['X-User-Id'] = userId;
    }
    return headers;
};

// Flight APIs
export const getFlights = () => axios.get(`${API_URL}/flights`, { headers: getAuthHeaders() });
export const getFlight = (id) => axios.get(`${API_URL}/flights/${id}`, { headers: getAuthHeaders() });
export const searchFlights = (query) => axios.get(`${API_URL}/flights/search/query`, { params: query, headers: getAuthHeaders() });
export const delayFlight = (id, data) => axios.put(`${API_URL}/flights/${id}/delay`, data, { headers: getAuthHeaders() });
export const createFlight = (data) => axios.post(`${API_URL}/flights`, data, { headers: getAuthHeaders() });

// Ticket APIs
export const bookTicket = (data) => axios.post(`${API_URL}/tickets`, data, { headers: getAuthHeaders(true) });
export const cancelTicket = (id) => axios.put(`${API_URL}/tickets/${id}/cancel`, {}, { headers: getAuthHeaders(true) });
export const trackTicket = (code) => axios.get(`${API_URL}/tickets/track/${code}`, { headers: getAuthHeaders(true) });
export const getTickets = () => axios.get(`${API_URL}/tickets`, { headers: getAuthHeaders(true) });
export const getTicketStats = () => axios.get(`${API_URL}/ticket-stats`, { headers: getAuthHeaders(true) });

// Customer APIs
export const createCustomer = (data) => axios.post(`${API_URL}/customers`, data, { headers: getAuthHeaders(true) });

// Auth APIs
export const login = (data) => axios.post(`${API_URL}/auth/login`, data);
export const register = (data) => axios.post(`${API_URL}/auth/register`, data);

// Announcement APIs
export const getAnnouncements = () => axios.get(`${API_URL}/announcements`, { headers: getAuthHeaders() });
export const createAnnouncement = (data) => axios.post(`${API_URL}/announcements`, data, { headers: getAuthHeaders() });

// Aircraft APIs
export const getAircrafts = () => axios.get(`${API_URL}/aircrafts`, { headers: getAuthHeaders() });
export const createAircraft = (data) => axios.post(`${API_URL}/aircrafts`, data, { headers: getAuthHeaders() });

// Ticket Class APIs
export const getTicketClasses = () => axios.get(`${API_URL}/ticket-classes`, { headers: getAuthHeaders() });

// Admin Dashboard APIs
export const getAdminStats = () => axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeaders(true) });
export const getRecentBookings = () => axios.get(`${API_URL}/admin/recent-bookings`, { headers: getAuthHeaders(true) });
export const getUpcomingFlights = () => axios.get(`${API_URL}/admin/upcoming-flights`, { headers: getAuthHeaders(true) });
export const getBookingTrends = () => axios.get(`${API_URL}/admin/booking-trends`, { headers: getAuthHeaders(true) });