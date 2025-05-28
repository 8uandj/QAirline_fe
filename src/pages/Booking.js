import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { getFlight, getLocations, bookTicket } from '../services/api'; // Comment: Import các hàm từ services/api.js để lấy dữ liệu chuyến bay, danh sách địa điểm và đặt vé từ backend
import { staticFlights } from '../data/flights';
import BookingForm from '../components/BookingForm';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Booking() {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1); // Quản lý các bước đặt vé
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [additionalServices, setAdditionalServices] = useState({ luggage: false, meal: false });

    // Dữ liệu tĩnh cho chuyến bay để demo frontend
    const staticFlight = staticFlights.find(f => f.id === parseInt(flightId));

    // Dữ liệu tĩnh cho danh sách địa điểm để demo frontend
    const staticLocations = [
        { id: 1, name: "Hà Nội" },
        { id: 2, name: "TP. Hồ Chí Minh" },
        { id: 3, name: "Đà Nẵng" },
        { id: 4, name: "Huế" },
        { id: 5, name: "Nha Trang" }
    ];

    const [flight] = useState(staticFlight);
    const [locations] = useState(staticLocations);
    const [loading] = useState(false);
    const [error] = useState(null);

    // Comment: Đoạn mã dưới đây dùng để lấy dữ liệu từ backend, hiện tại được comment để sử dụng dữ liệu tĩnh
    // const [flight, setFlight] = useState(null);
    // const [locations, setLocations] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // useEffect(() => {
    //     if (!user) {
    //         navigate('/login');
    //         return;
    //     }
    //     setLoading(true);
    //     Promise.all([
    //         getFlight(flightId),
    //         getLocations()
    //     ])
    //         .then(([flightRes, locationsRes]) => {
    //             setFlight(flightRes.data);
    //             setLocations(locationsRes.data);
    //         })
    //         .catch(err => setError('Lỗi khi tải dữ liệu: ' + err.message))
    //         .finally(() => setLoading(false));
    // }, [flightId, user, navigate]);

    const onSubmit = async (data) => {
        try {
            // Giả lập đặt vé thành công
            alert('Đặt vé thành công! (Dữ liệu tĩnh)');
            navigate('/tickets');
        } catch (err) {
            alert('Lỗi khi đặt vé: ' + err.message);
        }

        // Comment: Đoạn mã dưới đây dùng để gọi API đặt vé từ backend, hiện tại được comment để giả lập
        // try {
        //     await bookTicket({
        //         flight_id: flightId,
        //         user_id: user.id,
        //         ...data
        //     });
        //     alert('Đặt vé thành công!');
        //     navigate('/tickets');
        // } catch (err) {
        //     alert('Lỗi khi đặt vé: ' + err.message);
        // }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    if (loading) return <div className="text-center p-4">Đang tải...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
    if (!flight) return <div className="text-center p-4">Không tìm thấy chuyến bay</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Đặt vé cho chuyến bay {flight.flight_number}</h1>
            {/* Bước 1: Thông tin cơ bản */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Bước 1: Thông tin hành khách</h2>
                    <BookingForm flight={flight} locations={locations} onSubmit={(data) => { onSubmit(data); setStep(2); }} />
                </motion.div>
            )}
            {/* Bước 2: Chọn ghế */}
            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                >
                    <h2 className="text-2xl font-semibold mb-4">Bước 2: Chọn ghế</h2>
                    <div className="grid grid-cols-4 gap-2">
                        {["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"].map(seat => (
                            <motion.button
                                key={seat}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedSeat(seat)}
                                className={`p-2 rounded ${selectedSeat === seat ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-green-500 hover:text-white transition`}
                            >
                                {seat}
                            </motion.button>
                        ))}
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep(1)}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                        >
                            Quay lại
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep(3)}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                        >
                            Tiếp tục
                        </motion.button>
                    </div>
                </motion.div>
            )}
            {/* Bước 3: Dịch vụ bổ sung */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                >
                    <h2 className="text-2xl font-semibold mb-4">Bước 3: Dịch vụ bổ sung</h2>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={additionalServices.luggage}
                                onChange={() => setAdditionalServices({ ...additionalServices, luggage: !additionalServices.luggage })}
                                className="form-checkbox"
                            />
                            <span>Thêm hành lý ký gửi (20kg - 500,000 VND)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={additionalServices.meal}
                                onChange={() => setAdditionalServices({ ...additionalServices, meal: !additionalServices.meal })}
                                className="form-checkbox"
                            />
                            <span>Thêm suất ăn trên máy bay (150,000 VND)</span>
                        </label>
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep(2)}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                        >
                            Quay lại
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSubmit({ seat: selectedSeat, services: additionalServices })}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                        >
                            Hoàn tất đặt vé
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export default Booking;