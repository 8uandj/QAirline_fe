import { useState, useEffect } from 'react';
import { getFlights, createFlight, delayFlight, getAircrafts } from '../../services/api';
import { motion } from 'framer-motion';

function AdminFlights() {
    const [flights, setFlights] = useState([]);
    const [aircrafts, setAircrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        flight_number: '',
        aircraft: '',
        departure: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        pilot: { name: '', experience: '' },
        notes: '',
        departureImage: '',
        destinationImage: '',
        destinationInfo: '',
        price: ''
    });
    const [delayForm, setDelayForm] = useState({ flightId: '', newDeparture: '', newArrival: '' });

    useEffect(() => {
        setLoading(true);
        Promise.all([getFlights(), getAircrafts()])
            .then(([flightsRes, aircraftsRes]) => {
                setFlights(flightsRes.data || []);
                setAircrafts(aircraftsRes.data || []);
            })
            .catch(err => setError('Không thể tải dữ liệu: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newFlight = await createFlight(form);
            setFlights([...flights, newFlight.data]);
            setForm({
                flight_number: '',
                aircraft: '',
                departure: '',
                destination: '',
                departureTime: '',
                arrivalTime: '',
                duration: '',
                pilot: { name: '', experience: '' },
                notes: '',
                departureImage: '',
                destinationImage: '',
                destinationInfo: '',
                price: ''
            });
            alert('Thêm chuyến bay thành công!');
        } catch (err) {
            setError('Không thể thêm chuyến bay: ' + err.message);
        }
    };

    const handleDelaySubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedFlight = await delayFlight(delayForm.flightId, {
                newDeparture: delayForm.newDeparture,
                newArrival: delayForm.newArrival
            });
            setFlights(flights.map(flight =>
                flight._id === delayForm.flightId ? updatedFlight.data : flight
            ));
            setDelayForm({ flightId: '', newDeparture: '', newArrival: '' });
            alert('Cập nhật giờ khởi hành thành công!');
        } catch (err) {
            setError('Không thể cập nhật giờ khởi hành: ' + err.message);
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
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý chuyến bay</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                </div>
            )}
            {/* Form thêm chuyến bay */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Thêm chuyến bay mới</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Số hiệu chuyến bay</label>
                        <input
                            type="text"
                            value={form.flight_number}
                            onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Tàu bay</label>
                        <select
                            value={form.aircraft}
                            onChange={(e) => setForm({ ...form, aircraft: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        >
                            <option value="">Chọn tàu bay</option>
                            {aircrafts.map(aircraft => (
                                <option key={aircraft._id} value={aircraft._id}>
                                    {aircraft.code} ({aircraft.manufacturer})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Điểm đi</label>
                        <input
                            type="text"
                            value={form.departure}
                            onChange={(e) => setForm({ ...form, departure: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Điểm đến</label>
                        <input
                            type="text"
                            value={form.destination}
                            onChange={(e) => setForm({ ...form, destination: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Giờ khởi hành</label>
                        <input
                            type="datetime-local"
                            value={form.departureTime}
                            onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Giờ đến</label>
                        <input
                            type="datetime-local"
                            value={form.arrivalTime}
                            onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Thời gian bay</label>
                        <input
                            type="text"
                            value={form.duration}
                            onChange={(e) => setForm({ ...form, duration: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Tên phi công</label>
                        <input
                            type="text"
                            value={form.pilot.name}
                            onChange={(e) => setForm({ ...form, pilot: { ...form.pilot, name: e.target.value } })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Kinh nghiệm phi công</label>
                        <input
                            type="text"
                            value={form.pilot.experience}
                            onChange={(e) => setForm({ ...form, pilot: { ...form.pilot, experience: e.target.value } })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Ghi chú</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Hình ảnh điểm đi (URL)</label>
                        <input
                            type="text"
                            value={form.departureImage}
                            onChange={(e) => setForm({ ...form, departureImage: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Hình ảnh điểm đến (URL)</label>
                        <input
                            type="text"
                            value={form.destinationImage}
                            onChange={(e) => setForm({ ...form, destinationImage: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Thông tin điểm đến</label>
                        <textarea
                            value={form.destinationInfo}
                            onChange={(e) => setForm({ ...form, destinationInfo: e.target.value })}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Giá vé (VND)</label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full"
                    >
                        Thêm chuyến bay
                    </motion.button>
                </form>
            </div>
            {/* Form cập nhật giờ khởi hành (delay) */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Cập nhật giờ khởi hành</h2>
                <form onSubmit={handleDelaySubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Chọn chuyến bay</label>
                        <select
                            value={delayForm.flightId}
                            onChange={(e) => setDelayForm({ ...delayForm, flightId: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        >
                            <option value="">Chọn chuyến bay</option>
                            {flights.map(flight => (
                                <option key={flight._id} value={flight._id}>
                                    {flight.flight_number} ({flight.departure} -> {flight.destination})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Giờ khởi hành mới</label>
                        <input
                            type="datetime-local"
                            value={delayForm.newDeparture}
                            onChange={(e) => setDelayForm({ ...delayForm, newDeparture: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Giờ đến mới</label>
                        <input
                            type="datetime-local"
                            value={delayForm.newArrival}
                            onChange={(e) => setDelayForm({ ...delayForm, newArrival: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full"
                    >
                        Cập nhật giờ khởi hành
                    </motion.button>
                </form>
            </div>
            {/* Danh sách chuyến bay */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Danh sách chuyến bay</h2>
                <div className="space-y-4">
                    {flights.length > 0 ? (
                        flights.map(flight => (
                            <div key={flight._id} className="bg-white shadow-md rounded-lg p-4">
                                <h3 className="text-xl font-semibold">{flight.flight_number}</h3>
                                <p>Tàu bay: {flight.aircraft?.code} ({flight.aircraft?.manufacturer})</p>
                                <p>Điểm đi: {flight.departure}</p>
                                <p>Điểm đến: {flight.destination}</p>
                                <p>Giờ khởi hành: {new Date(flight.departureTime).toLocaleString()}</p>
                                <p>Giờ đến: {new Date(flight.arrivalTime).toLocaleString()}</p>
                                <p>Giá vé: {flight.price.toLocaleString()} VND</p>
                            </div>
                        ))
                    ) : (
                        <p>Không có chuyến bay nào.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default AdminFlights;