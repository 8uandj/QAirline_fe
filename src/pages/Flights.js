import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFlights, searchFlights, getCities, getAirports } from '../services/api';
import { staticFlights } from '../data/flights';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select'; // Thêm react-select

function Flights() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({ from_city_id: '', to_city_id: '', date: '', flight_number: '' });
  const [ticketTypes, setTicketTypes] = useState({});
  const [quantities, setQuantities] = useState({});

  const classTypeNames = {
    economy: 'Phổ thông',
    business: 'Thương gia',
    first: 'Hạng nhất',
  };

  // Style cho react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: '#e5e7eb',
      boxShadow: 'none',
      '&:hover': { borderColor: '#10b981' },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? '#10b981' : isFocused ? '#f3f4f6' : 'white',
      color: isSelected ? 'white' : '#1f2937',
      '&:active': { backgroundColor: '#e5e7eb' },
    }),
  };

  useEffect(() => {
    setLoading(true);
    // Reset search khi reload trang
    setSearch({ from_city_id: '', to_city_id: '', date: '', flight_number: '' });

    const fetchData = async () => {
      try {
        let flightsData = [];
        if (state?.searchData) {
          console.log('📊 State searchData:', state.searchData);
          const res = await searchFlights(state.searchData);
          console.log('📊 Search response:', res);
          flightsData = Array.isArray(res.data.data) ? res.data.data : [];
        } else if (state?.flights) {
          console.log('📊 State flights:', state.flights);
          flightsData = Array.isArray(state.flights) ? state.flights : [];
        } else {
          console.log('📊 Fetching all flights');
          const flightsRes = await getFlights();
          console.log('📊 Get flights response:', flightsRes);
          flightsData = Array.isArray(flightsRes.data.data) ? flightsRes.data.data : [];
        }

        console.log('📊 Raw flights data:', flightsData);
        const availableFlights = flightsData.filter(
          (flight) =>
            flight.available_first_class_seats > 0 ||
            flight.available_business_class_seats > 0 ||
            flight.available_economy_class_seats > 0,
        );
        console.log('📊 Available flights:', availableFlights);
        setFlights(availableFlights);

        const [citiesRes, airportsRes] = await Promise.all([
          getCities(),
          getAirports(),
        ]);
        const citiesData = Array.isArray(citiesRes.data.data.data) ? citiesRes.data.data.data : [];
        console.log('📊 Cities data:', citiesData);
        setCities(citiesData);

        const airportsData = Array.isArray(airportsRes.data) ? airportsRes.data : [];
        console.log('📊 Airports data:', airportsData);
        setAirports(airportsData);
      } catch (err) {
        console.error('Error fetching data:', err.message, err.stack);
        setError('Không thể tải dữ liệu: ' + err.message);
        setFlights(staticFlights);

        const airportSet = new Set();
        staticFlights.forEach((flight) => {
          airportSet.add(
            JSON.stringify({
              id: flight.departure_airport_id,
              name: flight.departure_airport_name,
              code: flight.departure_airport_code,
            }),
          );
          airportSet.add(
            JSON.stringify({
              id: flight.arrival_airport_id,
              name: flight.arrival_airport_name,
              code: flight.arrival_airport_code,
            }),
          );
        });
        const uniqueAirports = Array.from(airportSet).map((airport) => JSON.parse(airport));
        setAirports(uniqueAirports);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let searchData = {};
      if (search.flight_number) {
        searchData = { flight_number: search.flight_number.trim() };
      } else {
        if (!search.from_city_id || !search.to_city_id || !search.date) {
          throw new Error('Vui lòng chọn đầy đủ thành phố đi, đến và ngày');
        }
        const fromAirport = airports.find((a) => a.city_id === search.from_city_id);
        const toAirport = airports.find((a) => a.city_id === search.to_city_id);
        if (!fromAirport || !toAirport) {
          console.error('📊 Airports data:', airports);
          console.error('📊 Selected cities:', { from_city_id: search.from_city_id, to_city_id: search.to_city_id });
          throw new Error('Không tìm thấy sân bay cho thành phố đã chọn');
        }
        searchData = {
          legs: [
            {
              from_airport_id: fromAirport.id,
              to_airport_id: toAirport.id,
              date: search.date,
            },
          ],
        };
      }

      console.log('📊 Flights search data:', searchData);
      const res = await searchFlights(searchData);
      console.log('📊 Flights search response:', res);
      const flightsData = Array.isArray(res.data.data) ? res.data.data : [];
      console.log('📊 Raw flights data:', flightsData);
      const availableFlights = flightsData.filter(
        (flight) =>
          flight.available_first_class_seats > 0 ||
          flight.available_business_class_seats > 0 ||
          flight.available_economy_class_seats > 0,
      );
      console.log('📊 Available flights:', availableFlights);
      const sortedFlights = availableFlights.sort(
        (a, b) => new Date(a.departure_time) - new Date(b.departure_time),
      );
      setFlights(sortedFlights);
      if (sortedFlights.length === 0) {
        setError('Không tìm thấy chuyến bay nào phù hợp.');
      }
    } catch (err) {
      console.error('Search error:', err.message, err.stack);
      setError('Không thể tìm kiếm: ' + err.message);
      setFlights(staticFlights);
    } finally {
      setLoading(false);
    }
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
    console.log('📊 Quantity changed for flightId:', flightId, 'to:', quantity);
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
        setError(`Chỉ còn ${availableSeats} ghế ${classTypeNames[ticketType.classType]} cho chuyến bay này.`);
        return;
      }
      console.log('📊 Chuyển hướng đến đặt vé với flightId:', flightId, 'số lượng:', qty);
      navigate(`/booking/${flightId}`, {
        state: {
          flight: selectedFlight,
          ticketType,
          quantity: qty,
        },
      });
    } else {
      setError('Không tìm thấy chuyến bay.');
    }
  };

  // Thêm hàm xóa bộ lọc
  const handleClearSearch = () => {
    setSearch({ from_city_id: '', to_city_id: '', date: '', flight_number: '' });
    setLoading(true);
    setError(null);
    const fetchAllFlights = async () => {
      try {
        const flightsRes = await getFlights();
        console.log('📊 Get flights response:', flightsRes);
        const flightsData = Array.isArray(flightsRes.data.data) ? flightsRes.data.data : [];
        const availableFlights = flightsData.filter(
          (flight) =>
            flight.available_first_class_seats > 0 ||
            flight.available_business_class_seats > 0 ||
            flight.available_economy_class_seats > 0,
        );
        setFlights(availableFlights);
      } catch (err) {
        console.error('Error fetching all flights:', err.message, err.stack);
        setError('Không thể tải dữ liệu: ' + err.message);
        setFlights(staticFlights);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFlights();
  };

  if (loading) return <div className="text-center p-4">Đang tải...</div>;
  console.log('📊 Flights state:', flights);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-700 text-center">Tìm chuyến bay</h1>
      {error && (
        <div className="text-center p-4 text-red-500 bg-red-100 rounded-lg mb-6 shadow-md">
          {error}
          <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <Select
            options={cities.map(city => ({
              value: city.id,
              label: city.name,
            }))}
            value={cities.find(city => city.id === search.from_city_id) ? { value: search.from_city_id, label: cities.find(city => city.id === search.from_city_id).name } : null}
            onChange={(selected) => setSearch({ ...search, from_city_id: selected ? selected.value : '' })}
            placeholder="Thành phố đi"
            styles={selectStyles}
            isClearable
            isSearchable // Bật tìm kiếm
          />
        </div>
        <div className="flex-1">
          <Select
            options={cities
              .filter(city => city.id !== search.from_city_id)
              .map(city => ({
                value: city.id,
                label: city.name,
              }))}
            value={cities.find(city => city.id === search.to_city_id) ? { value: search.to_city_id, label: cities.find(city => city.id === search.to_city_id).name } : null}
            onChange={(selected) => setSearch({ ...search, to_city_id: selected ? selected.value : '' })}
            placeholder="Thành phố đến"
            styles={selectStyles}
            isClearable
            isSearchable // Bật tìm kiếm
          />
        </div>
        <input
          type="date"
          value={search.date}
          onChange={(e) => setSearch({ ...search, date: e.target.value })}
          className="p-3 border rounded-lg flex-1 bg-gray-50 focus:ring-2 focus:ring-green-500"
          min={new Date().toISOString().split('T')[0]}
        />
        <input
          type="text"
          value={search.flight_number}
          onChange={(e) => setSearch({ ...search, flight_number: e.target.value })}
          placeholder="Số hiệu chuyến bay (VD: VN123)"
          className="p-3 border rounded-lg flex-1 bg-gray-50 focus:ring-2 focus:ring-green-500"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition shadow-md"
        >
          Tìm kiếm
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleClearSearch}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition shadow-md"
        >
          Xóa bộ lọc
        </motion.button>
      </form>

      {/* Flights Table */}
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
            {flights.length > 0 ? (
              flights.map((flight, index) => {
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
              })
            ) : (
              <tr>
                <td colSpan="12" className="px-6 py-4 text-center text-gray-600">
                  Không tìm thấy chuyến bay nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default Flights;