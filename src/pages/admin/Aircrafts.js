import { useState, useEffect } from 'react';
import { getAircrafts, createAircraft } from '../../services/api';
import { motion } from 'framer-motion';

function AdminAircrafts() {
    const [aircrafts, setAircrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        code: '',
        manufacturer: '',
        seats: [{ seatNumber: '', class: 'economy' }]
    });

    useEffect(() => {
        setLoading(true);
        getAircrafts()
            .then(res => setAircrafts(res.data || []))
            .catch(err => setError('Không thể tải tàu bay: ' + err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleAddSeat = () => {
        setForm({ ...form, seats: [...form.seats, { seatNumber: '', class: 'economy' }] });
    };

    const handleSeatChange = (index, field, value) => {
        const newSeats = [...form.seats];
        newSeats[index][field] = value;
        setForm({ ...form, seats: newSeats });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newAircraft = await createAircraft(form);
            setAircrafts([...aircrafts, newAircraft.data]);
            setForm({ code: '', manufacturer: '', seats: [{ seatNumber: '', class: 'economy' }] });
            alert('Thêm tàu bay thành công!');
        } catch (err) {
            setError('Không thể thêm tàu bay: ' + err.message);
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
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Quản lý tàu bay</h1>
            {error && (
                <div className="text-center p-4 text-red-500">
                    {error}
                </div>
            )}
            {/* Form thêm tàu bay */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Thêm tàu bay mới</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Mã tàu bay</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Hãng sản xuất</label>
                        <input
                            type="text"
                            value={form.manufacturer}
                            onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Danh sách ghế</label>
                        {form.seats.map((seat, index) => (
                            <div key={index} className="flex space-x-4 mb-2">
                                <input
                                    type="text"
                                    placeholder="Số ghế (VD: A1)"
                                    value={seat.seatNumber}
                                    onChange={(e) => handleSeatChange(index, 'seatNumber', e.target.value)}
                                    className="p-2 border rounded flex-1"
                                    required
                                />
                                <select
                                    value={seat.class}
                                    onChange={(e) => handleSeatChange(index, 'class', e.target.value)}
                                    className="p-2 border rounded flex-1"
                                    required
                                >
                                    <option value="economy">Phổ thông</option>
                                    <option value="business">Thương gia</option>
                                </select>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddSeat}
                            className="text-blue-500 hover:underline"
                        >
                            Thêm ghế
                        </button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full"
                    >
                        Thêm tàu bay
                    </motion.button>
                </form>
            </div>
            {/* Danh sách tàu bay */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Danh sách tàu bay</h2>
                <div className="space-y-4">
                    {aircrafts.length > 0 ? (
                        aircrafts.map(aircraft => (
                            <div key={aircraft._id} className="bg-white shadow-md rounded-lg p-4">
                                <h3 className="text-xl font-semibold">{aircraft.code}</h3>
                                <p>Hãng sản xuất: {aircraft.manufacturer}</p>
                                <p>Ghế: {aircraft.seats.map(seat => `${seat.seatNumber} (${seat.class})`).join(', ')}</p>
                            </div>
                        ))
                    ) : (
                        <p>Không có tàu bay nào.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default AdminAircrafts;