import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Hàm tiện ích để lấy header xác thực
const getAuthHeaders = (includeUserId = false) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const headers = {
    Authorization: `Bearer ${token || ''}`,
    'Content-Type': 'application/json',
  };
  if (includeUserId && userId) {
    headers['X-User-Id'] = userId; // Chỉ bao gồm nếu backend yêu cầu
  }
  return headers;
};

// API Chuyến bay
export const getFlights = () => {
  return axios.get(`${API_URL}/flights`, { headers: getAuthHeaders() });
};

export const searchFlights = (data) => {
 return axios.post(`${API_URL}/flights/search`, data, { headers: getAuthHeaders() });
};

export const getFlight = (id) => {
  return axios.get(`${API_URL}/flights/${id}`, { headers: getAuthHeaders() });
};

export const delayFlight = (id, data) => {
  return axios.put(`${API_URL}/flights/${id}/delay`, data, { headers: getAuthHeaders() });
};

export const createFlight = (data) => {
  return axios.post(`${API_URL}/flights`, data, { headers: getAuthHeaders() });
};

// API Vé
export const bookTicket = (data) => {
  return axios.post(`${API_URL}/tickets/book`, data, { headers: getAuthHeaders(true) });
};

export const bookMultipleTickets = (data) => {
  return axios.post(`${API_URL}/tickets/book-multiple`, data, { headers: getAuthHeaders(true) });
};

export const cancelTicket = (id) => {
  return axios.post(`${API_URL}/tickets/${id}/cancel`, {}, { headers: getAuthHeaders(true) });
};

export const confirmTicket = (id) => {
  return axios.post(`${API_URL}/tickets/${id}/confirm`, {}, { headers: getAuthHeaders(true) });
};

export const trackTicket = (code) => {
  return axios.get(`${API_URL}/tickets/code/${code}`, { headers: getAuthHeaders(true) });
};

export const getTickets = () => {
  const email = localStorage.getItem('email');
  if (!email) {
    return Promise.reject(new Error('Không tìm thấy email trong localStorage'));
  }
  return axios.get(`${API_URL}/tickets/email/${email}`, { headers: getAuthHeaders(true) });
};

// API Khách hàng
export const createCustomer = (data) => {
  return axios.post(`${API_URL}/customer`, data, { headers: getAuthHeaders(true) });
};

// API Xác thực
export const loginEmployee = (data) => {
  const payload = {
    email: data.email,
    password: data.password,
  };
  return axios.post(`${API_URL}/employee/login`, payload, { headers: getAuthHeaders() });
};

export const loginCustomer = (data) => {
  const payload = {
    email: data.email,
    password: data.password,
  };
  return axios.post(`${API_URL}/customer/login`, payload, { headers: getAuthHeaders() });
};

export const registerCustomer = (data) => {
  const payload = {
    username: data.username || '',
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name || '',
  };
  return axios.post(`${API_URL}/customer/register`, payload, { headers: getAuthHeaders() });
};

export const logoutEmployee = () => {
  return axios.post(`${API_URL}/employee/logout`, {}, { headers: getAuthHeaders() });
};

export const logoutCustomer = () => {
  return axios.post(`${API_URL}/customer/logout`, {}, { headers: getAuthHeaders() });
};

// API Thông báo
export const getAnnouncements = () => {
  return axios.get(`${API_URL}/announcements`, { headers: getAuthHeaders() });
};

export const createAnnouncement = (data) => {
  return axios.post(`${API_URL}/announcements`, data, { headers: getAuthHeaders() });
};

export const updateAnnouncement = (id, data) => {
  return axios.put(`${API_URL}/announcements/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteAnnouncement = (id) => {
  return axios.delete(`${API_URL}/announcements/${id}`, { headers: getAuthHeaders() });
};

// API Máy bay
export const getAircrafts = () => {
  return axios.get(`${API_URL}/aircrafts`, { headers: getAuthHeaders() });
};

export const getAircraftById = (id) => {
  return axios.get(`${API_URL}/aircrafts/${id}`, { headers: getAuthHeaders() });
};

export const createAircraft = (data) => {
  return axios.post(`${API_URL}/aircrafts`, data, { headers: getAuthHeaders() });
};

export const updateAircraft = (id, data) => {
  return axios.put(`${API_URL}/aircrafts/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteAircraft = (id) => {
  return axios.delete(`${API_URL}/aircrafts/${id}`, { headers: getAuthHeaders() });
};

// API Hạng vé
export const getTicketClasses = () => {
  return axios.get(`${API_URL}/ticket-classes`, { headers: getAuthHeaders() });
};

export const createTicketClass = (data) => {
  return axios.post(`${API_URL}/ticket-classes`, data, { headers: getAuthHeaders() });
};

export const updateTicketClass = (id, data) => {
  return axios.put(`${API_URL}/ticket-classes/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteTicketClass = (id) => {
  return axios.delete(`${API_URL}/ticket-classes/${id}`, { headers: getAuthHeaders() });
};

export const getPerksForTicketClass = (id) => {
  return axios.get(`${API_URL}/ticket-classes/${id}/perks`, { headers: getAuthHeaders() });
};

// API Bảng điều khiển Admin
export const getAdminStats = () => {
  return axios.get(`${API_URL}/stats`, { headers: getAuthHeaders(true) });
};

export const getRecentBookings = () => {
  return axios.get(`${API_URL}/recent-bookings`, { headers: getAuthHeaders(true) });
};

export const getUpcomingFlights = () => {
  return axios.get(`${API_URL}/upcoming-flights`, { headers: getAuthHeaders(true) });
};

export const getBookingTrends = () => {
  return axios.get(`${API_URL}/booking-trends`, { headers: getAuthHeaders(true) });
};

export const getTicketStats = () => {
  return axios.get(`${API_URL}/tickets/stats`, { headers: getAuthHeaders(true) });
};

// API Điểm đến
export const getDestinations = () => {
  // TODO: Backend thiếu endpoint GET /destinations
  // Comment lại cho đến khi backend được cập nhật
  // return axios.get(`${API_URL}/destinations`, { headers: getAuthHeaders() });
  return Promise.reject(new Error('GET /destinations chưa được triển khai trong backend'));
};

// API Hãng hàng không
export const getAirlines = () => {
  // Khớp với GET /airlines
  return axios.get(`${API_URL}/airlines`, { headers: getAuthHeaders() });
};

export const createAirline = (data) => {
  return axios.post(`${API_URL}/airlines`, data, { headers: getAuthHeaders() });
};

// API Tuyến bay
export const getRoutes = () => {
  return axios.get(`${API_URL}/routes`, { headers: getAuthHeaders() });
};

export const createRoute = (data) => {
  return axios.post(`${API_URL}/routes`, data, { headers: getAuthHeaders() });
};

// API Sân bay
export const getAirports = async () => {
  try {
    const response = await axios.get(`${API_URL}/airports`, {
      headers: getAuthHeaders(),
      // Giữ các header kiểm soát cache cho đồng bộ
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return response.data;
  } catch (error) {
    throw new Error(`Lỗi HTTP! Trạng thái: ${error.response?.status || error.message}`);
  }
};