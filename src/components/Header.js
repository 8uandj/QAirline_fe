import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';

function Header({ isAdmin = false }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Trạng thái menu hamburger
    const [language, setLanguage] = useState('EN'); // Ngôn ngữ giả định
    const [currency, setCurrency] = useState('VND'); // Tiền tệ giả định

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false); // Đóng menu khi đăng xuất
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header
            className="text-white shadow-md fixed top-0 left-0 w-full z-50 h-24"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="bg-black bg-opacity-50 h-full">
                <div className="container mx-auto flex justify-between items-center h-full px-4">
                    {/* Logo và tên QAirline */}
                    <Link to={isAdmin ? '/admin' : '/'} className="flex items-center space-x-2">
                        <img
                            src="https://th.bing.com/th/id/R.ba7ed8706ef73b284772b3f07a479f0c?rik=%2fXA%2bwffDaP0jJQ&pid=ImgRaw&r=0"
                            alt="QAirline Logo"
                            className="w-10 h-10"
                        />
                        <span className="text-2xl font-bold">
                            {isAdmin ? 'QAirline Admin' : 'QAirline'}
                        </span>
                    </Link>

                    {/* Menu điều hướng chính (ẩn trên màn hình nhỏ) */}
                    <nav className="hidden md:flex space-x-6">
                        {isAdmin ? (
                            <>
                                <Link to="/admin/announcements" className="font-bold hover:text-green-500 hover:underline">Thông báo</Link>
                                <Link to="/admin/aircrafts" className="font-bold hover:text-green-500 hover:underline">Tàu bay</Link>
                                <Link to="/admin/flights" className="font-bold hover:text-green-500 hover:underline">Chuyến bay</Link>
                                <Link to="/admin/tickets" className="font-bold hover:text-green-500 hover:underline">Đặt vé</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/flights" className="font-bold hover:text-green-500 hover:underline">Chuyến bay</Link>
                                <Link to="/tickets" className="font-bold hover:text-green-500 hover:underline">Vé của tôi</Link>
                                <Link to="/promotions" className="font-bold hover:text-green-500 hover:underline">Khuyến mãi</Link>
                            </>
                        )}
                    </nav>

                    {/* Ngôn ngữ, tiền tệ, tìm kiếm, và nút hành động (ẩn trên màn hình nhỏ) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Dropdown ngôn ngữ */}
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent border-none text-white"
                        >
                            <option value="EN" className="text-black">EN</option>
                            <option value="VN" className="text-black">VN</option>
                        </select>

                        {/* Dropdown tiền tệ */}
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="bg-transparent border-none text-white"
                        >
                            <option value="VND" className="text-black">VND</option>
                            <option value="USD" className="text-black">USD</option>
                        </select>

                        {/* Biểu tượng tìm kiếm */}
                        <button className="text-white hover:text-green-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </button>

                        {/* Nút đăng nhập/đăng ký/đăng xuất */}
                        {user ? (
                            <button onClick={handleLogout} className="hover:text-green-500 hover:underline">Đăng xuất</button>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-green-500 hover:underline">Đăng nhập</Link>
                                <Link to="/register" className="hover:text-green-500 hover:underline">Đăng ký</Link>
                            </>
                        )}
                    </div>

                    {/* Nút hamburger (hiển thị trên màn hình nhỏ) */}
                    <button className="md:hidden text-white" onClick={toggleMenu}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Menu hamburger (hiển thị khi mở trên màn hình nhỏ) */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden bg-white p-4 shadow-md"
                >
                    <nav className="flex flex-col space-y-4">
                        {isAdmin ? (
                            <>
                                <Link to="/admin/announcements" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Thông báo</Link>
                                <Link to="/admin/aircrafts" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Tàu bay</Link>
                                <Link to="/admin/flights" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Chuyến bay</Link>
                                <Link to="/admin/tickets" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Đặt vé</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/flights" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Chuyến bay</Link>
                                <Link to="/tickets" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Vé của tôi</Link>
                                <Link to="/promotions" className="text-black font-bold hover:text-green-500 hover:underline" onClick={toggleMenu}>Khuyến mãi</Link>
                            </>
                        )}
                        {/* Ngôn ngữ và tiền tệ trong menu hamburger */}
                        <div className="flex space-x-4">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent border-none text-black"
                            >
                                <option value="EN">EN</option>
                                <option value="VN">VN</option>
                            </select>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="bg-transparent border-none text-black"
                            >
                                <option value="VND">VND</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                        {/* Nút hành động trong menu hamburger */}
                        {user ? (
                            <button onClick={handleLogout} className="text-black hover:text-green-500 hover:underline">Đăng xuất</button>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <Link to="/login" className="text-black hover:text-green-500 hover:underline" onClick={toggleMenu}>Đăng nhập</Link>
                                <Link to="/register" className="text-black hover:text-green-500 hover:underline" onClick={toggleMenu}>Đăng ký</Link>
                            </div>
                        )}
                    </nav>
                </motion.div>
            )}
        </header>
    );
}

export default Header;