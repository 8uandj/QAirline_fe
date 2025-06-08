import { useCallback, useEffect, useState } from 'react';
import { getAdminTickets, getTicketStats, getFlights } from '../../services/api';
import { motion } from 'framer-motion';

const groupTicketsByFlight = (tickets) => {
  return tickets.reduce((acc, t) => {
    const flightId = t.ticket.flight_id;
    if (!acc[flightId]) acc[flightId] = [];
    acc[flightId].push(t);
    return acc;
  }, {});
};

function AdminTickets() {
  /* ----------------------- STATE ----------------------- */
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    bookedTickets: 0,
    canceledTickets: 0,
    revenue: 0
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(0);
  const [flights, setFlights] = useState([]);
  const [filters, setFilters] = useState({
    email: '',
    ticket_status: '',
    from_date: '',
    to_date: '',
    flight_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ----------------------- FETCH FLIGHTS ----------------------- */
  useEffect(() => {
    getFlights()
      .then(res => {
        const allFlights = res.data?.data || res.data || [];
        const now = new Date();
        const upcoming = allFlights.filter(
          f => new Date(f.departure_time) > now
        );
        setFlights(upcoming);
      })
      .catch(err =>
        console.error('❌ Không thể tải danh sách chuyến bay:', err.message)
      );
  }, []);

  /* ----------------------- FETCH TICKETS + STATS ----------------------- */
  const fetchTicketsWithFilters = useCallback(() => {
    setPage(0);
    setLoading(true);
    const payload = {
      ...filters,
      flight_id: filters.flight_id ? Number(filters.flight_id) : ''
    };
    Promise.all([getAdminTickets(filters), getTicketStats(filters)])
      .then(([ticketsRes, statsRes]) => {
        setTickets(ticketsRes || []);
        const s = statsRes?.data?.data || {};
        setStats({
          totalTickets: +s.total_tickets || 0,
          bookedTickets: +s.confirmed_tickets || 0,
          canceledTickets: +s.cancelled_tickets || 0,
          revenue: +s.total_revenue || 0
        });
      })
      .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(fetchTicketsWithFilters, [fetchTicketsWithFilters]);

 /* ----------------------- HANDLERS ----------------------- */
 const handleChange = (e) => {
  const { name, value } = e.target;
  setFilters((prev) => ({ ...prev, [name]: value }));
};



  const handleFilterSubmit = e => {
    e.preventDefault();
    setPage(0); // reset phân trang
    fetchTicketsWithFilters();
  };
  

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center p-6 text-gray-600 text-lg"
    >
      Đang tải...
    </motion.div>
  );

  /* ----------------------- RENDER ----------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-4 sm:p-6 lg:p-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-green-700 text-center">Quản lý đặt vé</h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 mb-6 text-red-500 bg-red-100 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* BỘ LỌC */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white shadow-xl rounded-xl p-6 mb-8 border border-green-200"
      >
        <h2 className="text-2xl font-semibold mb-6 text-green-600">Bộ lọc</h2>
        <form onSubmit={handleFilterSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email khách hàng</label>
              <input
                type="text"
                name="email"
                value={filters.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="example@gmail.com"
              />
            </div>
            {/* Chuyến bay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chuyến bay</label>
              <select
                name="flight_id"
                value={filters.flight_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {flights.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.flight_number} — {new Date(f.departure_time).toLocaleString('vi-VN')}
                  </option>
                ))}
              </select>
            </div>
            {/* Trạng thái vé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái vé</label>
              <select
                name="ticket_status"
                value={filters.ticket_status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="PendingPayment">Chờ thanh toán</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
            {/* Từ ngày */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <input
                type="date"
                name="from_date"
                value={filters.from_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {/* Đến ngày */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <input
                type="date"
                name="to_date"
                value={filters.to_date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="text-right">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Lọc
            </motion.button>
          </div>
        </form>
      </motion.section>

      {/* THỐNG KÊ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-green-600">Thống kê đặt vé</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tổng số vé" value={stats.totalTickets} />
          <StatCard title="Vé đã đặt" value={stats.bookedTickets} />
          <StatCard title="Vé đã hủy" value={stats.canceledTickets} />
          <StatCard title="Doanh thu (VND)" value={stats.revenue.toLocaleString('vi-VN')} />
        </div>
      </motion.section>

      {/* DANH SÁCH VÉ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <TicketList
            tickets={tickets}
            page={page}
            setPage={setPage}
            onSelect={setSelectedTicket}
          />
        <ModalDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      </motion.section>
    </motion.div>
  );
}

/* ------------------ COMPONENT PHỤ - THỐNG KÊ NHỎ ------------------ */
const StatCard = ({ title, value }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white shadow-xl rounded-xl p-6 border border-green-200 hover:shadow-2xl transition-shadow"
  >
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-2xl font-bold text-green-600 mt-2">{value}</p>
  </motion.div>
);

const FLIGHTS_PER_PAGE = 3;

const TicketList = ({ tickets, page, setPage, onSelect }) => {

  if (!tickets.length) return (
    <p className="text-center text-gray-600 p-4">Không có vé nào.</p>
  );

  const grouped = groupTicketsByFlight(tickets);
  const flightsArray = Object.entries(grouped);
  const totalPages = Math.ceil(flightsArray.length / FLIGHTS_PER_PAGE);

  const currentSlice = flightsArray.slice(
    page * FLIGHTS_PER_PAGE,
    (page + 1) * FLIGHTS_PER_PAGE
  );

  const toPrev = () => setPage((p) => Math.max(0, p - 1));
  const toNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <>
      <div className="space-y-8">
        {currentSlice.map(([flightId, group], index) => (
          <motion.div
            key={flightId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h3 className="text-xl font-semibold text-green-700 mb-4">
              ✈️ {group[0].flight.flight_number} ({group[0].flight.from} → {group[0].flight.to})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.map(t => (
                <CondensedCard key={t.ticket.id} ticketData={t} onSelect={onSelect} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="bg-green-500 text-white px-5 py-2 rounded-lg shadow font-semibold
                     hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Trước
        </motion.button>
      
        <span className="text-lg font-medium text-gray-700">
          Trang {page + 1} / {totalPages || 1}
        </span>
      
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="bg-green-500 text-white px-5 py-2 rounded-lg shadow font-semibold
                     hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau →
        </motion.button>
      </div>
      
      )}
    </>
  );
};


/* -------------- Thẻ vé ---------------- */
const CondensedCard = ({ ticketData, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(ticketData)}
    className="cursor-pointer bg-white rounded-xl shadow-xl p-6 border border-green-200 hover:shadow-2xl transition-shadow"
  >
    <span className="font-semibold text-green-700 text-sm break-all">
      {ticketData.ticket.ticket_code}
    </span>
    <span className="block font-medium text-gray-800 mt-2">
      {ticketData.customer.full_name}
    </span>
    <span className="text-sm text-gray-600 mt-1">
      {ticketData.flight.flight_number}
    </span>
  </motion.div>
);

/* -------------- Modal Chi tiết ---------------- */
const ModalDetail = ({ ticket, onClose }) => {
  if (!ticket) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-green-700 border-b pb-2">
          🎫 Chi tiết vé
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailLine label="Mã vé" value={ticket.ticket.ticket_code} />
          <DetailLine label="Khách hàng" value={ticket.customer.full_name} />
          <DetailLine
            label="Chuyến bay"
            value={
              <>
                <span className="font-medium">{ticket.flight.flight_number}</span>
                <br />
                <span className="text-sm text-gray-600">
                  {ticket.flight.from} → {ticket.flight.to}
                </span>
              </>
            }
          />
          <DetailLine label="Ghế" value={ticket.ticket.seat_number} />
          <DetailLine label="Trạng thái" value={ticket.ticket.ticket_status} />
          <DetailLine
            label="Giá"
            value={parseFloat(ticket.ticket.price).toLocaleString('vi-VN') + ' VND'}
          />
          <DetailLine
            label="Ngày đặt"
            value={new Date(ticket.ticket.booking_date).toLocaleString('vi-VN')}
          />
        </div>
        <div className="text-right">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Đóng
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailLine = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base font-medium text-gray-800 break-words">{value}</p>
  </div>
);

export default AdminTickets;