import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FlightList = ({ flights }) => {
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState({});
  const [quantities, setQuantities] = useState({});

  const classTypeNames = {
    economy: 'Phổ thông',
    business: 'Thương gia',
    first: 'Hạng nhất',
  };

  const handleTicketTypeChange = (flightId, type, value) => {
    setTicketTypes((prev) => ({
      ...prev,
      [flightId]: {
        ...prev[flightId],
        [type]: value,
      },
    }));
  };

  const handleQuantityChange = (flightId, value) => {
    const quantity = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [flightId]: quantity > 0 ? quantity : 1,
    }));
  };

  const calculatePrice = (flightId, basePrice) => {
    const ticketType = ticketTypes[flightId] || { tripType: 'one-way', classType: 'economy' };
    const quantity = quantities[flightId] || 1;
    let price = parseFloat(basePrice);

    if (ticketType.tripType === 'round-trip') {
      price *= 2;
    }

    if (ticketType.classType === 'business') {
      price *= 1.5;
    } else if (ticketType.classType === 'first') {
      price *= 2;
    }

    return price * quantity;
  };

  const handleBookFlight = (flightId) => {
    const selectedFlight = flights.find((flight) => flight.id === flightId);
    if (selectedFlight) {
      const qty = quantities[flightId] || 1;
      const ticketType = ticketTypes[flightId] || { tripType: 'one-way', classType: 'economy' };
      const availableSeats = selectedFlight[`available_${ticketType.classType}_class_seats`] || 0;
      if (qty > availableSeats) {
        alert(`Chỉ còn ${availableSeats} ghế ${classTypeNames[ticketType.classType]} cho chuyến bay này.`);
        return;
      }
      console.log('📊 Booking flight:', selectedFlight, 'ticketType:', ticketType, 'quantity:', qty);
      navigate(`/booking/${flightId}`, {
        state: {
          flight: selectedFlight,
          ticketType,
          quantity: qty,
        },
      });
    } else {
      alert('Không tìm thấy chuyến bay.');
    }
  };

  if (!flights || flights.length === 0) {
    return (
      <div className="text-center p-4 text-gray-600">
        Không tìm thấy chuyến bay nào.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="w-full bg-white rounded-lg">
        <thead>
          <tr className="bg-green-100 text-green-800">
            <th className="px-6 py-4 text-left font-semibold">Số Hiệu Chuyến Bay</th>
            <th className="px-6 py-4 text-left font-semibold">Hãng Hàng Không</th>
            <th className="px-6 py-4 text-left font-semibold">Tàu Bay</th>
            <th className="px-6 py-4 text-left font-semibold">Địa Điểm Đi</th>
            <th className="px-6 py-4 text-left font-semibold">Địa Điểm Đến</th>
            <th className="px-6 py-4 text-left font-semibold">Ngày Khởi Hành</th>
            <th className="px-6 py-4 text-left font-semibold">Giờ Khởi Hành</th>
            <th className="px-6 py-4 text-left font-semibold">Ngày Đến</th>
            <th className="px-6 py-4 text-left font-semibold">Giờ Đến</th>
            <th className="px-6 py-4 text-left font-semibold">Loại Giá Vé</th>
            <th className="px-6 py-4 text-left font-semibold">Giá Tiền (VND)</th>
            <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => {
            const availableClasses = ['economy', 'business', 'first'].filter(
              (cls) => flight[`available_${cls}_class_seats`] > 0,
            );
            if (availableClasses.length === 0) return null;

            return (
              <tr
                key={flight.id}
                className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition-colors duration-200`}
              >
                <td className="px-6 py-4">{flight.flight_number}</td>
                <td className="px-6 py-4">{flight.airline_name || 'N/A'}</td>
                <td className="px-6 py-4">{flight.aircraft_type || 'N/A'}</td>
                <td className="px-6 py-4">{flight.departure_city_name || 'N/A'}</td>
                <td className="px-6 py-4">{flight.arrival_city_name || 'N/A'}</td>
                <td className="px-6 py-4">{new Date(flight.departure_time).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-6 py-4">{new Date(flight.arrival_time).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-6 py-4">
                  <select
                    value={ticketTypes[flight.id]?.tripType || 'one-way'}
                    onChange={(e) => handleTicketTypeChange(flight.id, 'tripType', e.target.value)}
                    className="p-2 border rounded mr-2 bg-gray-100 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="one-way">Một chiều</option>
                    <option value="round-trip">Khứ hồi</option>
                  </select>
                  <select
                    value={ticketTypes[flight.id]?.classType || availableClasses[0]}
                    onChange={(e) => handleTicketTypeChange(flight.id, 'classType', e.target.value)}
                    className="p-2 border rounded mr-2 bg-gray-100 focus:ring-2 focus:ring-green-500"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {classTypeNames[cls]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={quantities[flight.id] || 1}
                    onChange={(e) => handleQuantityChange(flight.id, e.target.value)}
                    className="p-2 border rounded bg-gray-100 focus:ring-2 focus:ring-green-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} vé
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  {calculatePrice(flight.id, parseFloat(flight.base_economy_class_price)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </td>
                <td className="px-6 py-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBookFlight(flight.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition shadow-md"
                  >
                    Đặt vé
                  </motion.button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FlightList;