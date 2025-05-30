import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getFlights } from '../services/api';
import { staticFlights } from '../data/flights';
import FlightCard from '../components/FlightCard';
import { motion, useInView } from 'framer-motion';

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
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const [featuredFlights, setFeaturedFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visibleDestinations, setVisibleDestinations] = useState(3); // Số điểm đến hiển thị mặc định

    // Dữ liệu tĩnh cho ưu đãi và đánh giá
    const specialOffers = [
        { id: 1, title: "Khuyến mãi hè", description: "Giảm 30% cho các chuyến bay nội địa!", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" },
        { id: 2, title: "Bay quốc tế giá rẻ", description: "Giảm 20% cho các chuyến bay đến Thái Lan!", image: "https://images.unsplash.com/photo-1559592417-7d9f9c8d7485" }
    ];

    const testimonials = [
        { id: 1, name: "Nguyễn Văn A", quote: "Chuyến bay rất thoải mái, dịch vụ tuyệt vời!" },
        { id: 2, name: "Trần Thị B", quote: "Giá vé hợp lý, đặt vé dễ dàng!" },
        { id: 3, name: "Lê Văn C", quote: "Hỗ trợ khách hàng rất nhiệt tình!" }
    ];

    useEffect(() => {
        setLoading(true);
        getFlights()
            .then(res => {
                setFeaturedFlights(res.data.slice(0, 3) || []);
            })
            .catch(err => {
                setError('Không thể tải chuyến bay nổi bật: ' + err.message);
                setFeaturedFlights(staticFlights.slice(0, 3));
            })
            .finally(() => setLoading(false));
    }, []);

    const onSubmit = (data) => {
        navigate('/flights', { state: data });
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

            {/* Banner parallax */}
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="parallax bg-cover bg-center h-96"
                    style={{ backgroundImage: "url('https://media.istockphoto.com/id/501057465/vi/anh/d%C3%A3y-n%C3%BAi-himalaya-ph%E1%BB%A7-%C4%91%E1%BA%A7y-s%C6%B0%C6%A1ng-m%C3%B9-v%C3%A0-s%C6%B0%C6%A1ng-m%C3%B9.jpg?s=612x612&w=0&k=20&c=eN_J5-6a4z5g3XOZUanHCmkma-ljDgxG-CFUS5ey8gc=')" }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-center text-white"
                        >
                            <h1 className="text-4xl font-bold mb-4">Khám phá thế giới cùng QAirline</h1>
                            <p className="text-xl mb-6">Đặt vé dễ dàng, bay an toàn, giá tốt nhất!</p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Ô tìm chuyến bay - Căn giữa trang */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="container mx-auto p-4 flex justify-center"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <input
                            type="text"
                            placeholder="Điểm đi"
                            {...register('departure')}
                            className="p-2 border rounded flex-1"
                        />
                        <input
                            type="text"
                            placeholder="Điểm đến"
                            {...register('destination')}
                            className="p-2 border rounded flex-1"
                        />
                        <input
                            type="date"
                            {...register('travelDate')}
                            className="p-2 border rounded flex-1"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                        >
                            Tìm chuyến bay
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Chuyến bay nổi bật */}
            <Section className="container mx-auto p-4 mt-8 bg-white">
                <h2 className="text-3xl font-bold mb-6 text-green-600">Chuyến bay nổi bật</h2>
                {loading ? (
                    <div className="text-center p-4">Đang tải...</div>
                ) : (
                    <>
                        {error && (
                            <div className="text-center p-4 text-red-500">
                                {error}
                                <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {featuredFlights.length > 0 ? (
                                featuredFlights.map((flight, index) => (
                                    <motion.div
                                        key={flight.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <FlightCard flight={flight} navigate={navigate} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center p-4">Không có chuyến bay nổi bật.</div>
                            )}
                        </div>
                    </>
                )}
            </Section>

            {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />

            {/* Điểm đến phổ biến - Cập nhật mới */}
            <Section className="container mx-auto p-4 bg-gray-100" delay={0.2}>
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
                            {/* Lớp phủ tối để tăng độ tương phản cho chữ */}
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

            {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />

            {/* Ưu đãi đặc biệt */}
            <Section className="container mx-auto p-4 bg-white" delay={0.4}>
                <h2 className="text-3xl font-bold mb-6 text-green-600">Ưu đãi đặc biệt</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {specialOffers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white shadow-md rounded-lg overflow-hidden"
                        >
                            <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold">{offer.title}</h3>
                                <p className="text-gray-600">{offer.description}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/flights')}
                                    className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                >
                                    Đặt ngay
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Đường phân cách */}
            <hr className="border-t border-gray-300 my-8" />

            {/* Đánh giá khách hàng */}
            <Section className="container mx-auto p-4 bg-gray-100" delay={0.6}>
                <h2 className="text-3xl font-bold mb-6 text-green-600">Đánh giá từ khách hàng</h2>
                <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-4 bg-white shadow-md rounded-lg"
                        >
                            <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                            <p className="text-green-600 font-semibold mt-2">{testimonial.name}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>
        </div>
    );
}

export default Home;