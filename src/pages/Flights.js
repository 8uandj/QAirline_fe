import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getFlights, searchFlights } from '../services/api';
import { staticFlights } from '../data/flights';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Flights() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState({ from: '', to: '', date: '' });
    const [ticketTypes, setTicketTypes] = useState({}); // Lưu loại giá vé cho từng chuyến bay

    useEffect(() => {
        setLoading(true);
        getFlights()
            .then(res => setFlights(res.data || []))
            .catch(err => {
                setError('Không thể tải dữ liệu: ' + err.message);
                setFlights(staticFlights);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await searchFlights(search);
            setFlights(res.data || []);
        } catch (err) {
            setError('Không thể tìm kiếm: ' + err.message);
            setFlights(staticFlights);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketTypeChange = (flightId, type, value) => {
        setTicketTypes(prev => ({
            ...prev,
            [flightId]: {
                ...prev[flightId],
                [type]: value
            }
        }));
    };

    const calculatePrice = (flightId, basePrice) => {
        const ticketType = ticketTypes[flightId] || { tripType: 'one-way', classType: 'economy' };
        let price = basePrice;

        // Tính giá theo loại chuyến (một chiều/khứ hồi)
        if (ticketType.tripType === 'round-trip') {
            price *= 2; // Giả định khứ hồi gấp đôi giá một chiều
        }

        // Tính giá theo hạng vé (phổ thông/vip/thương gia)
        if (ticketType.classType === 'vip') {
            price *= 1.3; // Giả định VIP tăng 30%
        } else if (ticketType.classType === 'business') {
            price *= 1.5; // Giả định thương gia tăng 50%
        }

        return price;
    };

    const handleBookFlight = (flightId) => {
        if (!user) {
            navigate('/login');
        } else {
            navigate(`/booking/${flightId}`);
        }
    };

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Tìm chuyến bay</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                    <p className="text-gray-600 mt-2">Hiển thị dữ liệu tĩnh do lỗi từ backend.</p>
                </div>
            )}

            {/* Form tìm kiếm */}
            <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <input
                    type="text"
                    placeholder="Địa điểm đi"
                    value={search.from}
                    onChange={(e) => setSearch({ ...search, from: e.target.value })}
                    className="p-2 border rounded flex-1"
                />
                <input
                    type="text"
                    placeholder="Địa điểm đến"
                    value={search.to}
                    onChange={(e) => setSearch({ ...search, to: e.target.value })}
                    className="p-2 border rounded flex-1"
                />
                <input
                    type="date"
                    value={search.date}
                    onChange={(e) => setSearch({ ...search, date: e.target.value })}
                    className="p-2 border rounded flex-1"
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                    Tìm kiếm
                </motion.button>
            </form>

            {/* Bảng danh sách chuyến bay */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Địa điểm đi</th>
                            <th className="px-4 py-2 text-left">Địa điểm đến</th>
                            <th className="px-4 py-2 text-left">Ngày bay</th>
                            <th className="px-4 py-2 text-left">Loại giá vé</th>
                            <th className="px-4 py-2 text-left">Giá tiền (VND)</th>
                            <th className="px-4 py-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.length > 0 ? (
                            flights.map(flight => (
                                <tr key={flight.id} className="border-b">
                                    <td className="px-4 py-2">{flight.departure}</td>
                                    <td className="px-4 py-2">{flight.destination}</td>
                                    <td className="px-4 py-2">{new Date(flight.departureTime).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={ticketTypes[flight.id]?.tripType || 'one-way'}
                                            onChange={(e) => handleTicketTypeChange(flight.id, 'tripType', e.target.value)}
                                            className="p-1 border rounded mr-2"
                                        >
                                            <option value="one-way">Một chiều</option>
                                            <option value="round-trip">Khứ hồi</option>
                                        </select>
                                        <select
                                            value={ticketTypes[flight.id]?.classType || 'economy'}
                                            onChange={(e) => handleTicketTypeChange(flight.id, 'classType', e.target.value)}
                                            className="p-1 border rounded"
                                        >
                                            <option value="economy">Phổ thông</option>
                                            <option value="vip">VIP</option>
                                            <option value="business">Thương gia</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        {calculatePrice(flight.id, flight.price).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleBookFlight(flight.id)}
                                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                        >
                                            Đặt vé
                                        </motion.button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-2 text-center">Không tìm thấy chuyến bay nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

export default Flights;