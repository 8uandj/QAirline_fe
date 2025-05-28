import { useNavigate } from 'react-router-dom';
// import { registerUser } from '../services/api'; // Comment: Import hàm registerUser từ services/api.js để đăng ký từ backend
import AuthForm from '../components/AuthForm';
import { motion } from 'framer-motion';

function Register() {
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            // Giả lập đăng ký thành công
            alert('Đăng ký thành công! Vui lòng đăng nhập. (Dữ liệu tĩnh)');
            navigate('/login');

            // Comment: Đoạn mã dưới đây dùng để gọi API đăng ký từ backend, hiện tại được comment để giả lập
            // await registerUser(data);
            // alert('Đăng ký thành công! Vui lòng đăng nhập.');
            // navigate('/login');
        } catch (err) {
            alert('Đăng ký thất bại: ' + err.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto p-4"
        >
            <h1 className="text-2xl font-bold mb-4 text-green-600">Đăng ký</h1>
            <AuthForm type="register" onSubmit={onSubmit} />
        </motion.div>
    );
}

export default Register;