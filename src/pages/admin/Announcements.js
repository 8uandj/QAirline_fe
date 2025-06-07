import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement } from '../../services/api';
import { motion } from 'framer-motion';

function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'INFO',
        status: 'ACTIVE',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        priority: '0'
    });
    const [editingId, setEditingId] = useState(null);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await getAnnouncements();
            
            let announcementsData = [];
            if (response.data && response.data.data && response.data.data.data) {
                announcementsData = response.data.data.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                announcementsData = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                announcementsData = response.data;
            }
            
            setAnnouncements(announcementsData);
        } catch (err) {
            let errorMessage = 'Không thể tải thông báo';
            
            if (err.response) {
                errorMessage += `: ${err.response.data?.message || err.response.statusText}`;
            } else if (err.request) {
                errorMessage += ': Không thể kết nối đến server';
            } else {
                errorMessage += `: ${err.message}`;
            }
            
            setError(errorMessage);
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        console.log('Announcements updated:', announcements);
    }, [announcements]);

    const handleEdit = (announcement) => {
        setEditingId(announcement.id);
        setForm({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            status: announcement.status,
            start_date: announcement.start_date ? new Date(announcement.start_date).toISOString().split('T')[0] : '',
            end_date: announcement.end_date ? new Date(announcement.end_date).toISOString().split('T')[0] : '',
            priority: announcement.priority.toString()
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            try {
                await deleteAnnouncement(id);
                setAnnouncements(prev => prev.filter(a => a.id !== id));
                setSuccess('Xóa thông báo thành công!');
            } catch (err) {
                setError('Không thể xóa thông báo: ' + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // Validate dates
            if (form.end_date && new Date(form.start_date) >= new Date(form.end_date)) {
                setError('Ngày kết thúc phải sau ngày bắt đầu');
                return;
            }

            const formData = {
                title: form.title.trim(),
                content: form.content.trim(),
                type: form.type,
                status: form.status,
                start_date: new Date(form.start_date).toISOString(),
                end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
                priority: parseInt(form.priority) || 0
            };

            console.log('📊 Dữ liệu gửi lên:', formData);
            console.log('�� Kiểu dữ liệu:', {
                title: typeof formData.title,
                content: typeof formData.content,
                type: typeof formData.type,
                status: typeof formData.status,
                start_date: typeof formData.start_date,
                end_date: typeof formData.end_date,
                priority: typeof formData.priority
            });

            if (editingId) {
                console.log('🔄 Đang cập nhật thông báo:', editingId);
                const response = await updateAnnouncement(editingId, formData);
                console.log('✅ Kết quả cập nhật:', response);
                if (response.data) {
                    setAnnouncements(prev => prev.map(a => a.id === editingId ? response.data : a));
                    setSuccess('Cập nhật thông báo thành công!');
                    setEditingId(null);
                }
            } else {
                console.log('➕ Đang tạo thông báo mới');
                const response = await createAnnouncement(formData);
                console.log('✅ Kết quả tạo mới:', response);
                if (response.data) {
                    await fetchAnnouncements();
                    setSuccess('Đăng thông báo thành công!');
                }
            }

            // Reset form về giá trị mặc định
            setForm({
                title: '',
                content: '',
                type: 'INFO',
                status: 'ACTIVE',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                priority: '0'
            });
        } catch (err) {
            console.error('Error details:', err.response?.data);
            let errorMessage = 'Không thể ' + (editingId ? 'cập nhật' : 'đăng') + ' thông báo';
            if (err.response?.data?.message) {
                errorMessage += ': ' + err.response.data.message;
            } else if (err.message) {
                errorMessage += ': ' + err.message;
            }
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-6 bg-green-50 min-h-screen"
        >
            <h1 className="text-4xl font-bold mb-8 text-green-600 text-center">Quản lý Thông báo</h1>
            {error && (
                <div className="text-center p-4 text-red-600 bg-red-100 rounded-lg mb-6 shadow-md">
                    {error}
                    <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
                </div>
            )}
            {success && (
                <div className="text-center p-4 text-green-600 bg-green-100 rounded-lg mb-6 shadow-md">
                    {success}
                </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-green-100 max-w-2xl mx-auto mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Loại thông báo</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                            className="p-2 border rounded w-full"
                        >
                            <option value="INFO">Thông tin</option>
                            <option value="WARNING">Cảnh báo</option>
                            <option value="PROMOTION">Khuyến mãi</option>
                            <option value="MAINTENANCE">Bảo trì</option>
                            <option value="DELAY">Chuyến bay bị hoãn</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Nội dung</label>
                    <textarea
                        value={form.content}
                        onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                        className="p-2 border rounded w-full h-32"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Ngày bắt đầu</label>
                        <input
                            type="date"
                            value={form.start_date}
                            onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                            className="p-2 border rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Ngày kết thúc</label>
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                            className="p-2 border rounded w-full"
                            min={form.start_date}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Độ ưu tiên</label>
                        <select
                            value={form.priority}
                            onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                            className="p-2 border rounded w-full"
                        >
                            <option value="0">Thấp</option>
                            <option value="1">Trung bình</option>
                            <option value="2">Cao</option>
                            <option value="3">Khẩn cấp</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Trạng thái</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                        className="p-2 border rounded w-full"
                    >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                        <option value="ARCHIVED">Đã lưu trữ</option>
                    </select>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={submitting}
                    className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition w-full ${
                        submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {submitting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                        </div>
                    ) : (
                        editingId ? 'Cập nhật thông báo' : 'Đăng thông báo'
                    )}
                </motion.button>
            </form>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-green-600">Danh sách thông báo</h2>
                {loading ? (
                    <div className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải thông báo...</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="mt-4 text-gray-600 text-lg">Chưa có thông báo nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map((announcement) => (
                            <motion.div
                                key={announcement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                            >
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{announcement.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{announcement.content}</p>
                                    <div className="space-y-2 mt-auto">
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span className="font-medium">Ngày bắt đầu:</span>
                                            <span>{new Date(announcement.start_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        {announcement.end_date && (
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span className="font-medium">Ngày kết thúc:</span>
                                                <span>{new Date(announcement.end_date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                announcement.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {announcement.status}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(announcement)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(announcement.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                    title="Xóa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default AdminAnnouncements;