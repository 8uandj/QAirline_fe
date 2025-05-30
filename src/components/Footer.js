import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-gray-900 text-white p-8">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Section 1: Giới thiệu QAirline */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Experience the Journey</h3>
                    <Link to="/" className="text-2xl font-bold text-green-500">QAirline</Link>
                    <p className="mt-2 text-gray-400">
                        Discover seamless travel with QAirline – your gateway to unforgettable journeys!
                    </p>
                </div>
                <div>
                    <ul className="mt-4 space-y-2">
                        <li><Link to="/about-us" className="hover:text-green-500">About Us</Link></li>
                        <li><Link to="/news" className="hover:text-green-500">News</Link></li>
                        <li><Link to="/awards" className="hover:text-green-500">Awards</Link></li>
                        <li><Link to="/our-fleet" className="hover:text-green-500">Our Fleet</Link></li>
                        <li><Link to="/careers" className="hover:text-green-500">Careers</Link></li>
                    </ul>
                </div>

                {/* Section 2: Pháp lý */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link to="/privacy-policy" className="hover:text-green-500">Privacy Policy</Link></li>
                        <li><Link to="/terms-of-service" className="hover:text-green-500">Terms of Service</Link></li>
                        <li><Link to="/booking-conditions" className="hover:text-green-500">Booking Conditions</Link></li>
                        <li><Link to="/cookies" className="hover:text-green-500">Cookies</Link></li>
                    </ul>
                </div>

                {/* Section 3: Liên hệ và hỗ trợ */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Contact & Support</h3>
                    <ul className="space-y-2">
                        <li><Link to="/contact" className="hover:text-green-500">Contact Information</Link></li>
                        <li><Link to="/faqs" className="hover:text-green-500">FAQs</Link></li>
                        <li><Link to="/help-center" className="hover:text-green-500">Help Center</Link></li>
                    </ul>
                </div>

                {/* Section 4: Ứng dụng QAirline */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Our App</h3>
                    <p className="text-gray-400">Download our app on App Store or Google Play!</p>
                    <div className="mt-2 w-24 h-24 bg-gray-700 flex items-center justify-center">
                        {/* Giả định hình ảnh QR code */}
                        <span className="text-gray-400">[QR Code]</span>
                    </div>
                </div>

                {/* Section 5: Hành trình và điểm đến */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Explore with QAirline</h3>
                    <ul className="space-y-2">
                        <li><Link to="/domestic-flights" className="hover:text-green-500">Domestic Flights</Link></li>
                        <li><Link to="/international-flights" className="hover:text-green-500">International Flights</Link></li>
                        <li><Link to="/travel-tips" className="hover:text-green-500">Travel Tips</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-md font-semibold mt-4 text-green-500">Domestic Journeys</h3>
                   <ul className="space-y-2 mt-2">
                        <li><Link to="/flights/hanoi-hochiminh" className="hover:text-green-500">Hanoi - Ho Chi Minh City</Link></li>
                        <li><Link to="/flights/hanoi-danang" className="hover:text-green-500">Hanoi - Da Nang</Link></li>
                        <li><Link to="/flights/hanoi-nhatrang" className="hover:text-green-500">Hanoi - Nha Trang</Link></li>
                        <li><Link to="/flights/hanoi-dalat" className="hover:text-green-500">Hanoi - Da Lat</Link></li>
                    </ul>
                </div>
                <div>    
                    <h3 className="text-md font-semibold mt-4 text-green-500">Domestic Destinations</h3>
                    <ul className="space-y-2 mt-2">
                        <li><Link to="/destinations/hanoi" className="hover:text-green-500">Hanoi</Link></li>
                        <li><Link to="/destinations/hochiminh" className="hover:text-green-500">Ho Chi Minh City</Link></li>
                        <li><Link to="/destinations/danang" className="hover:text-green-500">Da Nang</Link></li>
                        <li><Link to="/destinations/nhatrang" className="hover:text-green-500">Nha Trang</Link></li>
                        <li><Link to="/destinations/dalat" className="hover:text-green-500">Da Lat</Link></li>
                    </ul>
                </div>
                <div className="container mx-auto mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-green-500">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" className="hover:text-green-500">Facebook</a>
                        <a href="https://twitter.com" className="hover:text-green-500">Twitter</a>
                        <a href="https://instagram.com" className="hover:text-green-500">Instagram</a>
                    </div>
                    <div className="container mx-auto mt-4">
                        <Link to="/sitemap" className="hover:text-green-500">Sitemap</Link>
                    </div>
                </div>
            </div>

            {/* Section 8: Bản quyền */}
            <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
                <p>© 2025 QAirline. All Rights Reserved.</p>
                <p>Business Registration Code: 123456789</p>
            </div>
        </footer>
    );
}

export default Footer;