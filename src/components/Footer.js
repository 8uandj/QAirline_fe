import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xl font-bold text-white">Q</span>
                            </div>
                            <Link to="/" className="text-2xl font-bold text-green-500">QAirline</Link>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Discover seamless travel with QAirline – your gateway to unforgettable journeys across Vietnam and beyond!
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-500 flex items-center justify-center transition-all duration-300">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://twitter.com" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-500 flex items-center justify-center transition-all duration-300">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-500 flex items-center justify-center transition-all duration-300">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-green-500 border-b border-gray-800 pb-3">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/about-us" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-chevron-right text-xs mr-2"></i>
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/news" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-chevron-right text-xs mr-2"></i>
                                        News
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/our-fleet" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-chevron-right text-xs mr-2"></i>
                                        Our Fleet
                                    </Link>
                                </li>
                            </ul>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/careers" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-chevron-right text-xs mr-2"></i>
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/awards" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-chevron-right text-xs mr-2"></i>
                                        Awards
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/sustainability" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-chevron-right text-xs mr-2"></i>
                                        Sustainability
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Destinations */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-green-500 border-b border-gray-800 pb-3">Destinations</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Domestic</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link to="/flights/hanoi-hochiminh" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                            <i className="fas fa-plane text-xs mr-2"></i>
                                            Hanoi - HCM
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/flights/hanoi-danang" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                            <i className="fas fa-plane text-xs mr-2"></i>
                                            Hanoi - Da Nang
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/flights/hanoi-nhatrang" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                            <i className="fas fa-plane text-xs mr-2"></i>
                                            Hanoi - Nha Trang
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">International</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link to="/flights/international" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                            <i className="fas fa-globe text-xs mr-2"></i>
                                            International
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/travel-tips" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                            <i className="fas fa-info-circle text-xs mr-2"></i>
                                            Travel Tips
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Support & Legal */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-green-500 border-b border-gray-800 pb-3">Support & Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                    <i className="fas fa-envelope text-xs mr-2"></i>
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faqs" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                    <i className="fas fa-question-circle text-xs mr-2"></i>
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                    <i className="fas fa-shield-alt text-xs mr-2"></i>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-of-service" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                    <i className="fas fa-file-contract text-xs mr-2"></i>
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Mobile App Section */}
                <div className="border-t border-gray-800 pt-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold mb-2 text-green-500">Download Our App</h3>
                            <p className="text-gray-400">Get the best travel experience with our mobile app</p>
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                                <i className="fab fa-apple mr-2"></i>App Store
                            </a>
                            <a href="#" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                                <i className="fab fa-google-play mr-2"></i>Google Play
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2025 QAirline. All Rights Reserved.
                        </p>
                        <div className="flex space-x-6">
                            <Link to="/sitemap" className="text-gray-400 hover:text-green-500 text-sm transition-colors">Sitemap</Link>
                            <Link to="/cookies" className="text-gray-400 hover:text-green-500 text-sm transition-colors">Cookies</Link>
                            <Link to="/accessibility" className="text-gray-400 hover:text-green-500 text-sm transition-colors">Accessibility</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;