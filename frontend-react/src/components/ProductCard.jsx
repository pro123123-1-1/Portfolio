import { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'

function ProductCard({ product }) {
    const [inCart, setInCart] = useState(false)
    const { showNotification } = useNotification()


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
                quantity: 1,
                farm_name: productObj.farm_name || productObj.farm
            })
        }

        localStorage.setItem('cart', JSON.stringify(savedCart))

        // Dispatch custom event to notify Header and other components
        window.dispatchEvent(new Event('storage'))
        showNotification(`${productObj.name} تمت الإضافة إلى السلة`, 'success', false)
    }

    return (
        <div className="product-card" style={{ position: 'relative' }}>
            <div
                className="product-image"
                style={{ backgroundImage: `url('${product.image || product.image_url || 'https://via.placeholder.com/300'}')` }}
            ></div>
            <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-price">{product.price} ريال</div>
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                    <i className="fas fa-info-circle" style={{ marginLeft: '5px' }}></i>
                    {product.unit} في الوحدة الواحدة
                </div>
                <div className="product-farm">{product.farm_name || product.farm}</div>
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
