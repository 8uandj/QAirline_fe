import { useState, useEffect } from 'react';
import { createAircraft, getAircrafts, getAirlines } from '../../services/api';
import { motion } from 'framer-motion';

function AdminAircrafts() {
  const [formData, setFormData] = useState({
    airline_id: '',
    aircraft_type: '',
    custom_aircraft_type: '',
    total_first_class_seats: '',
    total_business_class_seats: '',
    total_economy_class_seats: '',
    status: '',
    aircraft_code: '',
    manufacturer: '',
    custom_manufacturer: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);

  const aircraftTypes = [
    'Airbus A321-200',
    'Boeing 787-9 Dreamliner',
    'ATR 72',
    'Airbus A330-200',
    'Airbus A350-900 XWB',
    'Boeing 777',
    'Boeing 737',
    'khác'
  ];

  const manufacturers = ['Airbus', 'Boeing', 'ATR', 'khác'];

  const statuses = ['Active', 'Maintenance', 'Retired'];

  const fetchAircrafts = async () => {
    try {
      const res = await getAircrafts();
      setAircrafts(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.log('❌ Lỗi lấy danh sách aircraft:', err);
      setError('Không thể tải danh sách aircraft: ' + err.message);
      setAircrafts([]);
    }
  };

  const fetchAirlines = async () => {
    try {
      const res = await getAirlines();
      setAirlines(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.log('❌ Lỗi lấy danh sách airlines:', err);
      setError('Không thể tải danh sách hãng hàng không: ' + err.message);
      setAirlines([]);
    }
  };

  useEffect(() => {
    fetchAircrafts();
    fetchAirlines();
  }, []);

  const generateSeatLayout = (totalSeats, rowsPerCabin, seatsPerRow, cabinPrefix) => {
  const cabinsNeeded = Math.ceil(totalSeats / (rowsPerCabin * seatsPerRow));
  let seatsLeft = totalSeats;
  const cabins = [];

  for (let cabinNum = 1; cabinNum <= cabinsNeeded; cabinNum++) {
    const seatList = [];
    for (let rowNum = 1; rowNum <= rowsPerCabin; rowNum++) {
      for (let colNum = 1; colNum <= seatsPerRow; colNum++) {
        if (seatsLeft > 0) {
          const rowChar = String.fromCharCode(64 + rowNum); // A, B, C, ...
          seatList.push(`${cabinPrefix}${cabinNum}-${rowChar}${colNum}`);
          seatsLeft--;
        }
      }
    }
    cabins.push({
      cabin: `${cabinPrefix}${cabinNum}`,
      rows: rowsPerCabin,
      columns: seatsPerRow,
      seats: seatList
    });
  }

  return cabins;
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    console.log('📊 Token gửi lên:', token);
    const dataToSubmit = {
      ...formData,
      aircraft_type: formData.aircraft_type === 'khác' ? formData.custom_aircraft_type : formData.aircraft_type,
      manufacturer: formData.manufacturer === 'khác' ? formData.custom_manufacturer : formData.manufacturer,
      total_first_class_seats: parseInt(formData.total_first_class_seats) || 0,
      total_business_class_seats: parseInt(formData.total_business_class_seats) || 0,
      total_economy_class_seats: parseInt(formData.total_economy_class_seats) || 0,
      seat_layout: {
        first_class: generateSeatLayout(
          parseInt(formData.total_first_class_seats) || 0,
          5, // 5 hàng/khoang cho First
          1, // 1 ghế/hàng
          'F'
        ),
        business_class: generateSeatLayout(
          parseInt(formData.total_business_class_seats) || 0,
          5, // 5 hàng/khoang cho Business
          2, // 2 ghế/hàng
          'B'
        ),
        economy_class: generateSeatLayout(
          parseInt(formData.total_economy_class_seats) || 0,
          10, // 10 hàng/khoang cho Economy
          4, // 4 ghế/hàng
          'E'
        )
      }
    };
    console.log('📊 Dữ liệu gửi lên:', dataToSubmit);
    const res = await createAircraft(dataToSubmit);
    setSuccess('Tạo aircraft thành công!');
    setFormData({
      airline_id: '',
      aircraft_type: '',
      custom_aircraft_type: '',
      total_first_class_seats: '',
      total_business_class_seats: '',
      total_economy_class_seats: '',
      status: '',
      aircraft_code: '',
      manufacturer: '',
      custom_manufacturer: ''
    });
    fetchAircrafts();
  } catch (err) {
    console.log('❌ Lỗi tạo aircraft:', err);
    if (err.response && err.response.status === 400) {
      setError(err.response.data.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
    } else if (err.response && err.response.status === 403) {
      setError('Không có quyền truy cập. Vui lòng kiểm tra vai trò của bạn.');
    } else {
      setError('Tạo aircraft thất bại: ' + err.message);
    }
  }
};

  return (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="container mx-auto p-6 bg-green-50 min-h-screen"
  >
    <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Quản lý Aircraft</h1>
    {error && (
      <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
        {error}
        <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
      </div>
    )}
    {success && (
      <div className="text-center p-4 text-green-600 bg-green-100 rounded-lg mb-6 shadow-md">
        {success}
      </div>
    )}
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-green-100 max-w-md mx-auto mb-8 space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">Hãng Hàng Không</label>
        <select
          name="airline_id"
          value={formData.airline_id}
          onChange={handleChange}
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
        <label className="block text-gray-700 font-medium mb-2">Loại Máy Bay</label>
        <select
          name="aircraft_type"
          value={formData.aircraft_type}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
        >
          <option value="">Chọn loại máy bay</option>
          {aircraftTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {formData.aircraft_type === 'khác' && (
          <input
            type="text"
            name="custom_aircraft_type"
            value={formData.custom_aircraft_type}
            onChange={handleChange}
            className="mt-2 p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
            placeholder="Nhập loại máy bay"
            required
          />
        )}
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Số Ghế Hạng Nhất</label>
        <input
          type="number"
          name="total_first_class_seats"
          value={formData.total_first_class_seats}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
          min="0"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Số Ghế Hạng Thương Gia</label>
        <input
          type="number"
          name="total_business_class_seats"
          value={formData.total_business_class_seats}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
          min="0"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Số Ghế Hạng Phổ Thông</label>
        <input
          type="number"
          name="total_economy_class_seats"
          value={formData.total_economy_class_seats}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
          min="0"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Trạng Thái</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
        >
          <option value="">Chọn trạng thái</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Mã Máy Bay</label>
        <input
          type="text"
          name="aircraft_code"
          value={formData.aircraft_code}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-2">Nhà Sản Xuất</label>
        <select
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          className="p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
          required
        >
          <option value="">Chọn nhà sản xuất</option>
          {manufacturers.map(manufacturer => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
        {formData.manufacturer === 'khác' && (
          <input
            type="text"
            name="custom_manufacturer"
            value={formData.custom_manufacturer}
            onChange={handleChange}
            className="mt-2 p-3 border border-green-200 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-green-500 transition"
            placeholder="Nhập nhà sản xuất"
            required
          />
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="bg-green-500 text-white p-3 rounded-lg w-full hover:bg-green-600 transition font-semibold shadow-md"
      >
        Tạo Aircraft
      </motion.button>
    </form>
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Danh sách Aircraft</h2>
      {aircrafts.length === 0 ? (
        <p className="text-gray-600 text-center">Chưa có aircraft nào.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-green-100 text-green-800">
                <th className="px-6 py-4 text-left font-semibold">Mã Máy Bay</th>
                <th className="px-6 py-4 text-left font-semibold">Loại Máy Bay</th>
                <th className="px-6 py-4 text-left font-semibold">Nhà Sản Xuất</th>
                <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {aircrafts.map((aircraft, index) => (
                <tr
                  key={aircraft.id}
                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition-colors duration-200`}
                >
                  <td className="px-6 py-4">{aircraft.aircraft_code}</td>
                  <td className="px-6 py-4">{aircraft.aircraft_type}</td>
                  <td className="px-6 py-4">{aircraft.manufacturer}</td>
                  <td className="px-6 py-4">{aircraft.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </motion.div>
);
}

export default AdminAircrafts;