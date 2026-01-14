import { useState, useEffect } from 'react'
import Notification from './Notification'

function ProductCard({ product }) {
    const [inCart, setInCart] = useState(false)
    const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'info', persist: false })

    const showNotification = (message, type = 'warning', persist = false) => {
        setNotification({ isVisible: true, message, type, persist })
    }

    // Star generation logic (shared)
    const generateStars = (rating = 0) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={i} className="fas fa-star"></i>)
        }

        if (hasHalfStar) {
            stars.push(<i key="half" className="fas fa-star-half-alt"></i>)
        }

        const emptyStars = 5 - stars.length
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="far fa-star"></i>)
        }

        return stars
    }

    const addToCart = (productObj) => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || []

        // Check by ID or name to avoid duplicates
        const existingItem = savedCart.find(item =>
            (item.product_id && item.product_id === productObj.id) ||
            item.product === productObj.name
        )

        // Check unique items limit ONLY when adding a NEW item
        if (!existingItem && savedCart.length >= 5) {
            showNotification('عذراً، لا يمكنك إضافة أكثر من 5 أصناف مختلفة في الطلب الواحد', 'warning', false)
            return
        }

        // Soft warning for total quantity exceeding 10
        const currentTotalQuantity = savedCart.reduce((total, item) => total + item.quantity, 0)
        if (currentTotalQuantity + 1 > 10) {
            showNotification('عذراً، نود تنبيهك بأن طلبك يحتوي الآن على أكثر من 10 منتجات. يرجى مراجعة الكميات المختارة لضمان دقة الطلب وتفادي أي تأخير.', 'warning', true)
        }

        if (existingItem) {
            existingItem.quantity += 1
        } else {
            savedCart.push({
                product: productObj.name,
                product_id: productObj.id,
                price: parseFloat(productObj.price),
                quantity: 1
            })
        }

        localStorage.setItem('cart', JSON.stringify(savedCart))

        // Dispatch custom event to notify Header and other components
        window.dispatchEvent(new Event('storage'))
        showNotification(`${productObj.name} تمت الإضافة إلى السلة`, 'success', false)
    }

    return (
        <div className="product-card" style={{ position: 'relative' }}>
            <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                persist={notification.persist}
                onClose={() => setNotification({ ...notification, isVisible: false })}
            />
            <div
                className="product-image"
                style={{ backgroundImage: `url('${product.image || product.image_url || 'https://via.placeholder.com/300'}')` }}
            ></div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-price">{product.price} ريال / {product.unit || 'كجم'}</div>
                <div className="product-farm">{product.farm_name || product.farm}</div>
                <div className="product-rating">
                    {generateStars(product.rating || 4.5)}
                    <span>({product.reviews || 0})</span>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => addToCart(product)}
                >
                    أضف إلى السلة
                </button>
            </div>
        </div>
    )
}

export default ProductCard
