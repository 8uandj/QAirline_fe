import { useState, useEffect } from 'react';
import { getAnnouncementsByType } from '../services/api';
import { motion } from 'framer-motion';

function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoading(true);
                const response = await getAnnouncementsByType('PROMOTION');
                if (response.data && response.data.success) {
                    setPromotions(response.data.data || []);
                } else {
                    setError('Không thể tải danh sách khuyến mãi: ' + (response.data?.message || 'Lỗi không xác định'));
                    setPromotions([]);
                }
            } catch (err) {
                console.error('Error fetching promotions:', err);
                setError('Không thể tải danh sách khuyến mãi: ' + (err.response?.data?.message || err.message));
                setPromotions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    if (loading) return (
        <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải khuyến mãi...</p>
        </div>
    );

    if (error) return (
        <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
            {error}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-6 bg-green-50 min-h-screen"
        >
            <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Khuyến Mãi</h1>
            
            {promotions.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="mt-4 text-gray-600 text-lg">Hiện tại chưa có khuyến mãi nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotions.map((promotion) => (
                        <motion.div
                            key={promotion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                        >
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{promotion.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{promotion.content}</p>
                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="font-medium">Ngày bắt đầu:</span>
                                        <span>{new Date(promotion.start_date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    {promotion.end_date && (
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span className="font-medium">Ngày kết thúc:</span>
                                            <span>{new Date(promotion.end_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default Promotions;