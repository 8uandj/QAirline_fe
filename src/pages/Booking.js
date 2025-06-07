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

  const handleEmailSubmit = async (e, passengerIndex) => {
  e.preventDefault();
  setLoading(true);
  try {
    const passengerEmail = passengers[passengerIndex].email;
    if (!passengerEmail) {
      throw new Error('Vui lòng nhập email cho hành khách.');
    }
    console.log(`📊 Kiểm tra email cho hành khách ${passengerIndex + 1}:`, passengerEmail);
    const res = await axios.get(`${API_URL}/api/check-email?email=${passengerEmail}`);
    console.log(`📊 Kết quả kiểm tra email cho hành khách ${passengerIndex + 1}:`, res.data);

    const newPassengers = [...passengers];
    newPassengers[passengerIndex].email = passengerEmail; // Đảm bảo email được lưu
    if (res.data.exists) {
      const customerRes = await axios.get(`${API_URL}/api/customer/by-email/${passengerEmail}`);
      if (!customerRes.data.success) {
        throw new Error(customerRes.data.error || 'Không thể lấy thông tin khách hàng');
      }
      console.log(`📊 Dữ liệu khách hàng cho hành khách ${passengerIndex + 1}:`, customerRes.data.data);
      newPassengers[passengerIndex].customer = customerRes.data.data;
      newPassengers[passengerIndex].isNewCustomer = false;
    } else {
      newPassengers[passengerIndex].isNewCustomer = true;
    }
    setPassengers(newPassengers);

    const allEmailsSubmitted = newPassengers.every((p) => p.email && (p.customer || p.isNewCustomer));
    if (allEmailsSubmitted) {
      setStep(2);
    }
  } catch (err) {
    console.error(`Lỗi kiểm tra email cho hành khách ${passengerIndex + 1}:`, err);
    setError(`Không thể kiểm tra email: ${err.response?.data?.error || err.message}`);
  } finally {
    setLoading(false);
  }
};

 const handleCustomerInfoSubmit = async (e, passengerIndex) => {
  e.preventDefault();
  const errors = validateForm(passengers[passengerIndex].formData, passengers[passengerIndex].isNewCustomer);
  if (Object.keys(errors).length > 0) {
    setPassengers((prev) => {
      const newPassengers = [...prev];
      newPassengers[passengerIndex].formErrors = errors;
      return newPassengers;
    });
    return;
  }

  setLoading(true);
  try {
    const newPassengers = [...passengers];
    const passenger = newPassengers[passengerIndex];
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
      console.log(`📊 Gửi dữ liệu khách hàng cho hành khách ${passengerIndex + 1}:`, customerData);
      const res = await axios.post(`${API_URL}/api/customer/register`, customerData);
      passenger.customer = res.data.user;
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
    setPassengers(newPassengers);

    console.log(`📊 Passengers sau khi cập nhật hành khách ${passengerIndex + 1}:`, newPassengers);
    const allDetailsSubmitted = newPassengers.every((p) => p.customer && p.email);
    if (allDetailsSubmitted) {
      navigate(`/seat-selection/${flightId}`, {
        state: { flight, ticketType, quantity: quantityFromState, passengers: newPassengers },
      });
    } else {
      setError('Vui lòng hoàn thành thông tin cho tất cả hành khách trước khi tiếp tục.');
    }
  } catch (err) {
    console.error(`Lỗi đăng ký cho hành khách ${passengerIndex + 1}:`, err);
    const errorMessage = err.response?.data?.error?.includes('customers_gender_check')
      ? 'Giới tính không hợp lệ. Vui lòng chọn Nam, Nữ hoặc Khác.'
      : `Không thể đăng ký: ${err.response?.data?.error || err.message}`;
    setError(errorMessage);
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
      customer_id: passenger.customer.id,
      ticket_class_id: selectedClass.id,
      cancellation_deadline: cancellationDeadline,
      seat_number: seatIds[index],
      price: ticketPrice,
    }));

    if (quantity === 1) {
      console.log('📊 Gửi dữ liệu đặt vé đơn:', bookingData[0]);
      response = await bookTicket(bookingData[0]);
    } else {
      console.log('📊 Gửi dữ liệu đặt nhiều vé:', bookingData);
      response = await bookMultipleTickets({
        tickets: bookingData,
        quantity,
      });
    }

    console.log('📊 Kết quả đặt vé:', response.data);
    setTicketCode(response.data.ticket_code || 'TICKET-' + Date.now());
    localStorage.removeItem('bookingData'); // Xóa dữ liệu tạm sau khi đặt vé thành công
    setStep(4);
  } catch (err) {
    console.error('Lỗi đặt vé:', err);
    const errorMessage = err.response?.data?.error || err.message;
    setError(`Đặt vé thất bại: ${errorMessage}`);
    console.log('📊 Chi tiết lỗi:', err.response?.data);
  } finally {
    setLoading(false);
  }
};

  if (!flight) return <div className="text-center p-4">Không tìm thấy chuyến bay</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Đặt Vé Chuyến Bay</h1>
      {error && (
        <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
          {error}
          <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
        </div>
      )}

      {/* Thanh tiến trình */}
      <div className="flex justify-between mb-6">
        {['Nhập email', 'Thông tin hành khách', 'Chọn ghế', 'Xác nhận'].map((label, index) => (
          <div key={index} className={`text-center ${step >= index + 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${step >= index + 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>{index + 1}</div>
            <p className="text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Bước 1: Nhập email */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Thông Tin Chuyến Bay</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
              <p className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Hạng vé</p>
              <p className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Điểm đi</p>
                <p className="font-semibold text-green-800">{flight.departure_city_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Địa điểm đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_city_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                <p className="font-semibold text-green-800">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Số lượng vé</p>
              <p className="font-semibold text-green-800">{quantity} vé</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Giá vé ({quantity} vé)</p>
              <p className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Nhập Email Hành Khách</h2>
            {passengers.map((passenger, index) => (
              <form key={index} onSubmit={(e) => handleEmailSubmit(e, index)} className="mb-6 border-b border-green-200 pb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-4">Hành khách {index + 1}</h3>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => handleEmailChange(e, index)}
                    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Đang kiểm tra...' : 'Kiểm tra email'}
                </motion.button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Bước 2: Nhập thông tin hành khách */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Thông Tin Chuyến Bay</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
              <p className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Hạng vé</p>
              <p className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Điểm đi</p>
                <p className="font-semibold text-green-800">{flight.departure_city_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Địa điểm đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_city_name || 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                <p className="font-semibold text-green-800">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Thời gian đến</p>
                <p className="font-semibold text-green-800">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Số lượng vé</p>
              <p className="font-semibold text-green-800">{quantity} vé</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mt-2">
              <p className="text-sm text-gray-600">Giá vé ({quantity} vé)</p>
              <p className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <h2 className="text-2xl font-semibold mb-6 text-green-600 border-b border-green-200 pb-2">Thông Tin Hành Khách</h2>
            {passengers.map((passenger, index) => (
              <form key={index} onSubmit={(e) => handleCustomerInfoSubmit(e, index)} className="mb-6 border-b border-green-200 pb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-4">Hành khách {index + 1}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Họ</label>
                    <input
                      type="text"
                      name="first_name"
                      value={passenger.formData.first_name}
                      onChange={(e) => handleInputChange(e, index)}
                      className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
                      required
                    />
                    {passenger.formErrors.first_name && <p className="text-red-500 text-sm mt-1">{passenger.formErrors.first_name}</p>}
                  </div>
                  <div className="mb-4">
  <label className="block text-gray-700 font-medium mb-1">Tên</label>
  <input
    type="text"
    name="last_name"
    value={passenger.formData.last_name}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
    required
  />
  {passenger.formErrors.last_name && <p className="text-red-500 text-sm mt-1">{passenger.formErrors.last_name}</p>}
</div>
{passenger.isNewCustomer && (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
    <input
      type="password"
      name="password"
      value={passenger.formData.password}
      onChange={(e) => handleInputChange(e, index)}
      className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
      required
    />
    {passenger.formErrors.password && <p className="text-red-500 text-sm mt-1">{passenger.formErrors.password}</p>}
  </div>
)}
<div className="mb-4">
  <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
  <select
    name="gender"
    value={passenger.formData.gender}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
  >
    <option value="">Chọn giới tính</option>
    <option value="Male">Nam</option>
    <option value="Female">Nữ</option>
    <option value="Other">Khác</option>
  </select>
  {passenger.formErrors.gender && <p className="text-red-500 text-sm mt-1">{passenger.formErrors.gender}</p>}
</div>
<div className="mb-4">
  <label className="block text-gray-600 font-medium mb-1">Ngày sinh</label>
  <input
    type="date"
    name="birth_date"
    value={passenger.formData.birth_date}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
  />
</div>
<div className="mb-4">
  <label className="block text-gray-600 font-medium mb-1">Số CMND/CCCD</label>
  <input
    type="text"
    name="identity_number"
    value={passenger.formData.identity_number}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
  />
</div>
<div className="mb-4">
  <label className="block text-gray-600 font-medium mb-1">Số điện thoại</label>
  <input
    type="tel"
    name="phone_number"
    value={passenger.formData.phone_number}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
  />
</div>
<div className="mb-4 col-span-2">
  <label className="block text-gray-600 font-medium mb-1">Địa chỉ</label>
  <input
    type="text"
    name="address"
    value={passenger.formData.address}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
  />
</div>
<div className="mb-4 col-span-2">
  <label className="block text-gray-600 font-medium mb-1">Quốc gia</label>
  <input
    type="text"
    name="country"
    value={passenger.formData.country}
    onChange={(e) => handleInputChange(e, index)}
    className="p-3 border border-green-200 rounded-lg w-full focus:ring-2 focus:ring-green-500 transition"
  />
</div>
</div>
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold"
  disabled={loading}
>
  {loading ? 'Đang xử lý...' : 'Chọn ghế'}
</motion.button>
</form>
))}
</div>
</div>
)}

{/* Bước 3: Xác nhận đặt vé */}
{step === 3 && (
  <div className="max-w-3xl mx-auto">
    {console.log('📊 Passengers tại step 3:', passengers)}
    <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">Xác Nhận Đặt Vé</h2>
    <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 relative">
      <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-dashed border-green-200"></div>
      <div className="flex justify-between items-center mb-4 pt-6">
        <img src="/path/to/logo.png" alt="AirGrok" className="h-8" />
        <div className="text-sm text-gray-600">Mã vé: {ticketCode || 'Chờ xác nhận'}</div>
      </div>
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Chuyến Bay</h3>
          <p className="text-sm text-gray-600 font-light">Số hiệu chuyến bay: <span className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạng vé: <span className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</span></p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đi: <span className="font-semibold text-green-800">{flight.departure_city_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đến: <span className="font-semibold text-green-800">{flight.arrival_city_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Chi Tiết Vé</h3>
          <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{seatIds.length > 0 ? seatIds.join(', ') : 'Chưa chọn'}</span></p>
          <p className="text-sm text-gray-600 font-light">Số lượng: <span className="font-semibold text-green-800">{quantity} vé</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Giá vé: <span className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạn hủy vé: <span className="font-semibold text-green-800">{new Date(cancellationDeadline).toLocaleString()}</span></p>
        </div>
      </div>
      <div className="mt-4 bg-green-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Hành Khách</h3>
        {passengers.map((passenger, index) => (
          <div key={index} className="mb-4 border-b border-green-200 pb-2">
            <p className="text-sm text-gray-600 font-light">
              Hành khách {index + 1}: <span className="font-semibold text-green-800">
                {passenger.customer?.first_name && passenger.customer?.last_name
                  ? `${passenger.customer.first_name} ${passenger.customer.last_name}`
                  : passenger.formData?.first_name && passenger.formData?.last_name
                  ? `${passenger.formData.first_name} ${passenger.formData.last_name}`
                  : passenger.email || 'Chưa nhập thông tin'}
              </span>
            </p>
            <p className="text-sm text-gray-600 font-light mt-1">Email: <span className="font-semibold text-green-800">{passenger.email || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{seatIds[index] || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-1">Số điện thoại: <span className="font-semibold text-green-800">{passenger.formData?.phone_number || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-1">Số CMND/CCCD: <span className="font-semibold text-green-800">{passenger.formData?.identity_number || 'N/A'}</span></p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-8 w-48 bg-gray-200 flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`} style={{ width: `${Math.random() * 3 + 1}px` }}></div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-4 border-t-2 border-dashed border-green-200"></div>
      <div className="flex justify-center space-x-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/seat-selection/${flightId}`, { state: { flight, ticketType, quantity, passengers } })}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition font-semibold"
          disabled={loading}
        >
          Quay lại chọn ghế
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirmBooking}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
          disabled={loading || seatIds.length === 0 || passengers.some((p) => !p.customer || !p.email)}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
        </motion.button>
      </div>
    </div>
  </div>
)}

