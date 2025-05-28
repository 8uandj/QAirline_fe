import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { getFlights } from '../services/api'; // Comment: Import hàm getFlights từ services/api.js để lấy danh sách chuyến bay từ backend
import { staticFlights } from '../data/flights';
import FlightList from '../components/FlightList';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

function Flights() {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [flights] = useState(staticFlights); // Biến này lưu trạng thái ban đầu nhưng không được sử dụng trực tiếp
    const [filteredFlights, setFilteredFlights] = useState(staticFlights);
    const [loading] = useState(false);
    const [error] = useState(null);

    // Comment: Đoạn mã dưới đây dùng để lấy dữ liệu từ backend, hiện tại được comment để sử dụng dữ liệu tĩnh
    // const [flights, setFlights] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // useEffect(() => {
    //     setLoading(true);
    //     getFlights()
    //         .then(res => setFlights(res.data))
    //         .catch(err => setError('Không thể tải danh sách chuyến bay: ' + err.message))
    //         .finally(() => setLoading(false));
    // }, []);

    const onFilter = (data) => {
        // Giả lập lọc dữ liệu tĩnh
        const filtered = staticFlights.filter(flight => {
            const matchesDeparture = !data.departure || flight.departure.toLowerCase().includes(data.departure.toLowerCase());
            const matchesDestination = !data.destination || flight.destination.toLowerCase().includes(data.destination.toLowerCase());
            const matchesDate = !data.travelDate || new Date(flight.departureTime).toISOString().split('T')[0] === data.travelDate;
            return matchesDeparture && matchesDestination && matchesDate;
        });
        setFilteredFlights(filtered);
    };

    if (loading) return <div className="text-center p-4">Đang tải...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Danh sách chuyến bay</h1>
            {/* Bộ lọc */}
            <form onSubmit={handleSubmit(onFilter)} className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <input
                    type="text"
                    placeholder="Điểm đi"
                    {...register('departure')}
                    className="p-2 border rounded flex-1"
                />
                <input
                    type="text"
                    placeholder="Điểm đến"
                    {...register('destination')}
                    className="p-2 border rounded flex-1"
                />
                <input
                    type="date"
                    {...register('travelDate')}
                    className="p-2 border rounded flex-1"
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                    Lọc
                </motion.button>
            </form>
            {/* Danh sách chuyến bay */}
            <FlightList flights={filteredFlights} navigate={navigate} />
        </motion.div>
    );
}

export default Flights;