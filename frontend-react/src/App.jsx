import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NotificationProvider } from './context/NotificationContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailurePage from './pages/PaymentFailurePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ProfilePage from './pages/ProfilePage'
import FarmersPage from './pages/FarmersPage'
import MyFarmPage from './pages/MyFarmPage'
import OrdersPage from './pages/OrdersPage'
import './App.css'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/my-farm" element={<MyFarmPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App