{/* Bước 4: Đặt vé thành công */}
{step === 4 && (
  <div className="max-w-3xl mx-auto">
    {console.log('📊 Passengers tại step 4:', passengers)}
    <h2 className="text-2xl font-semibold mb-6 text-green-600 text-center">Đặt Vé Thành Công!</h2>
    <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 relative">
      <div className="absolute top-0 left-0 right-0 h-4 border-b-2 border-dashed border-green-200"></div>
      <div className="flex justify-between items-center mb-4 pt-6">
        <img src="/path/to/logo.png" alt="AirGrok" className="h-8" />
        <div className="text-sm text-gray-600">Mã vé: {ticketCode}</div>
      </div>
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-7 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Chuyến Bay</h3>
          <p className="text-sm text-gray-600 font-light">Số hiệu chuyến bay: <span className="font-semibold text-green-800">{flight.flight_number || 'N/A'}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạng vé: <span className="font-semibold text-green-800">{classTypeNames[ticketType.classType] || 'N/A'}</span></p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đi: <span className="font-semibold text-green-800">{flight.departure_city_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-gray-600 font-light">Điểm đến: <span className="font-semibold text-green-800">{flight.arrival_city_name || 'N/A'}</span></p>
              <span className="mx-2 text-green-600">⇒</span>
              <p className="text-sm text-gray-600 font-light">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="col-span-3 bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Chi Tiết Vé</h3>
          <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{seatIds.join(', ') || 'N/A'}</span></p>
          <p className="text-sm text-gray-600 font-light">Số lượng: <span className="font-semibold text-green-800">{quantity} vé</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Giá vé: <span className="font-semibold text-green-600">{displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
          <p className="text-sm text-gray-600 font-light mt-1">Hạn hủy vé: <span className="font-semibold text-green-800">{new Date(cancellationDeadline).toLocaleString()}</span></p>
        </div>
      </div>
      <div className="mt-4 bg-green-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-green-700 mb-3 bg-gradient-to-r from-green-100 to-green-50 px-2 py-1 rounded">Thông Tin Hành Khách</h3>
        {passengers.map((passenger, index) => (
          <div key={index} className="mb-4 border-b border-green-200 pb-2">
            <p className="text-sm text-gray-600 font-light">
              Hành khách {index + 1}: <span className="font-semibold text-green-800">
                {passenger.customer?.first_name && passenger.customer?.last_name
                  ? `${passenger.customer.first_name} ${passenger.customer.last_name}`
                  : passenger.formData?.first_name && passenger.formData?.last_name
                  ? `${passenger.formData.first_name} ${passenger.formData.last_name}`
                  : passenger.email || 'Chưa nhập thông tin'}
              </span>
            </p>
            <p className="text-sm text-gray-600 font-light mt-1">Email: <span className="font-semibold text-green-800">{passenger.email || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-1">Số ghế: <span className="font-semibold text-green-800">{seatIds[index] || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-1">Số điện thoại: <span className="font-semibold text-green-800">{passenger.formData?.phone_number || 'N/A'}</span></p>
            <p className="text-sm text-gray-600 font-light mt-1">Số CMND/CCCD: <span className="font-semibold text-green-800">{passenger.formData?.identity_number || 'N/A'}</span></p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="h-8 w-48 bg-gray-200 flex">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-black' : 'bg-white'}`} style={{ width: `${Math.random() * 3 + 1}px` }}></div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-4 border-t-2 border-dashed border-green-200"></div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/tickets')}
        className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold mt-6"
      >
        Đi đến trang Vé của tôi
      </motion.button>
    </div>
  </div>
)}
</motion.div>
);
}

export default Booking;