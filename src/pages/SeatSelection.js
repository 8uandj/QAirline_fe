import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSeatMap } from '../services/api';
import SeatMap from '../components/SeatMap';

function SeatSelection() {
  const { flightId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [seatsData, setSeatsData] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeCabin, setActiveCabin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const flight = state?.flight || {};
  const ticketType = state?.ticketType || { tripType: 'one-way', classType: 'economy' };
  const customer = state?.customer || null;
  const formData = state?.formData || null;
  const email = state?.email || '';
  const quantity = state?.quantity || 1;
  const ticketClass = ticketType.classType;

  useEffect(() => {
  console.log('📊 Flight ID:', flightId);
  console.log('📊 State:', state);
  console.log('📊 Quantity:', quantity);
  console.log('📊 Passengers:', state?.passengers);

  if (!flightId || !flight) {
    setError('Không tìm thấy ID chuyến bay hoặc thông tin chuyến bay.');
    navigate('/flights');
    return;
  }

  if (!state?.passengers || state.passengers.length !== quantity) {
    setError('Thông tin hành khách không hợp lệ. Vui lòng quay lại trang đặt vé.');
    navigate(`/booking/${flightId}`, { state: { flight, ticketType, quantity } });
    return;
  }

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await getSeatMap(flightId);
      console.log('📊 Seats data:', res.data);
      const data = res.data.data || {};
      setSeatsData({
        first_class: data.first_class || [],
        business_class: data.business_class || [],
        economy_class: data.economy_class || [],
      });

      const cabins = getCabins(data);
      if (cabins.length > 0) {
        setActiveCabin(cabins[0].id);
      } else {
        setError('Không có khoang phù hợp với hạng vé.');
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError('Không thể tải sơ đồ ghế: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchSeats();
}, [flightId, ticketClass, navigate, flight, quantity, state]);

  const getCabins = (data) => {
  const classKey = {
    economy: 'economy_class',
    business: 'business_class',
    first: 'first_class',
  }[ticketClass];
  const cabinsData = data[classKey] || [];
  const cabins = [];

  cabinsData.forEach((cabin, index) => {
    const seats = Array.isArray(cabin.seats)
      ? cabin.seats.map((seat) => ({
          seat_number: typeof seat === 'string' ? seat : seat.seat_number,
          is_booked: typeof seat === 'string' ? false : seat.is_booked || false, // Đảm bảo is_booked tồn tại
        }))
      : [];

    console.log('📊 Cabin seats:', seats); // Debug

    let layout;
    if (ticketClass === 'economy') {
      const rows = 10; // Hàng A-J
      const seatsPerRow = 4; // 2 ghế/dãy
      layout = Array.from({ length: rows }, (_, rowIndex) => {
        const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, ..., J
        return Array.from({ length: seatsPerRow }, (_, seatIndex) => {
          const seatNum = `${rowLetter}${seatIndex + 1}`;
          const seat = seats.find((s) => s.seat_number === `${cabin.cabin}-${seatNum}`) || {
            seat_number: `${cabin.cabin}-${seatNum}`,
            is_booked: false,
          };
          return seat;
        });
      });
    } else if (ticketClass === 'business') {
      const rows = 5; // Hàng A-E
      const seatsPerRow = 2; // 1 ghế/dãy
      layout = Array.from({ length: rows }, (_, rowIndex) => {
        const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, ..., E
        return Array.from({ length: seatsPerRow }, (_, seatIndex) => {
          const seatNum = `${rowLetter}${seatIndex + 1}`;
          const seat = seats.find((s) => s.seat_number === `${cabin.cabin}-${seatNum}`) || {
            seat_number: `${cabin.cabin}-${seatNum}`,
            is_booked: false,
          };
          return seat;
        });
      });
    } else if (ticketClass === 'first') {
      const rows = 5; // Hàng A-E
      const seatsPerRow = 1; // 1 ghế/dãy
      layout = Array.from({ length: rows }, (_, rowIndex) => {
        const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, ..., E
        return Array.from({ length: seatsPerRow }, (_, seatIndex) => {
          const seatNum = `${rowLetter}${seatIndex + 1}`;
          const seat = seats.find((s) => s.seat_number === `${cabin.cabin}-${seatNum}`) || {
            seat_number: `${cabin.cabin}-${seatNum}`,
            is_booked: false,
          };
          return seat;
        });
      });
    }

    cabins.push({
      id: `cabin-${classKey}-${index}`,
      name: cabin.cabin || `${classTypeNames[ticketClass]} Cabin ${index + 1}`,
      rows: layout.length,
      columns: ticketClass === 'first' ? 1 : ticketClass === 'business' ? 2 : 4,
      seats: layout,
    });
  });

  console.log('📊 Final cabins:', cabins);
  return cabins;
};

  const handleSeatClick = ({ type, seat, cabinId }) => {
  if (type === 'setActiveCabin') {
    setActiveCabin(cabinId);
    return;
  }

  if (seat.is_booked) {
    console.log('📊 Seat booked:', seat.seat_number);
    return;
  }

  setSelectedSeats((prev) => {
    console.log('📊 Current selected seats:', prev, 'quantity:', quantity);
    if (prev.includes(seat.seat_number)) {
      return prev.filter((id) => id !== seat.seat_number);
    }
    if (prev.length >= quantity) {
      console.log('📊 Max seats reached:', quantity);
      setError(`Chỉ được chọn tối đa ${quantity} ghế.`);
      return prev;
    }
    const newSeats = [...prev, seat.seat_number];
    console.log('📊 New selected seats:', newSeats);
    return newSeats;
  });
};

  const handleConfirmSeats = () => {
  if (selectedSeats.length === 0) {
    setError('Vùi lòng chọn ít nhất một ghế.');
    return;
  }
  if (selectedSeats.length !== quantity) {
    setError(`Vui lòng chọn đúng ${quantity} ghế.`);
    console.log('📊 Ghế đã chọn:', selectedSeats, 'số lượng mong muốn:', quantity);
    return;
  }

  if (!state?.passengers || state.passengers.length !== quantity) {
    setError('Thông tin hành khách không hợp lệ. Vui lòng quay lại trang đặt vé.');
    navigate(`/booking/${flightId}`, { state: { flight, ticketType, quantity } });
    return;
  }

  console.log('📊 Xác nhận ghế:', selectedSeats, 'số lượng:', quantity);
  console.log('📊 Passengers trước khi chuyển hướng:', state.passengers);
  navigate(`/booking/${flightId}`, {
    state: {
      flight,
      ticketType,
      passengers: state.passengers,
      seatIds: selectedSeats,
      quantity,
    },
  });
};

  if (loading) return <div className="text-center p-4 text-gray-600">Đang tải...</div>;
  if (error) return (
    <div className="text-center p-4 text-red-500 bg-red-100 rounded-lg shadow-md">
      {error}
      <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
    </div>
  );

  const cabins = getCabins(seatsData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Chọn Ghế</h1>

      {/* Thông tin chuyến bay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-green-100 mb-6"
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Thông tin chuyến bay</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Số hiệu:</strong> {flight.flight_number || 'N/A'}</p>
            <p><strong>Hãng:</strong> {flight.airline_name || 'N/A'}</p>
            <p><strong>Địa điểm đi:</strong> {flight.departure_city_name || 'N/A'}</p>
            <p><strong>Địa điểm đến:</strong> {flight.arrival_city_name || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Khởi hành:</strong> {flight.departure_time ? new Date(flight.departure_time).toLocaleString() : 'N/A'}</p>
            <p><strong>Đến:</strong> {flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</p>
            <p><strong>Loại vé:</strong> {classTypeNames[ticketType.classType] || 'N/A'} ({ticketType.tripType === 'round-trip' ? 'Khứ hồi' : 'Một chiều'})</p>
            <p><strong>Số lượng:</strong> {quantity} vé</p>
          </div>
        </div>
      </motion.div>

      {/* Sơ đồ ghế */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-green-100"
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-600 text-center">Sơ đồ ghế</h2>
        <SeatMap
          cabins={cabins}
          activeCabin={activeCabin}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
          ticketClass={ticketClass}
          quantity={quantity}
        />

        {/* Nút xác nhận */}
        {cabins.length > 0 && (
          <div className="mt-6 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmSeats}
              disabled={loading || selectedSeats.length !== quantity}
              className={`bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-md ${
                loading || selectedSeats.length !== quantity ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận ghế'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const classTypeNames = {
  economy: 'Phổ thông',
  business: 'Thương gia',
  first: 'Hạng nhất',
};

export default SeatSelection;