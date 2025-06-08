import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-900 text-white p-8">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Section 1: Giới thiệu QAirline */}
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-white">Q</span>
                        </div>
                        <Link to="/" className="text-2xl font-bold text-green-500">QAirline</Link>
                    </div>
                    <p className="mt-2 text-gray-400 leading-relaxed">
                        Discover seamless travel with QAirline – your gateway to unforgettable journeys across Vietnam and beyond!
                    </p>
                    <div className="flex space-x-4 mt-4">
                        <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-green-500 hover:bg-[rgb(245,158,11)] flex items-center justify-center transition-all duration-300">
                            <img src="https://1.bp.blogspot.com/-S8HTBQqmfcs/XN0ACIRD9PI/AAAAAAAAAlo/FLhccuLdMfIFLhocRjWqsr9cVGdTN_8sgCPcBGAYYCw/s1600/f_logo_RGB-Blue_1024.png" alt="Facebook" className="w-6 h-6" />
                        </a>
                        <a href="https://twitter.com" className="w-10 h-10 rounded-full bg-green-500 hover:bg-[rgb(245,158,11)] flex items-center justify-center transition-all duration-300">
                            <img src="https://vectorseek.com/wp-content/uploads/2023/08/tiwtter-x-icon-Logo-Vector.svg-.png" alt="Twitter" className="w-6 h-6" />
                        </a>
                        <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-green-500 hover:bg-[rgb(245,158,11)] flex items-center justify-center transition-all duration-300">
                            <img src="https://static-00.iconduck.com/assets.00/instagram-icon-2048x2048-uc6feurl.png" alt="Instagram" className="w-6 h-6" />
                        </a>
                    </div>
                </div>

                {/* Section 2: Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/about" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-chevron-right text-xs mr-2"></i>
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/services" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-chevron-right text-xs mr-2"></i>
                                Our Services
                            </Link>
                        </li>
                        <li>
                            <Link to="/promotions" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-chevron-right text-xs mr-2"></i>
                                Promotions
                            </Link>
                        </li>
                        <li>
                            <Link to="/flights" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-chevron-right text-xs mr-2"></i>
                                Flights
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-chevron-right text-xs mr-2"></i>
                                FAQ
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-chevron-right text-xs mr-2"></i>
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Section 3: Destinations */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Destinations</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Domestic</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/flights?from=HAN&to=SGN" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-plane text-xs mr-2"></i>
                                        Hanoi - Ho Chi Minh City
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/flights?from=HAN&to=DAD" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-plane text-xs mr-2"></i>
                                        Hanoi - Da Nang
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/flights?from=HAN&to=CXR" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-plane text-xs mr-2"></i>
                                        Hanoi - Nha Trang
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/flights?from=HAN&to=DLI" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-plane text-xs mr-2"></i>
                                        Hanoi - Da Lat
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">International</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/flights?type=international" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-globe text-xs mr-2"></i>
                                        International
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/faq" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                        <i className="fas fa-info-circle text-xs mr-2"></i>
                                        Travel Tips
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Section 4: Support & Legal */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Support & Legal</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/contact" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-envelope text-xs mr-2"></i>
                                Contact Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
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
                        <li>
                            <Link to="/booking-conditions" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-file-alt text-xs mr-2"></i>
                                Booking Conditions
                            </Link>
                        </li>
                        <li>
                            <Link to="/cookies" className="text-gray-400 hover:text-green-500 transition-colors flex items-center">
                                <i className="fas fa-cookie-bite text-xs mr-2"></i>
                                Cookies
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Section 5: Our App */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Download Our App</h3>
                    <p className="text-gray-400">Get the best travel experience with our mobile app</p>
                    <div className="flex space-x-4 mt-4">
                        <a href="#" className="bg-green-500 hover:bg-[rgb(245,158,11)] px-6 py-3 rounded-lg transition-colors">
                            <i className="fab fa-apple mr-2"></i>App Store
                        </a>
                        <a href="#" className="bg-green-500 hover:bg-[rgb(245,158,11)] px-6 py-3 rounded-lg transition-colors">
                            <i className="fab fa-google-play mr-2"></i>Google Play
                        </a>
                    </div>
                    <div className="mt-4 w-24 h-24 bg-gray-700 flex items-center justify-center">
                        <img src="https://eskietech.com/wp-content/uploads/2013/12/sample.png?b7bc51&b7bc51" alt="QR Code for App Download" className="w-20 h-20" />
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="col-span-1 md:col-span-5 border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm mb-4 md:mb-0">
                            © 2025 QAirline. All Rights Reserved. | Business Registration Code: 123456789
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