import { useState, useEffect } from 'react';
// import { getTickets, cancelTicket } from '../services/api'; // Comment: Import các hàm từ services/api.js để lấy danh sách vé và hủy vé từ backend
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Tickets() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Dữ liệu tĩnh cho danh sách vé đã đặt để demo frontend
    const staticTickets = [
        {
            id: 1,
            flight_id: 1,
            status: "booked",
            timeline: [
                { step: "Đã đặt", date: "2025-05-27T10:00:00", completed: true },
                { step: "Check-in", date: "2025-05-28T06:00:00", completed: false },
                { step: "Khởi hành", date: "2025-05-28T08:00:00", completed: false }
            ]
        },
        {
            id: 2,
            flight_id: 2,
            status: "booked",
            timeline: [
                { step: "Đã đặt", date: "2025-05-27T12:00:00", completed: true },
                { step: "Check-in", date: "2025-05-28T08:00:00", completed: false },
                { step: "Khởi hành", date: "2025-05-28T10:00:00", completed: false }
            ]
        },
        {
            id: 3,
            flight_id: 3,
            status: "canceled",
            timeline: [
                { step: "Đã đặt", date: "2025-05-27T14:00:00", completed: true },
                { step: "Đã hủy", date: "2025-05-27T16:00:00", completed: true }
            ]
        }
    ];

    const [tickets, setTickets] = useState(staticTickets);
    const [loading] = useState(false);
    const [error] = useState(null);

    // Comment: Đoạn mã dưới đây dùng để lấy dữ liệu từ backend, hiện tại được comment để sử dụng dữ liệu tĩnh
    // const [tickets, setTickets] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // useEffect(() => {
    //     if (!user) {
    //         navigate('/login');
    //         return;
    //     }
    //     setLoading(true);
    //     getTickets()
    //         .then(res => setTickets(res.data))
    //         .catch(err => setError('Không thể tải danh sách vé: ' + err.message))
    //         .finally(() => setLoading(false));
    // }, [user, navigate]);

    const handleCancel = async (ticketId) => {
        if (window.confirm('Bạn có chắc muốn hủy vé này?')) {
            try {
                // Giả lập hủy vé
                setTickets(tickets.map(ticket => 
                    ticket.id === ticketId ? { ...ticket, status: "canceled", timeline: [...ticket.timeline, { step: "Đã hủy", date: new Date().toISOString(), completed: true }] } : ticket
                ));
                alert('Hủy vé thành công! (Dữ liệu tĩnh)');
            } catch (err) {
                alert('Lỗi khi hủy vé: ' + err.message);
            }

            // Comment: Đoạn mã dưới đây dùng để gọi API hủy vé từ backend, hiện tại được comment để giả lập
            // try {
            //     await cancelTicket(ticketId);
            //     setTickets(tickets.filter(ticket => ticket.id !== ticketId));
            //     alert('Hủy vé thành công!');
            // } catch (err) {
            //     alert('Lỗi khi hủy vé: ' + err.message);
            // }
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    if (loading) return <div className="text-center p-4">Đang tải...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Vé của tôi</h1>
            <div className="space-y-6">
                {tickets.map((ticket, index) => (
                    <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 bg-white shadow-md rounded-lg"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Vé #{ticket.id} - Chuyến bay #{ticket.flight_id}</p>
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
                ))}
            </div>
        </motion.div>
    );
}

export default Tickets;