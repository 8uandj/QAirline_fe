import { useNavigate } from 'react-router-dom';
// import { login } from '../services/api'; // Comment: Import hàm login từ services/api.js để đăng nhập từ backend
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Login() {
    const navigate = useNavigate();
    const { login: setUser } = useAuth();

    const onSubmit = async (data) => {
        try {
            // Giả lập đăng nhập thành công
            const userData = { id: "1", role: "user" }; // Dữ liệu tĩnh để demo
            localStorage.setItem('token', 'fake-token'); // Giả lập token
            localStorage.setItem('userId', userData.id);
            setUser(userData);
            alert('Đăng nhập thành công! (Dữ liệu tĩnh)');
            navigate('/flights');

            // Comment: Đoạn mã dưới đây dùng để gọi API đăng nhập từ backend, hiện tại được comment để giả lập
            // const res = await login(data);
            // localStorage.setItem('token', res.data.token);
            // localStorage.setItem('userId', res.data.userId);
            // setUser({ id: res.data.userId, role: res.data.role });
            // alert('Đăng nhập thành công!');
            // navigate('/flights');
        } catch (err) {
            alert('Đăng nhập thất bại: ' + err.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-2xl font-bold mb-4 text-green-600">Đăng nhập</h1>
            <AuthForm type="login" onSubmit={onSubmit} />
        </motion.div>
    );
}

export default Login;