import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getFlights, searchFlights, getCities, getAirports } from '../services/api';
import { staticFlights } from '../data/flights';
import { motion, useInView } from 'framer-motion';
import Select from 'react-select';
import FlightList from '../components/FlightList';

// Component wrapper để thêm hiệu ứng cuộn
const Section = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

function Home({ destinations }) {
  const { register, handleSubmit, watch, setValue } = useForm();
  const navigate = useNavigate();
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [cities, setCities] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleDestinations, setVisibleDestinations] = useState(3);
  const [selectedFlightData, setSelectedFlightData] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState(null); // Thêm state cho ID chuyến bay được chọn

  const fromCityId = watch('from_city_id');

  const specialOffers = [
    { id: 1, title: "Khuyến mãi hè", description: "Giảm 30% cho các chuyến bay nội địa!", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", tag: "Hot", tagColor: "bg-green-600" },
    { id: 2, title: "Bay quốc tế giá rẻ", description: "Giảm 20% cho các chuyến bay đến Thái Lan!", image: "https://bizweb.dktcdn.net/100/168/991/files/alo-tour-chuyen-ban-ve-may-bay-trong-nuoc-va-quoc-te-gia-re-2.jpg?v=1541581352069", tag: "International", tagColor: "bg-green-600" }
  ];

  const notifications = [
    { id: 1, title: "Thay đổi lịch bay", description: "Một số chuyến bay đến Đà Nẵng có thể bị ảnh hưởng do thời tiết xấu.", image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1", tag: "Important", tagColor: "bg-green-600" },
    { id: 2, title: "Nâng cấp sân bay", description: "Sân bay Tân Sơn Nhất đang được nâng cấp, vui lòng đến sớm 30 phút.", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05", tag: "Notice", tagColor: "bg-green-600" }
  ];

  const testimonials = [
    { id: 1, name: "Nguyễn Văn A", quote: "Chuyến bay rất thoải mái, dịch vụ tuyệt vời!" },
    { id: 2, name: "Trần Thị B", quote: "Giá vé hợp lý, đặt vé dễ dàng!" },
    { id: 3, name: "Lê Văn C", quote: "Hỗ trợ khách hàng rất nhiệt tình!" }
  ];

  const quoteColors = ['text-blue-500', 'text-green-500', 'text-orange-500'];

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [citiesRes, airportsRes, flightsRes] = await Promise.all([
          getCities(),
          getAirports(),
          getFlights()
        ]);
        const citiesData = citiesRes.data.data.data || [];
        setCities(citiesData);

        const airportsData = airportsRes.data || [];
        setAirports(airportsData);

        const flights = flightsRes.data.data || staticFlights;
        const formattedFlights = flights.map(flight => ({
          id: flight.id,
          flight_number: flight.flight_number,
          source_airport_name: flight.departure_airport_name,
          destination_airport_name: flight.arrival_airport_name,
          departure_city_name: flight.departure_city_name,
          arrival_city_name: flight.arrival_city_name,
          departure_airport_id: flight.departure_airport_id,
          arrival_airport_id: flight.arrival_airport_id,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          price: parseFloat(flight.base_economy_class_price) || 1500000,
          available_seats: flight.available_economy_class_seats || 45,
          airline_name: flight.airline_name,
          aircraft_type: flight.aircraft_type,
          available_economy_class_seats: flight.available_economy_class_seats,
          available_business_class_seats: flight.available_business_class_seats,
          available_first_class_seats: flight.available_first_class_seats,
          base_business_class_price: parseFloat(flight.base_business_class_price) || 2250000,
          base_first_class_price: parseFloat(flight.base_first_class_price) || 3000000,
        }));

        const latestFlights = formattedFlights
          .sort((a, b) => new Date(b.departure_time) - new Date(a.departure_time))
          .slice(0, 4);
        setFeaturedFlights(latestFlights);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu: ' + err.message);

        const sortedStaticFlights = staticFlights
          .sort((a, b) => new Date(b.departure_time) - new Date(a.departure_time))
          .slice(0, 4);
        setFeaturedFlights(sortedStaticFlights);

        const airportSet = new Set();
        staticFlights.forEach(flight => {
          airportSet.add(JSON.stringify({
            id: flight.departure_airport_id,
            name: flight.departure_airport_name,
            code: flight.departure_airport_code
          }));
          airportSet.add(JSON.stringify({
            id: flight.arrival_airport_id,
            name: flight.arrival_airport_name,
            code: flight.arrival_airport_code
          }));
        });
        const uniqueAirports = Array.from(airportSet).map(airport => JSON.parse(airport));
        setAirports(uniqueAirports);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (!data.from_city_id || !data.to_city_id || !data.travelDate) {
        throw new Error('Vui lòng chọn đầy đủ thành phố đi, đến và ngày đi');
      }

      const fromAirport = airports.find((a) => a.city_id === data.from_city_id);
      const toAirport = airports.find((a) => a.city_id === data.to_city_id);
      if (!fromAirport || !toAirport) {
        console.error('📊 Airports data:', airports);
        console.error('📊 Selected cities:', { from_city_id: data.from_city_id, to_city_id: data.to_city_id });
        throw new Error('Không tìm thấy sân bay cho thành phố đã chọn');
      }

      const searchData = {
        legs: [
          {
            from_airport_id: fromAirport.id,
            to_airport_id: toAirport.id,
            date: data.travelDate,
          },
        ],
      };
      console.log('📊 Home search data:', searchData);
      const res = await searchFlights(searchData);
      console.log('📊 Home search response:', res);
      navigate('/flights', { state: { flights: res.data.data } });
    } catch (err) {
      console.error('Search failed:', err.message, err.stack);
      setError('Tìm kiếm chuyến bay thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFlight = async (flight) => {
    setLoading(true);
    setError(null);
    setSelectedFlightId(flight.id); // Cập nhật ID chuyến bay được chọn
    try {
      const searchData = {
        flight_id: flight.id
      };
      console.log('📊 Fetching flight with searchData:', searchData);
      const res = await searchFlights(searchData);
      console.log('📊 Flight search response:', res);
      setSelectedFlightData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching flight:', err.message, err.stack);
      setError('Không thể tải thông tin chuyến bay: ' + err.message);
      setSelectedFlightData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExploreDestination = (destinationName) => {
    navigate(`/destination/${encodeURIComponent(destinationName.toLowerCase())}`);
  };

  const handleViewMoreDestinations = () => {
    setVisibleDestinations(destinations.length);
  };

  const handleViewLessDestinations = () => {
    setVisibleDestinations(3);
  };

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

  return (
    <div>
      {/* Banner ảnh đầu trang */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative bg-cover bg-center h-96"
        style={{ backgroundImage: "url('https://free.vector6.com/wp-content/uploads/2020/03/StockAnhDep001.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl font-bold mb-4">Khám phá Việt Nam cùng QAirline</h1>
            <p className="text-xl mb-6">Đặt vé ngay hôm nay để nhận ưu đãi lên đến 30%!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/flights')}
              className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition"
            >
              Đặt vé ngay
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Ô tìm chuyến bay */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="container mx-auto p-5 flex justify-center"
      >
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-4xl border border-green-200">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Select
                options={cities.map(city => ({
                  value: city.id,
                  label: city.name
                }))}
                onChange={(selected) => setValue('from_city_id', selected ? selected.value : '')}
                placeholder="Chọn thành phố đi"
                styles={selectStyles}
                isClearable
                isSearchable
              />
            </div>
            <div className="flex-1">
              <Select
                options={cities
                  .filter(city => city.id !== fromCityId)
                  .map(city => ({
                    value: city.id,
                    label: city.name
                  }))}
                onChange={(selected) => setValue('to_city_id', selected ? selected.value : '')}
                placeholder="Chọn thành phố đến"
                styles={selectStyles}
                isClearable
                isSearchable
              />
            </div>
            <input
              type="date"
              {...register('travelDate', { required: true })}
              className="p-3 border border-gray-200 rounded-lg flex-1 focus:ring-2 focus:ring-green-500"
              min={new Date().toISOString().split('T')[0]}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang tìm...' : 'Tìm chuyến bay'}
            </motion.button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </motion.div>

      {/* Chuyến bay nổi bật */}
      <Section className="container mx-auto p-6 mt-8 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-lg">
        <h2 className="text-4xl font-bold mb-8 text-green-700 text-center">Chuyến Bay Nổi Bật</h2>
        {loading ? (
          <div className="text-center p-4 text-gray-600">Đang tải...</div>
        ) : (
          <>
            {error && (
              <div className="text-center p-4 text-red-500 bg-red-100 rounded-lg mb-6">
                {error}
                <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFlights.length > 0 ? (
                featuredFlights.map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`rounded-xl shadow-xl border border-green-200 overflow-hidden hover:shadow-2xl transition-shadow ${selectedFlightId === flight.id ? 'bg-green-100' : 'bg-white'}`} // Thêm màu xanh nhạt khi được chọn
                  >
                    <div className="p-6">
                      <div className="text-2xl font-bold text-green-800 mb-3 text-center flex flex-col items-center">
                        <span>{flight.departure_city_name}</span>
                        <span className="my-1">-></span>
                        <span>{flight.arrival_city_name}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {flight.flight_number}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold">Khởi hành:</span> {new Date(flight.departure_time).toLocaleString('vi-VN')}
                      </p>
                      <p className="text-gray-600 mb-4">
                        <span className="font-semibold">Đến:</span> {new Date(flight.arrival_time).toLocaleString('vi-VN')}
                      </p>
                      <p className="text-2xl font-bold text-orange-500 mb-4">
                        Chỉ từ {flight.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewFlight(flight)}
                        className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
                      >
                        Đặt ngay
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-600 col-span-4">Không có chuyến bay nổi bật.</div>
              )}
            </div>
            {/* Hiển thị bảng FlightList */}
            {selectedFlightData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <h3 className="text-2xl font-bold text-green-700 mb-4">Chuyến bay đã chọn</h3>
                <FlightList flights={selectedFlightData} />
              </motion.div>
            )}
          </>
        )}
      </Section>

      {/* Giữ nguyên các phần còn lại */}
      <hr className="border-t border-gray-300 my-8" />
      <Section className="container mx-auto p-2 bg-blue-50" delay={0.2}>
        <h2 className="text-3xl font-bold mb-6 text-green-600">Điểm đến phổ biến</h2>
        <div className="space-y-6">
          {destinations.slice(0, visibleDestinations).map((dest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-cover bg-center h-80 rounded-lg overflow-hidden"
              style={{ backgroundImage: `url(${dest.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-6">
                <h3 className="text-3xl font-bold text-white drop-shadow-md">{dest.name}</h3>
                <p className="text-lg text-white drop-shadow-md mt-2">Nhiệt độ: {dest.temperature}</p>
                <p className="text-base text-white drop-shadow-md mt-2 max-w-md">{dest.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExploreDestination(dest.name)}
                  className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
                >
                  Khám phá
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          {visibleDestinations < destinations.length ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewMoreDestinations}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
            >
              Xem thêm
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewLessDestinations}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
            >
              Thu gọn
            </motion.button>
          )}
        </div>
      </Section>
      <hr className="border-t border-gray-300 my-8" />
      <Section className="container mx-auto p-2 bg-green-50" delay={0.4}>
        <h2 className="text-3xl font-bold mb-6 text-green-600">Ưu đãi đặc biệt</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <span className={`${offer.tagColor} text-white text-xs font-bold px-2 py-1 rounded`}>{offer.tag}</span>
                  <h3 className="text-xl font-semibold ml-2 text-gray-800">{offer.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/flights')}
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-orange-500 transition-colors"
                >
                  Đặt ngay
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
      <hr className="border-t border-gray-200 my-8" />
      <Section className="container mx-auto p-2 bg-green-50/50" delay={0.5}>
        <h2 className="text-3xl font-bold mb-6 text-green-600">Thông báo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img src={notification.image} alt={notification.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <span className={`${notification.tagColor} text-white text-xs font-bold px-2 py-1 rounded`}>{notification.tag}</span>
                  <h3 className="text-xl font-semibold ml-2 text-gray-800">{notification.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{notification.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/notifications')}
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-orange-500 transition-colors"
                >
                  Xem ngay
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
      <hr className="border-t border-gray-300 my-8" />
      <Section className="container mx-auto p-2 bg-green-50" delay={0.6}>
        <h2 className="text-3xl font-bold mb-6 text-green-600">Đánh giá từ khách hàng</h2>
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-2 bg-white shadow-md rounded-lg"
            >
              <p className="text-gray-600 italic">
                <span className={`text-3xl ${quoteColors[index % quoteColors.length]} mr-1`}>"</span>
                {testimonial.quote}
                <span className={`text-3xl ${quoteColors[index % quoteColors.length]} ml-1`}>"</span>
              </p>
              <p className="text-green-600 font-semibold mt-2">{testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </Section>
      <hr className="border-t border-gray-300 my-8" />
      <Section className="container mx-auto p-2 bg-white" delay={0.8}>
        <h2 className="text-3xl font-bold mb-6 text-green-600">Thông tin máy bay</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Bamboo_Airways_%28VN-A819%29_Boeing_787-9_Dreamliner_at_Noi_Bai_International_Airport.jpg/800px-Bamboo_Airways_%28VN-A819%29_Boeing_787-9_Dreamliner_at_Noi_Bai_International_Airport.jpg" alt="Boeing 787" className="w-full h-48 object-cover rounded" />
            <h3 className="text-xl font-semibold mt-2 text-green-600">Boeing 787 Dreamliner</h3>
            <p className="text-gray-600">Máy bay hiện đại với cabin rộng rãi và tiện nghi cao cấp.</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/A350_First_Flight_-_Low_pass_02.jpg/800px-A350_First_Flight_-_Low_pass_02.jpg" alt="Airbus A350" className="w-full h-48 object-cover rounded" />
            <h3 className="text-xl font-semibold mt-2 text-green-600">Airbus A350</h3>
            <p className="text-gray-600">Máy bay tiết kiệm nhiên liệu với công nghệ tiên tiến.</p>
          </div>
        </div>
      </Section>
      <hr className="border-t border-gray-300 my-8" />
      <Section className="container mx-auto p-2 bg-white" delay={1.0}>
        <h2 className="text-3xl font-bold mb-6 text-green-600">Cẩm nang du lịch địa phương</h2>
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg flex items-center">
            <img src="https://media.thuonghieucongluan.vn/uploads/2018_08_14/le-hoi-am-thuc-ha-noi-2018-1534180078.jpg" alt="Ẩm thực" className="w-24 h-24 object-cover rounded mr-4" />
            <div>
              <h3 className="text-xl font-semibold text-green-600">Khám phá ẩm thực Việt Nam</h3>
              <p className="text-gray-600">Thưởng thức các món ăn đặc sản tại các địa phương.</p>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg flex items-center">
            <img src="https://langnambo.vn/files/images/tin-tuc/le-hoi-van-hoa-nam-bo-di-san-quy-bau-cua-dan-toc/ruoc-kieu-ba-chua-xu-xuong.jpg" alt="Lễ hội" className="w-24 h-24 object-cover rounded mr-4" />
            <div>
              <h3 className="text-xl font-semibold text-green-600">Lễ hội văn hóa</h3>
              <p className="text-gray-600">Trải nghiệm các lễ hội độc đáo trên khắp Việt Nam.</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default Home;