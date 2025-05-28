import { useState } from 'react';
import { Link } from 'react-router-dom';
// import { getPromotions } from '../services/api'; // Comment: Import hàm getPromotions từ services/api.js để lấy danh sách khuyến mãi từ backend
import { motion } from 'framer-motion';

function Promotions() {
    // Dữ liệu tĩnh cho danh sách khuyến mãi để demo frontend
    const staticPromotions = [
        {
            id: 1,
            title: "Khuyến mãi hè 2025",
            description: "Giảm 30% giá vé cho tất cả các chuyến bay nội địa từ 01/06/2025 đến 31/08/2025!",
            expiryDate: "2025-08-31",
            image: "https://vemaybayvietmy.com/wp-content/uploads/2022/03/bamboo-uu-dai-ve-may-bay-toi-30-cho-nhom-tu-2-nguoi.jpg"
        },
        {
            id: 2,
            title: "Bay quốc tế giá rẻ",
            description: "Giảm 20% giá vé cho các chuyến bay đến Thái Lan và Singapore trong tháng 6/2025.",
            expiryDate: "2025-06-30",
            image: "https://vemaybayvietmy.com/wp-content/uploads/2023/12/bamboo-giam-20-gia-ve-bay-nhom-2-khach-tro-len.jpg"
        },
        {
            id: 3,
            title: "Tặng voucher 500K",
            description: "Đặt vé trong tuần này để nhận voucher 500K cho chuyến bay tiếp theo!",
            expiryDate: "2025-05-31",
            image: "https://images2.thanhnien.vn/528068263637045248/2023/9/24/traveloka-2-1695556936893670620529.png"
        }
    ];

    const [promotions] = useState(staticPromotions);
    const [loading] = useState(false);
    const [error] = useState(null);

    // Comment: Đoạn mã dưới đây dùng để lấy dữ liệu từ backend, hiện tại được comment để sử dụng dữ liệu tĩnh
    // const [promotions, setPromotions] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // useEffect(() => {
    //     setLoading(true);
    //     getPromotions()
    //         .then(res => setPromotions(res.data))
    //         .catch(err => setError('Không thể tải danh sách khuyến mãi: ' + err.message))
    //         .finally(() => setLoading(false));
    // }, []);

    if (loading) return <div className="text-center p-4">Đang tải...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-3xl font-bold mb-6 text-green-600">Khuyến mãi và tin tức</h1>
            <div className="space-y-6">
                {promotions.map((promo, index) => (
                    <motion.div
                        key={promo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white shadow-md rounded-lg overflow-hidden"
                    >
                        <img src={promo.image} alt={promo.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold text-green-600">{promo.title}</h2>
                            <p className="text-gray-600">{promo.description}</p>
                            <p className="text-sm text-gray-500">Hết hạn: {new Date(promo.expiryDate).toLocaleDateString()}</p>
                            <Link to="/flights">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                >
                                    Đặt ngay
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

export default Promotions;