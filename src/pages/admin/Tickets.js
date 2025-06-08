import { useCallback, useEffect, useState } from 'react';

import {
  getAdminTickets,
  getTicketStats,
  getFlights          // ⬅️ API lấy tất cả chuyến bay
} from '../../services/api';
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
  const [tickets, setTickets]   = useState([]);
  const [stats,   setStats]     = useState({
    totalTickets: 0,
    bookedTickets: 0,
    canceledTickets: 0,
    revenue: 0
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [flights, setFlights]   = useState([]);              // ⬅️ danh sách chuyến bay sắp cất cánh
  const [filters, setFilters]   = useState({
    email: '',
    ticket_status: '',
    from_date: '',
    to_date: '',
    flight_id: ''                                             // ⬅️ thêm field
  });

  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  /* ----------------------- LẤY CHUYẾN BAY SẮP CẤT CÁNH ----------------------- */
  useEffect(() => {
    getFlights()
      .then(res => {
        // lấy mảng flights đúng chỗ:
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
    setLoading(true);

    Promise.all([getAdminTickets(filters), getTicketStats(filters)])
      .then(([ticketsRes, statsRes]) => {
        setTickets(ticketsRes || []);

        const s = statsRes?.data?.data || {};
        setStats({
          totalTickets:   +s.total_tickets      || 0,
          bookedTickets:  +s.confirmed_tickets  || 0,
          canceledTickets:+s.cancelled_tickets || 0,
          revenue:        +s.total_revenue      || 0
        });
      })
      .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(fetchTicketsWithFilters, [fetchTicketsWithFilters]);

  /* ----------------------- HANDLERS ----------------------- */
  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = e => {
    e.preventDefault();
    fetchTicketsWithFilters();
  };
  

  if (loading) return <div className="text-center p-4">Đang tải...</div>;

  /* ----------------------- RENDER ----------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto p-4"
    >
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý đặt vé</h1>

      {error && <div className="text-center p-4 text-red-500">{error}</div>}

      {/* BỘ LỌC */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white shadow-md rounded-lg p-4 mb-6 space-y-4"
      >
        <h2 className="text-xl font-semibold mb-2">Bộ lọc</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email khách hàng</label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="example@gmail.com"
            />
          </div>

          {/* Chuyến bay sắp cất cánh */}
          <div>
            <label className="block font-medium mb-1">Chuyến bay</label>
            <select
              name="flight_id"
              value={filters.flight_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              {flights.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flight_number} —
                  {new Date(f.departure_time).toLocaleString('vi-VN')}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái vé */}
          <div>
            <label className="block font-medium mb-1">Trạng thái vé</label>
            <select
              name="ticket_status"
              value={filters.ticket_status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="PendingPayment">Chờ thanh toán</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Từ ngày */}
          <div>
            <label className="block font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow transition-all duration-200"
          >
            Lọc
          </button>
        </div>
      </form>

      {/* THỐNG KÊ */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Thống kê đặt vé</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Tổng số vé" value={stats.totalTickets} />
          <StatCard title="Vé đã đặt" value={stats.bookedTickets} />
          <StatCard title="Vé đã hủy" value={stats.canceledTickets} />
          <StatCard
            title="Doanh thu (VND)"
            value={stats.revenue.toLocaleString()}
          />
        </div>
      </div>

      {/* DANH SÁCH VÉ */}
      <TicketList tickets={tickets} onSelect={setSelectedTicket} />
      <ModalDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </motion.div>
  );
}

/* ------------------ COMPONENT PHỤ - THỐNG KÊ NHỎ ------------------ */
const StatCard = ({ title, value }) => (
    <div className="bg-white shadow-md rounded-lg p-4
                  transform transition-transform duration-200
                  hover:scale-105 hover:shadow-lg">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-2xl">{value}</p>
  </div>
);

/* ---------------- TicketList ---------------- */
const TicketList = ({ tickets, onSelect }) => {
  if (!tickets.length) return <p>Không có vé nào.</p>;

  const grouped = groupTicketsByFlight(tickets);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([flightId, group]) => {
        const flight = group[0].flight;
        return (
          <div key={flightId}>
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              ✈️ {group[0].flight.flight_number}
                 ({group[0].flight.from} → {group[0].flight.to})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.map((t) => (
                <CondensedCard key={t.ticket.id} ticketData={t} onSelect={onSelect} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

  /* -------------- Thẻ vé ---------------- */
  const CondensedCard = ({ ticketData, onSelect }) => (
    <div
      onClick={() => onSelect(ticketData)}
      className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg 
                 transition-all transform hover:scale-105 duration-200 p-4 
                 flex flex-col justify-between gap-2 border hover:border-green-400"
    >
      <span className="font-semibold text-blue-700 text-sm break-all">
        {ticketData.ticket.ticket_code}
      </span>
      <span className="font-medium text-black">
        {ticketData.customer.full_name}
      </span>
      <span className="text-sm text-gray-600">
        {ticketData.flight.flight_number}
      </span>
    </div>
  );

  const ModalDetail = ({ ticket, onClose }) => {
    if (!ticket) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 space-y-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-2xl font-bold text-blue-600 border-b pb-2">
            🎫 Chi tiết vé
          </h3>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
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
              value={parseFloat(ticket.ticket.price).toLocaleString() + ' VND'}
            />
            <DetailLine
              label="Ngày đặt"
              value={new Date(ticket.ticket.booking_date).toLocaleString('vi-VN')}
            />
          </div>
  
          <div className="text-right pt-4">
            <button
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const DetailLine = ({ label, value }) => (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-base font-medium break-words">{value}</p>
    </div>
  );
  
  

export default AdminTickets;
