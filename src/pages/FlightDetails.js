import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staticFlights } from '../data/flights';

function FlightDetails() {
    const { flightId } = useParams();
    const flight = staticFlights.find(f => f.id === parseInt(flightId));

    if (!flight) return <div className="text-center p-4 text-red-500">Không tìm thấy chuyến bay</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Chi tiết chuyến bay {flight.flight_number}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái: Thông tin chuyến bay */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Thông tin chuyến bay</h2>
                    <p><strong>Số hiệu:</strong> {flight.flight_number}</p>
                    <p><strong>Khởi hành:</strong> {flight.departure} - {new Date(flight.departureTime).toLocaleString()}</p>
                    <p><strong>Đến:</strong> {flight.destination} - {new Date(flight.arrivalTime).toLocaleString()}</p>
                    <p><strong>Thời gian bay:</strong> {flight.duration}</p>
                    <p><strong>Máy bay:</strong> {flight.aircraft}</p>
                    <p><strong>Phi công:</strong> {flight.pilot.name} (Kinh nghiệm: {flight.pilot.experience})</p>
                    <p><strong>Lưu ý:</strong> {flight.notes}</p>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Thông tin điểm đến</h3>
                    <p>{flight.destinationInfo}</p>
                </motion.div>
                {/* Cột phải: Hình ảnh điểm đi/điểm đến */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Hình ảnh</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Điểm đi: {flight.departure}</h3>
                            <img src={flight.departureImage} alt={flight.departure} className="w-full h-48 object-cover rounded-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Điểm đến: {flight.destination}</h3>
                            <img src={flight.destinationImage} alt={flight.destination} className="w-full h-48 object-cover rounded-lg" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default FlightDetails;