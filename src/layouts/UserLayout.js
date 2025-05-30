import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function UserLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin');
        }
        const protectedRoutes = ['/tickets', '/booking'];
        const currentPath = window.location.pathname;
        if (!user && protectedRoutes.some(route => currentPath.startsWith(route))) {
            navigate('/login');
        }
    }, [user, navigate]);

    return (
        <div>
            <Header isAdmin={false} />
            <main className="container mx-auto p-4 pt-28"> {/* Tăng từ pt-24 thành pt-28 */}
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default UserLayout;