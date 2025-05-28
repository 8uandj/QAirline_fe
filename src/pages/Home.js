import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { popularDestinations, specialOffers, testimonials } from '../data/destinations';

function Home() {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const onSubmit = (data) => {
        navigate('/flights', { state: data });
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
            {/* Banner parallax hiện tại */}
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="parallax bg-cover bg-center h-96"
                    style={{ backgroundImage: "url('https://media.istockphoto.com/id/501057465/vi/anh/d%C3%A3y-n%C3%BAi-himalaya-ph%E1%BB%A7-%C4%91%E1%BA%A7y-s%C6%B0%C6%A1ng-m%C3%B9-v%C3%A0-s%C6%B0%C6%A1ng-m%C3%B9.jpg?s=612x612&w=0&k=20&c=eN_J5-6a4z5g3XOZUanHCmkma-ljDgxG-CFUS5ey8gc=')" }}
                >
                    <div className="container mx-auto h-full flex items-center">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-white"
                        >
                            <h1 className="text-4xl font-bold mb-4">Khám phá thế giới cùng QAirline</h1>
                            <p className="text-lg">Đặt vé dễ dàng, bay an toàn, giá tốt nhất!</p>
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
            {/* Điểm đến phổ biến */}
            <section className="container mx-auto p-4 mt-8">
                <h2 className="text-3xl font-bold mb-6 text-green-600">Điểm đến phổ biến</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {popularDestinations.map((dest, index) => (
                        <motion.div
                            key={dest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white shadow-md rounded-lg overflow-hidden"
                        >
                            <img src={dest.image} alt={dest.name} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold">{dest.name}</h3>
                                <p className="text-gray-600">{dest.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
            {/* Ưu đãi đặc biệt */}
            <section className="container mx-auto p-4 mt-8">
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
                                    className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                >
                                    Đặt ngay
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
            {/* Đánh giá khách hàng */}
            <section className="container mx-auto p-4 mt-8">
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
            </section>
        </div>
    );
}

export default Home;