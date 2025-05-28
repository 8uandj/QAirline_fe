import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Flights from './pages/Flights';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import Tickets from './pages/Tickets';
import Login from './pages/Login';
import Register from './pages/Register';
import Promotions from './pages/Promotions';
import Chatbot from './components/Chatbot';
import './index.css';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/flights" element={<Flights />} />
                                <Route path="/flight/:flightId" element={<FlightDetails />} />
                                <Route path="/booking/:flightId" element={<Booking />} />
                                <Route path="/tickets" element={<Tickets />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/promotions" element={<Promotions />} />
                            </Routes>
                        </main>
                        <Footer />
                        <Chatbot />
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;