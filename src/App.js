import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Flights from './pages/Flights';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import Tickets from './pages/Tickets';
import Promotions from './pages/Promotions';
import Login from './pages/Login';
import Register from './pages/Register';
import Destination from './pages/Destination';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Services from './pages/Services';
import FAQ from './pages/FAQ';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminAircrafts from './pages/admin/Aircrafts';
import AdminFlights from './pages/admin/Flights';
import AdminTickets from './pages/admin/Tickets';
import CreateRoute from './pages/admin/CreateRoute';
import SeatSelection from './pages/SeatSelection';

// Danh sách điểm đến phổ biến
const popularDestinations = [
  {
    name: "Hà Nội",
    image: "https://i.pinimg.com/736x/c7/77/29/c777299bd23ed0f3b6eec4bc24a26ac6.jpg",
    description: "Hà Nội, thủ đô của Việt Nam, nổi tiếng với kiến trúc ngàn năm và văn hóa phong phú. Hãy khám phá Hồ Hoàn Kiếm, Văn Miếu, và các món ăn đường phố hấp dẫn như phở và bún chả.",
    galleryImages: [
      "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/anh-ha-noi.jpg",
      "https://nads.1cdn.vn/2024/07/10/W_z5620155725694_52977c30a98953391be8bda1f9b50ba7.jpg",
      "https://nads.1cdn.vn/2024/07/08/w_12-tbtl-bui-ngoc-cuong-0858186186-long-bien-cay-cau-di-qua-ba-the-ky-1-.jpg"
    ],
  },
  {
    name: "TP. Hồ Chí Minh",
    image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482744RVW/anh-mo-ta.png",
    description: "TP. Hồ Chí Minh là trung tâm kinh tế sôi động của Việt Nam, với các địa danh nổi tiếng như Dinh Độc Lập, Nhà thờ Đức Bà, và chợ Bến Thành. Đừng bỏ lỡ cơ hội thưởng thức cà phê Sài Gòn!",
    galleryImages: [
      "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482744HwS/anh-mo-ta.png",
      "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482744OgG/anh-mo-ta.png",
      "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482744cHp/anh-mo-ta.png"
    ],
  },
  {
    name: "Đà Nẵng",
    image: "https://media.istockphoto.com/id/1357445596/vi/anh/c%E1%BA%A7u-r%E1%BB%93ng-%E1%BB%9F-th%C3%A0nh-ph%E1%BB%91-%C4%91%C3%A0-n%E1%BA%B5ng.jpg?s=612x612&w=0&k=20&c=H_3uhMhNr1kZvg78iOtTROncLKwbsYrffBAEIPpGX2g=",
    description: "Đà Nẵng là thành phố biển xinh đẹp với cầu Rồng, bãi biển Mỹ Khê, và Bà Nà Hills. Đây là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và văn hóa.",
    galleryImages: [
      "https://vietluxtour.com/Upload/images/2024/khamphatrongnuoc/%C4%91%E1%BB%8Ba%20%C4%91i%E1%BB%83m%20du%20l%E1%BB%8Bch%20%C4%91%C3%A0%20n%E1%BA%B5ng/dia-diem-du-lich-da-nang%20(9)-min.jpg",
      "https://vietluxtour.com/Upload/images/2024/khamphatrongnuoc/%C4%91%E1%BB%8Ba%20%C4%91i%E1%BB%83m%20du%20l%E1%BB%8Bch%20%C4%91%C3%A0%20n%E1%BA%B5ng/dia-diem-du-lich-da-nang%20(2)-min.jpg",
      "https://vietluxtour.com/Upload/images/2024/khamphatrongnuoc/%C4%91%E1%BB%8Ba%20%C4%91i%E1%BB%83m%20du%20l%E1%BB%8Bch%20%C4%91%C3%A0%20n%E1%BA%B5ng/dia-diem-du-lich-da-nang%20(3)-min.jpg"
    ],
  },
  {
    name: "Nha Trang",
    image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482828Nyr/anh-mo-ta.png",
    description: "Nha Trang nổi tiếng với những bãi biển xanh ngọc và các hoạt động lặn biển. Đừng bỏ lỡ cơ hội khám phá Vinpearl Land và các hòn đảo tuyệt đẹp.",
    galleryImages: [
      "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482828IeZ/anh-mo-ta.png",
      "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482828Hnv/anh-mo-ta.png",
      "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482828JXJ/anh-mo-ta.png"
    ],
  },
  {
    name: "Đà Lạt",
    image: "https://i2.ex-cdn.com/crystalbay.com/files/content/2025/02/16/du-lich-da-lat-2-1305.jpg",
    description: "Đà Lạt, thành phố ngàn hoa, thu hút du khách với khí hậu mát mẻ, hồ Xuân Hương, thung lũng Tình Yêu, và các đồi chè xanh mướt.",
    galleryImages: [
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2025/02/16/du-lich-da-lat-3-1305.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2025/02/16/du-lich-da-lat-5-1306.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2025/02/16/du-lich-da-lat-6-1306.jpg"
    ],
  },
  {
    name: "Quy Nhơn",
    image: "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/05/16/du-lich-quy-nhon-1-1653.jpg",
    description: "Quy Nhơn là một điểm đến yên bình với bãi biển Kỳ Co, Eo Gió, và các làng chài truyền thống. Đây là nơi lý tưởng để thư giãn và tận hưởng thiên nhiên.",
    galleryImages: [
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/05/16/du-lich-quy-nhon-2-1653.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/05/16/du-lich-quy-nhon-4-1653.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/05/16/du-lich-quy-nhon-5-1653.jpg"
    ],
  },
  {
    name: "Phú Quốc",
    image: "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/11/25/phu-quoc-3-1034.jpg",
    description: "Phú Quốc, hòn đảo ngọc của Việt Nam, nổi tiếng với bãi Sao, làng chài Hàm Ninh, và các khu nghỉ dưỡng sang trọng. Đây là thiên đường cho kỳ nghỉ biển.",
    galleryImages: [
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/11/25/phu-quoc-12-1034.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/11/25/phu-quoc-13-1034.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/11/25/phu-quoc-18-1034.jpg"
    ],
  },
  {
    name: "Hải Phòng",
    image: "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/06/13/du-lich-hai-phong-3-1620.jpg",
    description: "Hải Phòng, thành phố cảng sôi động, là cửa ngõ ra vịnh Hạ Long. Du khách có thể khám phá đảo Cát Bà, bãi biển Đồ Sơn, và các món hải sản tươi ngon.",
    galleryImages: [
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/06/13/du-lich-hai-phong-4-1620.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/06/13/du-lich-hai-phong-5-1620.jpg",
      "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/06/13/du-lich-hai-phong-9-1620.jpg"
    ],
  },
];

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Các trang không cần layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Giao diện khách hàng */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home destinations={popularDestinations} />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/seat-selection/:flightId" element={<SeatSelection />} />
            <Route path="/flight/:flightId" element={<FlightDetails />} />
            <Route path="/booking/:flightId" element={<Booking />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/destination/:name" element={<Destination destinations={popularDestinations} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>

          {/* Giao diện quản trị */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/aircrafts" element={<AdminAircrafts />} />
            <Route path="/admin/flights" element={<AdminFlights />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/create-route" element={<CreateRoute />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;