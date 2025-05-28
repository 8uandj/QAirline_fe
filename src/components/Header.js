import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-bamboo-500 text-red p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center">
                    <img src="/logo.png" alt="QAirline Logo" className="h-8 mr-2" />
                    QAirline
                </Link>
                <nav className="space-x-4">
                    <Link to="/flights" className="hover:text-bamboo-accent transition">Chuyến bay</Link>
                    <Link to="/tickets" className="hover:text-bamboo-accent transition">Vé của tôi</Link>
                    <Link to="/promotions" className="hover:text-bamboo-accent transition">Khuyến mãi</Link>
                    {user ? (
                        <button onClick={handleLogout} className="hover:text-bamboo-accent transition">
                            Đăng xuất
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-bamboo-accent transition">Đăng nhập</Link>
                            <Link to="/register" className="hover:text-bamboo-accent transition">Đăng ký</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;