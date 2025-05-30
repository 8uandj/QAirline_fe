import { useState, useEffect } from 'react';
import { getTickets, cancelTicket, trackTicket } from '../services/api';
import { staticTickets } from '../data/tickets';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

function Tickets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [tickets, setTickets] = useState([]);
    const [trackedTicket, setTrackedTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        getTickets()
            .then(res => {
                setTickets(res.data || []);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    setError('Bạn cần đăng nhập để xem vé của mình.');
                    navigate('/login');
                } else {
                    setError('Không thể tải danh sách vé: ' + err.message);
                    setTickets(staticTickets);
                }
            })
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const handleCancel = async (ticketId) => {
        if (window.confirm('Bạn có chắc muốn hủy vé này?')) {
            try {
                const updatedTicket = await cancelTicket(ticketId);
                setTickets(tickets.map(ticket =>
                    ticket.id === ticketId ? updatedTicket.data : ticket
                ));
                alert('Hủy vé thành công!');
            } catch (err) {
                alert(err.response?.data?.message || 'Lỗi khi hủy vé: ' + err.message);
            }
        }
    };

    const onTrackTicket = async (data) => {
        try {
            const res = await trackTicket(data.code);
            setTrackedTicket(res.data);
        } catch (err) {
            alert('Lỗi khi tra cứu vé: ' + err.message);
            setTrackedTicket(staticTickets.find(ticket => ticket.id === parseInt(data.code)) || null);
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
            <h1 className="text-3xl font-bold mb-6 text-green-600">Vé của tôi</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                    <p className="text-gray-600 mt-2">{error.includes('đăng nhập') ? 'Vui lòng đăng nhập để tiếp tục.' : 'Hiển thị dữ liệu tĩnh do lỗi từ backend.'}</p>
                </div>
            )}
            {/* Tra cứu vé */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Tra cứu vé</h2>
                <form onSubmit={handleSubmit(onTrackTicket)} className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Nhập mã vé"
                        {...register('code', { required: true })}
                        className="p-2 border rounded flex-1"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                        Tra cứu
                    </motion.button>
                </form>
                {trackedTicket ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-4 p-4 bg-white shadow-md rounded-lg"
                    >
                        <p className="font-semibold">Vé #{trackedTicket.id} - Chuyến bay #{trackedTicket.flightId?.flight_number}</p>
                        <p>Trạng thái: {trackedTicket.status === 'booked' ? 'Đã đặt' : 'Đã hủy'}</p>
                        <p>Họ tên: {trackedTicket.name || 'N/A'}</p>
                        <p>Địa điểm đi: {trackedTicket.flightId?.departure}</p>
                        <p>Địa điểm đến: {trackedTicket.flightId?.destination}</p>
                    </motion.div>
                ) : (
                    trackedTicket === null && <div className="text-center p-4">Không tìm thấy vé.</div>
                )}
            </div>
            {/* Danh sách vé */}
            <div className="space-y-6">
                {tickets.length > 0 ? (
                    tickets.map((ticket, index) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-4 bg-white shadow-md rounded-lg"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">Vé #{ticket.id} - Chuyến bay #{ticket.flightId?.flight_number}</p>
                                    <p>Địa điểm đi: {ticket.flightId?.departure}</p>
                                    <p>Địa điểm đến: {ticket.flightId?.destination}</p>
                                    <p>Trạng thái: {ticket.status === 'booked' ? 'Đã đặt' : 'Đã hủy'}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleCancel(ticket.id)}
                                    className={`p-2 rounded ${ticket.status === 'canceled' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white transition'}`}
                                    disabled={ticket.status === 'canceled'}
                                >
                                    Hủy vé
                                </motion.button>
                            </div>
                            {/* Dòng thời gian */}
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Dòng thời gian</h3>
                                <div className="relative border-l-2 border-green-500 pl-4">
                                    {ticket.timeline.map((event, idx) => (
                                        <div key={idx} className="mb-4">
                                            <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-2 mt-1.5"></div>
                                            <p className="font-semibold">{event.step}</p>
                                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</p>
                                            <p className={`text-sm ${event.completed ? 'text-green-600' : 'text-gray-400'}`}>
                                                {event.completed ? 'Hoàn thành' : 'Chưa hoàn thành'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center p-4">Bạn chưa có vé nào.</div>
                )}
            </div>
        </motion.div>
    );
}

export default Tickets;