import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlights, createFlight, delayFlight, getAircrafts, getAirlines, getRoutes } from '../../services/api';
import { motion } from 'framer-motion';

function AdminFlights() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState({
    airline_id: '',
    route_id: '',
    flight_number: '',
    aircraft_id: '',
    departure_time: '',
    arrival_time: '',
    base_economy_class_price: '',
    base_business_class_price: '',
    base_first_class_price: '',
    flight_status: 'Scheduled',
  });
  const [delayForm, setDelayForm] = useState({ flightId: '', newDeparture: '', newArrival: '' });

  useEffect(() => {
    setLoading(true);

    const fetchFlights = async () => {
      try {
        const flightsRes = await getFlights();
        console.log('📊 Flight response:', flightsRes.data);
        console.log('📊 Dữ liệu chuyến bay:', flightsRes.data.data);
        setFlights(Array.isArray(flightsRes.data.data) ? flightsRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách chuyến bay:', err);
        setError('Không thể tải danh sách chuyến bay: ' + err.message);
      }
    };

    const fetchAircrafts = async () => {
      try {
        const aircraftsRes = await getAircrafts();
        console.log('📊 Dữ liệu tàu bay:', aircraftsRes.data);
        setAircrafts(Array.isArray(aircraftsRes.data?.data) ? aircraftsRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách tàu bay:', err);
        setError('Không thể tải danh sách tàu bay: ' + err.message);
      }
    };

    const fetchAirlines = async () => {
      try {
        const airlinesRes = await getAirlines();
        console.log('📊 Dữ liệu hãng hàng không:', airlinesRes.data);
        setAirlines(Array.isArray(airlinesRes.data?.data) ? airlinesRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách hãng hàng không:', err);
        setError('Không thể tải danh sách hãng hàng không: ' + err.message);
      }
    };

    const fetchRoutes = async () => {
      try {
        const routesRes = await getRoutes();
        console.log('📊 Dữ liệu tuyến bay:', routesRes.data);
        setRoutes(Array.isArray(routesRes.data?.data) ? routesRes.data.data : []);
      } catch (err) {
        console.log('❌ Lỗi khi lấy danh sách tuyến bay:', err);
        setError('Không thể tải danh sách tuyến bay: ' + err.message);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        fetchFlights(),
        fetchAircrafts(),
        fetchAirlines(),
        fetchRoutes()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const departureTimeISO = new Date(form.departure_time).toISOString();
      const arrivalTimeISO = new Date(form.arrival_time).toISOString();

      if (new Date(departureTimeISO) >= new Date(arrivalTimeISO)) {
        throw new Error('Giờ khởi hành phải nhỏ hơn giờ đến.');
      }

      const baseEconomyPrice = parseFloat(form.base_economy_class_price.replace(/[^0-9]/g, '')) || 0;
      const baseBusinessPrice = parseFloat(form.base_business_class_price.replace(/[^0-9]/g, '')) || 0;
      const baseFirstClassPrice = parseFloat(form.base_first_class_price.replace(/[^0-9]/g, '')) || 0;

      if (isNaN(baseEconomyPrice)) {
        throw new Error('Giá vé phổ thông phải là một số hợp lệ.');
      }
      if (isNaN(baseBusinessPrice)) {
        throw new Error('Giá vé thương gia phải là một số hợp lệ.');
      }
      if (isNaN(baseFirstClassPrice)) {
        throw new Error('Giá vé hạng nhất phải là một số hợp lệ.');
      }

      const flightData = {
        airline_id: form.airline_id,
        route_id: form.route_id,
        aircraft_id: form.aircraft_id,
        flight_number: form.flight_number,
        departure_time: departureTimeISO,
        arrival_time: arrivalTimeISO,
        flight_status: form.flight_status,
        base_economy_class_price: baseEconomyPrice,
        base_business_class_price: baseBusinessPrice,
        base_first_class_price: baseFirstClassPrice
      };

      console.log('📊 Dữ liệu gửi lên backend:', flightData);

      const newFlight = await createFlight(flightData);
      console.log('📊 Chuyến bay mới:', newFlight.data);
      const flightsRes = await getFlights();
      console.log('📊 Dữ liệu chuyến bay sau refetch:', flightsRes.data.data);
      setFlights(Array.isArray(flightsRes.data.data) ? flightsRes.data.data : []);
      setForm({
        airline_id: '',
        route_id: '',
        flight_number: '',
        aircraft_id: '',
        departure_time: '',
        arrival_time: '',
        base_economy_class_price: '',
        base_business_class_price: '',
        base_first_class_price: '',
        flight_status: 'Scheduled',
      });
      setMode(null);
      alert('Thêm chuyến bay thành công!');
    } catch (err) {
      console.log('❌ Lỗi khi tạo chuyến bay:', err);
      setError('Không thể thêm chuyến bay: ' + err.message);
    }
  };

  const handleDelaySubmit = async (e) => {
    e.preventDefault();
    try {
      const newDepartureISO = new Date(delayForm.newDeparture).toISOString();
      const newArrivalISO = new Date(delayForm.newArrival).toISOString();

      if (new Date(newDepartureISO) >= new Date(newArrivalISO)) {
        throw new Error('Giờ khởi hành mới phải nhỏ hơn giờ đến mới.');
      }

      const updatedFlight = await delayFlight(delayForm.flightId, {
        newDeparture: newDepartureISO,
        newArrival: newArrivalISO
      });
      setFlights(flights.map(flight =>
        flight.id === delayForm.flightId ? updatedFlight.data : flight
      ));
      setDelayForm({ flightId: '', newDeparture: '', newArrival: '' });
      alert('Cập nhật giờ khởi hành thành công!');
    } catch (err) {
      console.log('❌ Lỗi khi cập nhật giờ khởi hành:', err);
      setError('Không thể cập nhật giờ khởi hành: ' + err.message);
    }
  };

  const handlePriceChange = (e, field) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = value ? parseInt(value).toLocaleString('vi-VN') : '';
    setForm({ ...form, [field]: formattedValue });
  };

  if (loading) return <div className="text-center p-6 text-gray-600">Đang tải...</div>;

  console.log('📊 Flights state:', flights);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Quản lý Chuyến Bay</h1>
      {error && (
        <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
          {error}
          <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
        </div>
      )}
      {!mode && (
        <div className="flex justify-center space-x-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode('existing')}
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md"
          >
            Existing Route
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/create-route')}
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md"
          >
            Create New Route
          </motion.button>
        </div>
      )}
      {mode === 'existing' && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Thêm Chuyến Bay Mới</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-green-100 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Hãng Hàng Không</label>
                <select
                  name="airline_id"
                  value={form.airline_id}
                  onChange={(e) => setForm({ ...form, airline_id: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                >
                  <option value="">Chọn hãng hàng không</option>
                  {airlines.map(airline => (
                    <option key={airline.id} value={airline.id}>
                      {airline.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Tuyến Bay</label>
                <select
                  name="route_id"
                  value={form.route_id}
                  onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                >
                  <option value="">Chọn tuyến bay</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.departure_airport_name} ({route.departure_airport_code}) → {route.arrival_airport_name} ({route.arrival_airport_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Số Hiệu Chuyến Bay</label>
                <input
                  type="text"
                  name="flight_number"
                  value={form.flight_number}
                  onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Tàu Bay</label>
                <select
                  name="aircraft_id"
                  value={form.aircraft_id}
                  onChange={(e) => setForm({ ...form, aircraft_id: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                >
                  <option value="">Chọn tàu bay</option>
                  {aircrafts.map(aircraft => (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.aircraft_code} ({aircraft.manufacturer})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giờ Khởi Hành</label>
                <input
                  type="datetime-local"
                  name="departure_time"
                  value={form.departure_time}
                  onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giờ Đến</label>
                <input
                  type="datetime-local"
                  name="arrival_time"
                  value={form.arrival_time}
                  onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá Vé Phổ Thông (VND)</label>
                <input
                  type="text"
                  name="base_economy_class_price"
                  value={form.base_economy_class_price}
                  onChange={(e) => handlePriceChange(e, 'base_economy_class_price')}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                  placeholder="Nhập giá vé phổ thông"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá Vé Thương Gia (VND)</label>
                <input
                  type="text"
                  name="base_business_class_price"
                  value={form.base_business_class_price}
                  onChange={(e) => handlePriceChange(e, 'base_business_class_price')}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  placeholder="Nhập giá vé thương gia (mặc định 0 nếu bỏ trống)"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá Vé Hạng Nhất (VND)</label>
                <input
                  type="text"
                  name="base_first_class_price"
                  value={form.base_first_class_price}
                  onChange={(e) => handlePriceChange(e, 'base_first_class_price')}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  placeholder="Nhập giá vé hạng nhất (mặc định 0 nếu bỏ trống)"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Trạng Thái Chuyến Bay</label>
                <select
                  name="flight_status"
                  value={form.flight_status}
                  onChange={(e) => setForm({ ...form, flight_status: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setMode(null)}
                  className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition font-semibold shadow-md w-full"
                >
                  Quay lại
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md w-full"
                >
                  Thêm Chuyến Bay
                </motion.button>
              </div>
            </form>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">Cập nhật Giờ Khởi Hành</h2>
            <form onSubmit={handleDelaySubmit} className="bg-white p-6 rounded-xl shadow-md border border-green-100 space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Chọn Chuyến Bay</label>
                <select
                  value={delayForm.flightId}
                  onChange={(e) => setDelayForm({ ...delayForm, flightId: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                >
                  <option value="">Chọn chuyến bay</option>
                  {flights.map(flight => (
                    <option key={flight.id} value={flight.id}>
                      {flight.flight_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giờ Khởi Hành Mới</label>
                <input
                  type="datetime-local"
                  value={delayForm.newDeparture}
                  onChange={(e) => setDelayForm({ ...delayForm, newDeparture: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giờ Đến Mới</label>
                <input
                  type="datetime-local"
                  value={delayForm.newArrival}
                  onChange={(e) => setDelayForm({ ...delayForm, newArrival: e.target.value })}
                  className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md w-full"
              >
                Cập nhật Giờ Khởi Hành
              </motion.button>
            </form>
          </div>
        </>
      )}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Danh sách Chuyến Bay</h2>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="px-6 py-4 text-left font-semibold">Số Hiệu</th>
                <th className="px-6 py-4 text-left font-semibold">Tàu Bay</th>
                <th className="px-6 py-4 text-left font-semibold">Khởi Hành</th>
                <th className="px-6 py-4 text-left font-semibold">Đến</th>
                <th className="px-6 py-4 text-left font-semibold">Giá Phổ Thông</th>
                <th className="px-6 py-4 text-left font-semibold">Giá Thương Gia</th>
                <th className="px-6 py-4 text-left font-semibold">Giá Hạng Nhất</th>
              </tr>
            </thead>
            <tbody>
              {flights.length > 0 ? (
                flights.map((flight, index) => (
                  <tr
                    key={flight.id}
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4">{flight.flight_number}</td>
                    <td className="px-6 py-4">{flight.aircraft_type}</td>
                    <td className="px-6 py-4">{flight.departure_city_name || 'N/A'}</td>
                    <td className="px-6 py-4">{flight.arrival_city_name || 'N/A'}</td>
                    <td className="px-6 py-4">{flight.base_economy_class_price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                    <td className="px-6 py-4">{flight.base_business_class_price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}</td>
                    <td className="px-6 py-4">{flight.base_first_class_price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-600">Không có chuyến bay nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Danh sách Tuyến Bay</h2>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="px-6 py-4 text-left font-semibold">Sân Bay Đi</th>
                <th className="px-6 py-4 text-left font-semibold">Sân Bay Đến</th>
                <th className="px-6 py-4 text-left font-semibold">Khoảng Cách (km)</th>
                <th className="px-6 py-4 text-left font-semibold">Giá Cơ Bản (VND)</th>
              </tr>
            </thead>
            <tbody>
              {routes.length > 0 ? (
                routes.map((route, index) => (
                  <tr
                    key={route.id}
                    className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4">{route.departure_airport_name} ({route.departure_airport_code})</td>
                    <td className="px-6 py-4">{route.arrival_airport_name} ({route.arrival_airport_code})</td>
                    <td className="px-6 py-4">{route.distance?.toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4">{route.base_price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-600">Không có tuyến bay nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminFlights;