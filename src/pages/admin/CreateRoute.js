import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, getAirports, createRoute } from '../../services/api';
import { motion } from 'framer-motion';

function CreateRoute() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    departure_city_id: '',
    arrival_city_id: '',
    distance: '',
    base_price: ''
  });
  const [cities, setCities] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [citiesRes, airportsRes] = await Promise.all([
          getCities(),
          getAirports()
        ]);
        console.log('📊 Cities response:', citiesRes.data); // Debug
        console.log('📊 Airports response:', airportsRes.data); // Debug
        const citiesData = Array.isArray(citiesRes.data.data.data) ? citiesRes.data.data.data : [];
        // Sắp xếp theo name để đảm bảo thứ tự
        citiesData.sort((a, b) => a.name.localeCompare(b.name));
        const airportsData = Array.isArray(airportsRes.data) ? airportsRes.data : [];
        console.log('📊 Cities data:', citiesData);
        console.log('📊 Airports data:', airportsData);
        setCities(citiesData);
        setAirports(airportsData);
      } catch (err) {
        console.log('❌ Lỗi khi lấy dữ liệu:', err);
        setError('Không thể tải dữ liệu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const departureAirport = airports.find(a => a.city_id === form.departure_city_id);
      const arrivalAirport = airports.find(a => a.city_id === form.arrival_city_id);
      if (!departureAirport || !arrivalAirport) {
        throw new Error('Không tìm thấy sân bay cho thành phố đã chọn');
      }
      if (departureAirport.id === arrivalAirport.id) {
        throw new Error('Điểm đi và điểm đến không được trùng nhau');
      }

      const routeData = {
        departure_airport_id: departureAirport.id,
        arrival_airport_id: arrivalAirport.id,
        distance: parseFloat(form.distance.replace(/[^0-9.]/g, '')),
        base_price: parseFloat(form.base_price.replace(/[^0-9]/g, '')) || 0
      };

      if (isNaN(routeData.distance) || routeData.distance <= 0) {
        throw new Error('Khoảng cách phải là số dương');
      }
      if (isNaN(routeData.base_price)) {
        throw new Error('Giá cơ bản phải là số hợp lệ');
      }

      console.log('📊 Dữ liệu gửi lên backend:', routeData);
      await createRoute(routeData);
      alert('Tạo tuyến bay thành công!');
      navigate('/admin/flights', { state: { mode: 'existing' } });
    } catch (err) {
      console.log('❌ Lỗi khi tạo tuyến bay:', err);
      setError('Không thể tạo tuyến bay: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e, field) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = value ? parseInt(value).toLocaleString('vi-VN') : '';
    setForm({ ...form, [field]: formattedValue });
  };

  const handlePriceChange = (e, field) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = value ? parseInt(value).toLocaleString('vi-VN') : '';
    setForm({ ...form, [field]: formattedValue });
  };

  if (loading) return <div className="text-center p-6 text-gray-600">Đang tải...</div>;

  console.log('Cities state:', cities); // Debug state

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-6 bg-green-50 min-h-screen"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Tạo Tuyến Bay Mới</h1>
      {error && (
        <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
          {error}
          <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-green-100 max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Điểm Đi</label>
          <select
            name="departure_city_id"
            value={form.departure_city_id}
            onChange={handleInputChange}
            className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
            required
          >
            <option value="">Chọn thành phố</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Điểm Đến</label>
          <select
            name="arrival_city_id"
            value={form.arrival_city_id}
            onChange={handleInputChange}
            className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
            required
          >
            <option value="">Chọn thành phố</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Khoảng Cách (km)</label>
          <input
            type="text"
            name="distance"
            value={form.distance}
            onChange={(e) => handleNumberChange(e, 'distance')}
            className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
            required
            placeholder="Nhập khoảng cách"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Giá Cơ Bản (VND)</label>
          <input
            type="text"
            name="base_price"
            value={form.base_price}
            onChange={(e) => handlePriceChange(e, 'base_price')}
            className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
            required
            placeholder="Nhập giá cơ bản"
          />
        </div>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate('/admin/flights')}
            className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition font-semibold shadow-md w-full"
          >
            Quay lại
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold shadow-md w-full"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tạo Tuyến Bay'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default CreateRoute;