import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Login() {
    const navigate = useNavigate();
    const { login: setUser } = useAuth();
    const [error, setError] = useState(null);

    const onSubmit = async (data) => {
        console.log("Dữ liệu gửi đi:", data);
        try {
            const res = await login(data);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.userId);
            setUser(res.data);
            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            } else {
                setError('Đăng nhập thất bại: ' + err.message);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header isAdmin={false} />
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="container mx-auto p-4 pt-28 flex-grow" // Tăng từ pt-24 thành pt-28, thêm flex-grow để đẩy footer xuống dưới
            >
                <h1 className="text-2xl font-bold mb-4 text-green-600">Đăng nhập</h1>
                {error && (
                    <div className="text-center p-4 text-red-500">
                        {error}
                        <p className="text-gray-600 mt-2">Vui lòng thử lại hoặc liên hệ quản trị viên.</p>
                    </div>
                )}
                <AuthForm type="login" onSubmit={onSubmit} />
            </motion.div>
            <Footer />
        </div>
    );
}

export default Login;