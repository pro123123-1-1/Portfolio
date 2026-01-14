import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>مزارع المملكة</h3>
            <p>من تراب وطننا... حيث تُزرع الجودة، وتُحصد الثقة. نقدم لكم أفضل المنتجات الزراعية الطازجة مباشرة
              من مزارعنا إلى منزلكم.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-snapchat"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h3>روابط سريعة</h3>
            <ul>
              <li><Link to="/">الرئيسية</Link></li>
              <li><Link to="/products">منتجاتنا</Link></li>
              <li><Link to="/track">تتبع طلبك</Link></li>
              <li><Link to="/farmers">المزارعين</Link></li>
              <li><Link to="/about">من نحن</Link></li>
              <li><Link to="/contact">اتصل بنا</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>معلومات الاتصال</h3>
            <ul>
              <li><i className="fas fa-phone"></i> 0551234567</li>
              <li><i className="fas fa-envelope"></i> info@almazari.com</li>
              <li><i className="fas fa-map-marker-alt"></i> الرياض، المملكة العربية السعودية</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>© 2025 مزارع المملكة. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

