import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFlight, getTicketClasses, bookTicket } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Booking() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { flightId } = useParams();
    const [flight, setFlight] = useState(null);
    const [ticketClasses, setTicketClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        seat: '',
        ticketClassId: '1', // Mặc định là phổ thông
        tripType: 'one-way', // Mặc định là một chiều
        classType: 'economy', // Mặc định là phổ thông
        additionalServices: {
            luggage: false,
            meal: false
        }
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        Promise.all([
            getFlight(flightId),
            getTicketClasses()
        ])
            .then(([flightRes, classesRes]) => {
                setFlight(flightRes.data);
                setTicketClasses(classesRes.data || []);
            })
            .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
            .finally(() => setLoading(false));
    }, [user, flightId, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                additionalServices: {
                    ...prev.additionalServices,
                    [name]: checked
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const calculatePrice = (basePrice) => {
        let price = basePrice;

        // Tính giá theo loại chuyến (một chiều/khứ hồi)
        if (formData.tripType === 'round-trip') {
            price *= 2; // Giả định khứ hồi gấp đôi giá một chiều
        }

        // Tính giá theo hạng vé (phổ thông/vip/thương gia)
        if (formData.classType === 'vip') {
            price *= 1.3; // Giả định VIP tăng 30%
        } else if (formData.classType === 'business') {
            price *= 1.5; // Giả định thương gia tăng 50%
        }

        return price;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const ticketData = {
                customerId: user.userId,
                flightId: flight.id,
                seat: formData.seat,
                ticketClassId: formData.ticketClassId,
                additionalServices: formData.additionalServices
            };
            await bookTicket(ticketData);
            alert('Đặt vé thành công!');
            navigate('/tickets');
        } catch (err) {
            setError('Đặt vé thất bại: ' + err.message);
        }
    };

    if (loading) return <div className="text-center p-4">Đang tải...</div>;
    if (!flight) return <div className="text-center p-4">Không tìm thấy chuyến bay.</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Đặt vé chuyến bay</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                    <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
                </div>
            )}

            {/* Thông tin chuyến bay */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Thông tin chuyến bay</h2>
                <p><strong>Địa điểm đi:</strong> {flight.departure}</p>
                <p><strong>Địa điểm đến:</strong> {flight.destination}</p>
                <p><strong>Ngày bay:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
            </div>

            {/* Form đặt vé */}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Thông tin hành khách</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Họ tên</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="p-2 border rounded w-full"
                            placeholder="Nhập họ tên"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Chọn ghế</label>
                        <input
                            type="text"
                            name="seat"
                            value={formData.seat}
                            onChange={handleInputChange}
                            className="p-2 border rounded w-full"
                            placeholder="Ví dụ: A1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Loại chuyến</label>
                        <select
                            name="tripType"
                            value={formData.tripType}
                            onChange={handleInputChange}
                            className="p-2 border rounded w-full"
                        >
                            <option value="one-way">Một chiều</option>
                            <option value="round-trip">Khứ hồi</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Hạng vé</label>
                        <select
                            name="classType"
                            value={formData.classType}
                            onChange={handleInputChange}
                            className="p-2 border rounded w-full"
                        >
                            <option value="economy">Phổ thông</option>
                            <option value="vip">VIP</option>
                            <option value="business">Thương gia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Giá tiền (VND)</label>
                        <p className="text-lg font-semibold">{calculatePrice(flight.price).toLocaleString()}</p>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Dịch vụ bổ sung</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="luggage"
                                    checked={formData.additionalServices.luggage}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                Hành lý ký gửi
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="meal"
                                    checked={formData.additionalServices.meal}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                Suất ăn
                            </label>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-green-500 text-white p-2 rounded w-full hover:bg-green-600 transition"
                    >
                        Xác nhận đặt vé
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}

export default Booking;