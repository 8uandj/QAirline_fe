import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminStats, getRecentBookings, getUpcomingFlights, getBookingTrends } from '../../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../../context/AuthContext';

// Đăng ký các thành phần của Chart.js, bao gồm Filler
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalFlights: 0, totalTickets: 0, totalRevenue: 0, totalAnnouncements: 0, totalUsers: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [upcomingFlights, setUpcomingFlights] = useState([]);
    const [bookingTrends, setBookingTrends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getAdminStats(),
            getRecentBookings(),
            getUpcomingFlights(),
            getBookingTrends()
        ])
            .then(([statsRes, bookingsRes, flightsRes, trendsRes]) => {
                // Kiểm tra và xử lý dữ liệu stats
                const statsData = statsRes.data || {};
                setStats({
                    totalFlights: statsData.total_flights || 0,
                    totalTickets: statsData.total_tickets || 0,
                    totalRevenue: statsData.total_revenue || 0,
                    totalAnnouncements: statsData.total_announcements || 0,
                    totalUsers: statsData.total_customers || 0
                });
                setRecentBookings(bookingsRes.data || []);
                setUpcomingFlights(flightsRes.data || []);
                setBookingTrends(trendsRes.data || []);
            })
            .catch(err => {
                console.error('Error loading dashboard data:', err);
                setError('Không thể tải dữ liệu: ' + err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    // Dữ liệu cho biểu đồ xu hướng đặt vé
    const chartData = {
        labels: bookingTrends.map(trend => new Date(trend.date).toLocaleDateString('vi-VN')),
        datasets: [
            {
                label: 'Số lượng vé đặt',
                data: bookingTrends.map(trend => trend.bookings),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14
                    }
                }
            },
            title: {
                display: true,
                text: 'Xu hướng đặt vé (30 ngày gần đây)',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return `Số vé: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Ngày'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                    display: true,
                    text: 'Số lượng vé'
                }
            }
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
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Bảng điều khiển quản trị</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                </div>
            )}
            {/* Thông tin chào mừng */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
            >
                <h2 className="text-2xl font-semibold text-blue-600">Chào mừng, Quản trị viên!</h2>
                <p className="text-gray-600">Đây là bảng điều khiển quản trị của QAirline. Dưới đây là các thông tin tổng quan về hệ thống.</p>
            </motion.div>
            {/* Thống kê chính */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
            >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-blue-700">Tổng số chuyến bay</h3>
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalFlights}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-green-700">Tổng số vé đặt</h3>
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-900">{stats.totalTickets}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-yellow-700">Tổng số tiền đặt vé</h3>
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-yellow-900">{stats.totalRevenue.toLocaleString()} VND</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-purple-700">Tổng số thông báo</h3>
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalAnnouncements}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-red-700">Tổng số người dùng</h3>
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-red-900">{stats.totalUsers}</p>
                </div>
            </motion.div>
            {/* Biểu đồ xu hướng đặt vé */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
            >
                <div style={{ height: '400px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </motion.div>
            {/* Danh sách vé đặt gần đây */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white shadow-md rounded-lg p-4 mb-6"
            >
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Vé đặt gần đây</h2>
                {recentBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Mã vé</th>
                                    <th className="px-4 py-2 border-b">Khách hàng</th>
                                    <th className="px-4 py-2 border-b">Chuyến bay</th>
                                    <th className="px-4 py-2 border-b">Ghế</th>
                                    <th className="px-4 py-2 border-b">Giá</th>
                                    <th className="px-4 py-2 border-b">Ngày đặt</th>
                                    <th className="px-4 py-2 border-b">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(booking => (
                                    <tr key={booking.ticket_id}>
                                        <td className="px-4 py-2 border-b">{booking.ticket_id}</td>
                                        <td className="px-4 py-2 border-b">{`${booking.first_name} ${booking.last_name}`}</td>
                                        <td className="px-4 py-2 border-b">{booking.flight_number}</td>
                                        <td className="px-4 py-2 border-b">{booking.seat_number}</td>
                                        <td className="px-4 py-2 border-b">{booking.price.toLocaleString()} VND</td>
                                        <td className="px-4 py-2 border-b">{new Date(booking.booking_date).toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 border-b">
                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                booking.ticket_status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.ticket_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {booking.ticket_status === 'Confirmed' ? 'Đã xác nhận' :
                                                 booking.ticket_status === 'Cancelled' ? 'Đã hủy' :
                                                 'Đang chờ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Không có vé nào được đặt gần đây.</p>
                )}
            </motion.div>
            {/* Danh sách chuyến bay sắp tới */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white shadow-md rounded-lg p-4"
            >
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Chuyến bay sắp tới</h2>
                {upcomingFlights.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">Số hiệu</th>
                                    <th className="px-4 py-2 border-b">Điểm đi</th>
                                    <th className="px-4 py-2 border-b">Điểm đến</th>
                                    <th className="px-4 py-2 border-b">Giờ khởi hành</th>
                                    <th className="px-4 py-2 border-b">Giờ đến</th>
                                    <th className="px-4 py-2 border-b">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingFlights.map(flight => (
                                    <tr key={flight.id}>
                                        <td className="px-4 py-2 border-b">{flight.flight_number}</td>
                                        <td className="px-4 py-2 border-b">{flight.departure_airport_name}</td>
                                        <td className="px-4 py-2 border-b">{flight.arrival_airport_name}</td>
                                        <td className="px-4 py-2 border-b">{new Date(flight.departure_time).toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 border-b">{new Date(flight.arrival_time).toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 border-b">
                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                flight.flight_status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                                                flight.flight_status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {flight.flight_status === 'Scheduled' ? 'Theo lịch' :
                                                 flight.flight_status === 'Delayed' ? 'Hoãn chuyến' :
                                                 'Đã hủy'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>Không có chuyến bay sắp tới.</p>
                )}
            </motion.div>
        </motion.div>
    );
}

export default AdminDashboard;