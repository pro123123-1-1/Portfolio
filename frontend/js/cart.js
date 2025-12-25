// إدارة عربة التسوق
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.loadCart();
        this.attachEventListeners();
    }

    loadCart() {
        const cartItems = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>عربة التسوق فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات إلى عربة التسوق بعد</p>
                    <a href="products.html" class="btn-primary" style="margin-top: 20px; display: inline-block;">
                        ابدأ التسوق
                    </a>
                </div>
            `;
            this.updateSummary();
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product="${item.product}">
                <div class="item-image" style="background-image: url('${item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}')"></div>
                <div class="item-details">
                    <h3>${item.product}</h3>
                    <div class="item-price">${item.price} ر.س / كجم</div>
                    <div class="item-farm">${item.farm || 'مزارع الوادي'}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-product="${item.product}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product="${item.product}">
                        <button class="quantity-btn increase" data-product="${item.product}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-item" data-product="${item.product}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        this.updateSummary();
    }

    updateSummary() {
        const itemsCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = 15; // رسوم شحن ثابتة
        const total = subtotal + shipping;

        document.getElementById('itemsCount').textContent = itemsCount;
        document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ر.س';
        document.getElementById('shipping').textContent = shipping + ' ر.س';
        document.getElementById('total').textContent = total.toFixed(2) + ' ر.س';

        // تحديث العداد في الهيدر
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = itemsCount;
        }
    }

    updateQuantity(product, newQuantity) {
        const item = this.cart.find(item => item.product === product);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.loadCart();
        }
    }

    removeItem(product) {
        this.cart = this.cart.filter(item => item.product !== product);
        this.saveCart();
        this.loadCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    attachEventListeners() {
        // أحداث زيادة/تقليل الكمية
        document.addEventListener('click', (e) => {
            if (e.target.closest('.increase')) {
                const product = e.target.closest('.increase').dataset.product;
                const item = this.cart.find(item => item.product === product);
                if (item) {
                    this.updateQuantity(product, item.quantity + 1);
                }
            }

            if (e.target.closest('.decrease')) {
                const product = e.target.closest('.decrease').dataset.product;
                const item = this.cart.find(item => item.product === product);
                if (item && item.quantity > 1) {
                    this.updateQuantity(product, item.quantity - 1);
                }
            }

            if (e.target.closest('.remove-item')) {
                const product = e.target.closest('.remove-item').dataset.product;
                this.removeItem(product);
            }
        });

        // حدث تغيير الكمية يدوياً
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const product = e.target.dataset.product;
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0) {
                    this.updateQuantity(product, newQuantity);
                }
            }
        });

        // حدث اتمام الشراء
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (this.cart.length === 0) {
                alert('عربة التسوق فارغة!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
}

// تهيئة مدير عربة التسوق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new CartManager();
});