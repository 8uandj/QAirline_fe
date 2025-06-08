import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { bookMultipleTickets, bookTicket } from '../services/api';

const API_URL = 'http://localhost:3000';

const classTypeNames = {
  economy: 'Phổ thông',
  business: 'Thương gia',
  first: 'Hạng nhất',
};

const classTypeToName = {
  economy: 'Economy Class',
  business: 'Business Class',
  first: 'First Class',
};

const normalizeClassName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '');
};

const calculatePrice = (basePrice, ticketType, quantity = 1) => {
  let price = basePrice || 0;
  if (ticketType.classType === 'business') price *= 1.5;
  else if (ticketType.classType === 'first') price *= 2;
  if (ticketType.tripType === 'round-trip') price *= 2;
  return price * quantity;
};

function Booking() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const flight = location.state?.flight || null;
  const ticketType = location.state?.ticketType || { tripType: 'one-way', classType: 'economy' };
  const quantityFromState = location.state?.quantity || 1;
  const seatIdsFromState = Array.isArray(location.state?.seatIds) ? location.state.seatIds : [];
  const passengersFromState = Array.isArray(location.state?.passengers) ? location.state.passengers : [];

  const [passengers, setPassengers] = useState(
    passengersFromState.length > 0
      ? passengersFromState
      : Array(quantityFromState).fill().map(() => ({
          email: '',
          isNewCustomer: false,
          customer: null,
          formData: {
            first_name: '',
            last_name: '',
            password: '',
            gender: '',
            birth_date: '',
            identity_number: '',
            phone_number: '',
            address: '',
            country: '',
          },
          formErrors: {},
        }))
  );
  const [ticketClasses, setTicketClasses] = useState([]);
  const [ticketCode, setTicketCode] = useState(null);
  const [quantity, setQuantity] = useState(quantityFromState);
  const [seatIds, setSeatIds] = useState(seatIdsFromState);
  const [step, setStep] = useState(seatIdsFromState.length > 0 ? 3 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayPrice = calculatePrice(flight?.base_economy_class_price, ticketType, quantity);
  const cancellationDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
    localStorage.setItem('bookingData', JSON.stringify({ passengers, seatIds, quantity, flight, ticketType }));
  }, [passengers, seatIds, quantity, flight, ticketType]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('bookingData'));
    if (savedData && savedData.flight?.id === flightId) {
      console.log('📊 Khôi phục dữ liệu từ localStorage:', savedData);
      setPassengers(savedData.passengers || passengers);
      setSeatIds(savedData.seatIds || seatIds);
      setQuantity(savedData.quantity || quantity);
    }
  }, [flightId]);

  useEffect(() => {
    const fetchTicketClasses = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/ticket-classes`);
        console.log('📊 Ticket classes response:', res.data);
        const classes = res.data.data || [];
        if (!classes.length) {
          setError('Không thể tải danh sách hạng vé.');
        }
        setTicketClasses(classes);
      } catch (err) {
        console.error('Error fetching ticket classes:', err);
        setError('Không thể tải danh sách hạng vé: ' + err.message);
      }
    };
    fetchTicketClasses();
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newPassengers = [...passengers];
      let hasError = false;

      for (let index = 0; index < passengers.length; index++) {
        const passengerEmail = passengers[index].email;
        if (!passengerEmail) {
          setError(`Vui lòng nhập email cho hành khách ${index + 1}.`);
          hasError = true;
          continue;
        }
        console.log(`📊 Kiểm tra email cho hành khách ${index + 1}:`, passengerEmail);
        try {
          const res = await axios.get(`${API_URL}/api/check-email?email=${passengerEmail}`);
          console.log(`📊 Kết quả kiểm tra email cho hành khách ${index + 1}:`, res.data);

          newPassengers[index].email = passengerEmail;
          if (res.data.exists) {
            const customerRes = await axios.get(`${API_URL}/api/customer/by-email/${passengerEmail}`);
            if (!customerRes.data.success) {
              setError(`Không thể lấy thông tin khách hàng cho hành khách ${index + 1}.`);
              hasError = true;
              continue;
            }
            console.log(`📊 Dữ liệu khách hàng cho hành khách ${index + 1}:`, customerRes.data.data);
            newPassengers[index].customer = customerRes.data.data;
            newPassengers[index].isNewCustomer = false;
          } else {
            newPassengers[index].isNewCustomer = true;
          }
        } catch (err) {
          console.error(`Lỗi kiểm tra email cho hành khách ${index + 1}:`, err);
          setError(`Không thể kiểm tra email cho hành khách ${index + 1}: ${err.response?.data?.error || err.message}`);
          hasError = true;
        }
      }

      if (hasError) {
        setLoading(false);
        return;
      }

      setPassengers(newPassengers);
      const allEmailsSubmitted = newPassengers.every((p) => p.email && (p.customer || p.isNewCustomer));
      if (allEmailsSubmitted) {
        setStep(2);
      } else {
        setError('Vui lòng hoàn thành kiểm tra email cho tất cả hành khách.');
      }
    } catch (err) {
      console.error('Lỗi chung khi kiểm tra email:', err);
      setError(`Lỗi hệ thống: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newPassengers = [...passengers];
      let hasError = false;

      for (let index = 0; index < passengers.length; index++) {
        const errors = validateForm(passengers[index].formData, passengers[index].isNewCustomer);
        if (Object.keys(errors).length > 0) {
          newPassengers[index].formErrors = errors;
          hasError = true;
          continue;
        }

        const passenger = newPassengers[index];
        if (passenger.isNewCustomer) {
          const customerData = {
            first_name: passenger.formData.first_name,
            last_name: passenger.formData.last_name,
            email: passenger.email,
            password: passenger.formData.password,
            username: passenger.email.split('@')[0],
            gender: passenger.formData.gender || null,
            birth_date: passenger.formData.birth_date || null,
            identity_number: passenger.formData.identity_number || null,
            phone_number: passenger.formData.phone_number || null,
            address: passenger.formData.address || null,
            country: passenger.formData.country || null,
          };
          console.log(`📊 Gửi dữ liệu khách hàng cho hành khách ${index + 1}:`, customerData);
          try {
            const res = await axios.post(`${API_URL}/api/customer/register`, customerData);
            passenger.customer = res.data.user;
          } catch (err) {
            console.error(`Lỗi đăng ký cho hành khách ${index + 1}:`, err);
            setError(`Không thể đăng ký hành khách ${index + 1}: ${err.response?.data?.error || err.message}`);
            hasError = true;
            continue;
          }
        } else {
          passenger.customer = {
            ...passenger.customer,
            first_name: passenger.formData.first_name,
            last_name: passenger.formData.last_name,
            gender: passenger.formData.gender || null,
            birth_date: passenger.formData.birth_date,
            identity_number: passenger.formData.identity_number,
            phone_number: passenger.formData.phone_number,
            address: passenger.formData.address,
            country: passenger.formData.country,
          };
        }
        passenger.formErrors = {};
      }

      if (hasError) {
        setPassengers(newPassengers);
        setLoading(false);
        return;
      }

      setPassengers(newPassengers);
      const allDetailsSubmitted = newPassengers.every((p) => p.customer && p.email);
      if (allDetailsSubmitted) {
        navigate(`/seat-selection/${flightId}`, {
          state: { flight, ticketType, quantity: quantityFromState, passengers: newPassengers },
        });
      } else {
        setError('Vui lòng hoàn thành thông tin cho tất cả hành khách trước khi tiếp tục.');
      }
    } catch (err) {
      console.error('Lỗi chung khi xử lý thông tin:', err);
      setError(`Lỗi hệ thống: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (formData, isNewCustomer) => {
    const errors = {};
    if (!formData.first_name) errors.first_name = 'Họ là bắt buộc';
    if (!formData.last_name) errors.last_name = 'Tên là bắt buộc';
    if (isNewCustomer && !formData.password) errors.password = 'Mật khẩu là bắt buộc';
    if (formData.gender && !['Male', 'Female', 'Other'].includes(formData.gender)) {
      errors.gender = 'Giới tính không hợp lệ';
    }
    return errors;
  };

  const handleInputChange = (e, passengerIndex) => {
    const { name, value } = e.target;
    setPassengers((prev) => {
      const newPassengers = [...prev];
      newPassengers[passengerIndex].formData[name] = value;
      newPassengers[passengerIndex].formErrors[name] = null;
      return newPassengers;
    });
  };

  const handleEmailChange = (e, passengerIndex) => {
    const { value } = e.target;
    setPassengers((prev) => {
      const newPassengers = [...prev];
      newPassengers[passengerIndex].email = value;
      return newPassengers;
    });
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const targetClassName = classTypeToName[ticketType.classType] || 'Economy Class';
      const selectedClass = ticketClasses.find((cls) =>
        normalizeClassName(cls.class_name) === normalizeClassName(targetClassName)
      );
      if (!selectedClass) {
        throw new Error('Hạng vé không hợp lệ');
      }

      if (seatIds.length !== quantity) {
        throw new Error(`Số ghế chọn (${seatIds.length}) không khớp với số lượng vé (${quantity})`);
      }

      const seatCheckRes = await axios.get(`${API_URL}/api/seats/${flightId}`);
      console.log('📊 seatCheckRes.data:', seatCheckRes.data);

      let allSeats = [];
      if (Array.isArray(seatCheckRes.data.data)) {
        allSeats = seatCheckRes.data.data.flatMap((cls) => cls.seats || []);
      } else if (typeof seatCheckRes.data.data === 'object') {
        allSeats = Object.values(seatCheckRes.data.data).flatMap((cls) => cls.flatMap((cabin) => cabin.seats || []));
      } else {
        throw new Error('Cấu trúc dữ liệu ghế không hợp lệ');
      }

      const bookedSeats = allSeats
        .filter((seat) => seat && typeof seat === 'object' && seat.is_booked)
        .map((seat) => seat.seat_number);

      const invalidSeats = seatIds.filter((seat) => bookedSeats.includes(seat));
      if (invalidSeats.length > 0) {
        throw new Error(`Ghế ${invalidSeats.join(', ')} đã được đặt`);
      }

      const ticketPrice = calculatePrice(flight?.base_economy_class_price, ticketType, 1);
      let response;

      const bookingData = passengers.map((passenger, index) => ({
        flight_id: flightId,
        customer_id: passenger.customer?.id || '',
        ticket_class_id: selectedClass.id,
        cancellation_deadline: cancellationDeadline,
        seat_number: seatIds[index],
        price: ticketPrice
      }));

      console.log('📊 Payload gửi tới bookMultipleTickets:', { tickets: bookingData, quantity });

      if (quantity === 1) {
        console.log('📊 Gửi dữ liệu đặt vé đơn:', bookingData[0]);
        response = await bookTicket(bookingData[0]);
      } else {
        response = await bookMultipleTickets({ tickets: bookingData, quantity });
      }

      console.log('📊 Kết quả đặt vé:', response.data);
      const code = quantity === 1
                   ? response.data.data.standardized_code
                   : response.data.data.standardized_code;
      if (!code) {
        throw new Error('Không nhận được mã vé từ server');
      }
      setTicketCode(code);
      localStorage.removeItem('bookingData');
      setStep(4);
    } catch (err) {
      console.error('🚨 Lỗi đặt vé:', err);
      const errorMessage = err.response?.data?.errors
        ? err.response.data.errors.map(e => e.msg).join('; ')
        : err.response?.data?.message || err.message;
      setError(`Đặt vé thất bại: ${errorMessage}`);
      console.log('📊 Chi tiết lỗi:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!flight) return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <p className="text-xl font-semibold text-red-600">Không tìm thấy chuyến bay</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-green-50 py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
          Đặt Vé Chuyến Bay
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-red-500 text-sm mt-2">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {['Nhập Email', 'Thông Tin Hành Khách', 'Chọn Ghế', 'Xác Nhận'].map((label, index) => (
              <div key={index} className="flex-1 text-center relative z-10">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${step >= index + 1 ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {index + 1}
                </div>
                <p className={`mt-2 text-sm font-medium ${step >= index + 1 ? 'text-green-600' : 'text-gray-500'}`}>
                  {label}
                </p>
              </div>
            ))}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(step - 1) * 33.33}%` }}></div>
            </div>
          </div>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flight Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Thông Tin Chuyến Bay</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
                  <p className="font-semibold text-gray-900">{flight.flight_number || 'N/A'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Hạng vé</p>
                  <p className="font-semibold text-gray-900">{classTypeNames[ticketType.classType] || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Điểm đi</p>
                    <p className="font-semibold text-gray-900">{flight.departure_city_name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Địa điểm đến</p>
                    <p className="font-semibold text-gray-900">{flight.arrival_city_name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                    <p className="font-semibold text-gray-900">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian đến</p>
                    <p className="font-semibold text-gray-900">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Số lượng vé</p>
                  <p className="font-semibold text-gray-900">{quantity} vé</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Giá vé ({quantity} vé)</p>
                  <p className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                </div>
              </div>
            </div>
            {/* Email Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nhập Email Hành Khách</h2>
              <form onSubmit={handleEmailSubmit}>
                {passengers.map((passenger, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hành khách {index + 1}</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) => handleEmailChange(e, index)}
                        className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        required
                      />
                    </div>
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold disabled:bg-gray-400"
                  disabled={loading || passengers.some((p) => !p.email)}
                >
                  {loading ? 'Đang kiểm tra...' : 'Xác nhận Email'}
                </motion.button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2: Passenger Info */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flight Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Thông Tin Chuyến Bay</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
                  <p className="font-semibold text-gray-900">{flight.flight_number || 'N/A'}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Hạng vé</p>
                  <p className="font-semibold text-gray-900">{classTypeNames[ticketType.classType] || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Điểm đi</p>
                    <p className="font-semibold text-gray-900">{flight.departure_city_name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Địa điểm đến</p>
                    <p className="font-semibold text-gray-900">{flight.arrival_city_name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                    <p className="font-semibold text-gray-900">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian đến</p>
                    <p className="font-semibold text-gray-900">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Số lượng vé</p>
                  <p className="font-semibold text-gray-900">{quantity} vé</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Giá vé ({quantity} vé)</p>
                  <p className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                </div>
              </div>
            </div>
            {/* Passenger Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Thông Tin Hành Khách</h2>
              <form onSubmit={handleCustomerInfoSubmit}>
                {passengers.map((passenger, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành khách {index + 1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                        <input
                          type="text"
                          name="first_name"
                          value={passenger.formData.first_name}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          required
                        />
                        {passenger.formErrors.first_name && (
                          <p className="text-red-500 text-sm mt-1">{passenger.formErrors.first_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                        <input
                          type="text"
                          name="last_name"
                          value={passenger.formData.last_name}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          required
                        />
                        {passenger.formErrors.last_name && (
                          <p className="text-red-500 text-sm mt-1">{passenger.formErrors.last_name}</p>
                        )}
                      </div>
                      {passenger.isNewCustomer ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                          <input
                            type="password"
                            name="password"
                            value={passenger.formData.password}
                            onChange={(e) => handleInputChange(e, index)}
                            className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            required
                          />
                          {passenger.formErrors.password && (
                            <p className="text-red-500 text-sm mt-1">{passenger.formErrors.password}</p>
                          )}
                        </div>
                      ) : null}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select
                          name="gender"
                          value={passenger.formData.gender}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Male">Nam</option>
                          <option value="Female">Nữ</option>
                          <option value="Other">Khác</option>
                        </select>
                        {passenger.formErrors.gender && (
                          <p className="text-red-500 text-sm mt-1">{passenger.formErrors.gender}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          name="birth_date"
                          value={passenger.formData.birth_date}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD</label>
                        <input
                          type="text"
                          name="identity_number"
                          value={passenger.formData.identity_number}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={passenger.formData.phone_number}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                          type="text"
                          name="address"
                          value={passenger.formData.address}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                        <input
                          type="text"
                          name="country"
                          value={passenger.formData.country}
                          onChange={(e) => handleInputChange(e, index)}
                          className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold disabled:bg-gray-400 mt-4"
                  disabled={loading || passengers.some((p) => !p.formData.first_name || !p.formData.last_name || (p.isNewCustomer && !p.formData.password))}
                >
                  {loading ? 'Đang xử lý...' : 'Chọn Ghế'}
                </motion.button>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Booking */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-green-100 relative">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Xác Nhận Đặt Vé</h2>
            <div className="absolute top-0 left-0 right-0 h-2 bg-green-100 rounded-t-xl"></div>
            <div className="flex justify-between items-center mb-6">
              <img src="/path/to/logo.png" alt="AirGrok" className="h-10" />
              <div className="text-sm text-gray-600">Mã vé: <span className="font-semibold">{ticketCode || 'Chờ xác nhận'}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Chuyến Bay</h3>
                <p className="text-sm text-gray-600">Số hiệu chuyến bay: <span className="font-semibold text-gray-900">{flight.flight_number || 'N/A'}</span></p>
                <p className="text-sm text-gray-600 mt-2">Hạng vé: <span className="font-semibold text-gray-900">{classTypeNames[ticketType.classType] || 'N/A'}</span></p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">Điểm đi: <span className="font-semibold text-gray-900">{flight.departure_city_name || 'N/A'}</span></p>
                    <span className="mx-2 text-green-600">→</span>
                    <p className="text-sm text-gray-600">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">Điểm đến: <span className="font-semibold text-gray-900">{flight.arrival_city_name || 'N/A'}</span></p>
                    <span className="mx-2 text-green-600">→</span>
                    <p className="text-sm text-gray-600">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Chi Tiết Vé</h3>
                <p className="text-sm text-gray-600">Số ghế: <span className="font-semibold text-gray-900">{seatIds.length > 0 ? seatIds.join(', ') : 'Chưa chọn'}</span></p>
                <p className="text-sm text-gray-600 mt-2">Số lượng: <span className="font-semibold text-gray-900">{quantity} vé</span></p>
                <p className="text-sm text-gray-600 mt-2">Giá vé: <span className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
                <p className="text-sm text-gray-600 mt-2">Hạn hủy vé: <span className="font-semibold text-gray-900">{new Date(cancellationDeadline).toLocaleString()}</span></p>
              </div>
            </div>
            <div className="mt-6 bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Hành Khách</h3>
              {passengers.map((passenger, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-green-200 last:border-b-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Hành khách {index + 1}: <span className="font-semibold text-gray-900">
                          {passenger.customer?.first_name && passenger.customer?.last_name
                            ? `${passenger.customer.first_name} ${passenger.customer.last_name}`
                            : passenger.formData?.first_name && passenger.formData?.last_name
                            ? `${passenger.formData.first_name} ${passenger.formData.last_name}`
                            : passenger.email || 'Chưa nhập thông tin'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Email: <span className="font-semibold text-gray-900">{passenger.email || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Ngày sinh: <span className="font-semibold text-gray-900">
                          {passenger.formData?.birth_date
                            ? new Date(passenger.formData.birth_date).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Số điện thoại: <span className="font-semibold text-gray-900">{passenger.formData?.phone_number || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Số CMND/CCCD: <span className="font-semibold text-gray-900">{passenger.formData?.identity_number || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Số ghế: <span className="font-semibold text-gray-900">{seatIds[index] || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <div className="h-10 w-64 bg-gray-200 rounded-lg overflow-hidden flex">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-gray-800' : 'bg-white'}`} style={{ width: `${Math.random() * 4 + 2}px` }}></div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-100 rounded-b-xl"></div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/seat-selection/${flightId}`, { state: { flight, ticketType, quantity, passengers } })}
                className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition font-semibold disabled:bg-gray-400"
                disabled={loading}
              >
                Quay Lại Chọn Ghế
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmBooking}
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold disabled:bg-gray-400"
                disabled={loading || seatIds.length === 0 || passengers.some((p) => !p.customer || !p.email)}
              >
                {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Vé'}
              </motion.button>
            </div>
          </div>
        )}

        {/* Step 4: Booking Success */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-green-100 relative">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Đặt Vé Thành Công!</h2>
            <div className="absolute top-0 left-0 right-0 h-2 bg-green-100 rounded-t-xl"></div>
            <div className="flex justify-between items-center mb-6">
              <img src="/path/to/logo.png" alt="AirGrok" className="h-10" />
              <div className="text-sm text-gray-600">
                Mã vé: <span className="font-semibold text-gray-900">{ticketCode}</span>
              </div>
            </div>
            <div className="bg-green-100 p-6 rounded-lg mb-6 text-center">
              <p className="text-lg font-semibold text-gray-900">Mã vé của bạn: <span className="text-2xl text-green-600">{ticketCode}</span></p>
              <p className="text-sm text-gray-600 mt-2">Vui lòng lưu mã này để tra cứu vé sau này.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Chuyến Bay</h3>
                <p className="text-sm text-gray-600">Số hiệu chuyến bay: <span className="font-semibold text-gray-900">{flight.flight_number || 'N/A'}</span></p>
                <p className="text-sm text-gray-600 mt-2">Hạng vé: <span className="font-semibold text-gray-900">{classTypeNames[ticketType.classType] || 'N/A'}</span></p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">Điểm đi: <span className="font-semibold text-gray-900">{flight.departure_city_name || 'N/A'}</span></p>
                    <span className="mx-2 text-green-600">→</span>
                    <p className="text-sm text-gray-600">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">Điểm đến: <span className="font-semibold text-gray-900">{flight.arrival_city_name || 'N/A'}</span></p>
                    <span className="mx-2 text-green-600">→</span>
                    <p className="text-sm text-gray-600">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Chi Tiết Vé</h3>
                <p className="text-sm text-gray-600">Số ghế: <span className="font-semibold text-gray-900">{seatIds.join(', ') || 'N/A'}</span></p>
                <p className="text-sm text-gray-600 mt-2">Số lượng: <span className="font-semibold text-gray-900">{quantity} vé</span></p>
                <p className="text-sm text-gray-600 mt-2">Giá vé: <span className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
                <p className="text-sm text-gray-600 mt-2">Hạn hủy vé: <span className="font-semibold text-gray-900">{new Date(cancellationDeadline).toLocaleString()}</span></p>
              </div>
            </div>
            <div className="mt-6 bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông Tin Hành Khách</h3>
              {passengers.map((passenger, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-green-200 last:border-b-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Hành khách {index + 1}: <span className="font-semibold text-gray-900">
                          {passenger.customer?.first_name && passenger.customer?.last_name
                            ? `${passenger.customer.first_name} ${passenger.customer.last_name}`
                            : passenger.formData?.first_name && passenger.formData?.last_name
                            ? `${passenger.formData.first_name} ${passenger.formData.last_name}`
                            : passenger.email || 'Chưa nhập thông tin'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Email: <span className="font-semibold text-gray-900">{passenger.email || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Ngày sinh: <span className="font-semibold text-gray-900">
                          {passenger.formData?.birth_date
                            ? new Date(passenger.formData.birth_date).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Số điện thoại: <span className="font-semibold text-gray-900">{passenger.formData?.phone_number || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Số CMND/CCCD: <span className="font-semibold text-gray-900">{passenger.formData?.identity_number || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Số ghế: <span className="font-semibold text-gray-900">{seatIds[index] || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <div className="h-10 w-64 bg-gray-200 rounded-lg overflow-hidden flex">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-gray-800' : 'bg-white'}`} style={{ width: `${Math.random() * 4 + 2}px` }}></div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-100 rounded-b-xl"></div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/tickets')}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold mt-6"
            >
              Đi đến Trang Vé của Tôi
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Booking;