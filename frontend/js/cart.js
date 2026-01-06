class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    //  دالة التهيئة الجديدة
    init() {
        this.setupEventDelegation();
        this.loadCart();
        this.updateCartCount();
        
        // CSS للـ Notifications
        this.addNotificationStyles();
    }

    loadCart() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = this.getEmptyCartHTML();
            this.updateSummary();
            return;
        }

        cartItems.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
        this.updateSummary();
    }

    createCartItemHTML(item) {
        const imageUrl = this.getProductImage(item);
        return `
            <div class="cart-item" data-product="${item.product}">
                <div class="item-image" style="background-image: ${imageUrl}"></div>
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
        `;
    }

    getProductImage(item) {
        if (item.image && item.image !== 'undefined' && item.image.startsWith('http')) {
            return `url('${item.image}')`;
        }
        return `url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`;
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>عربة التسوق فارغة</h3>
                <p>لم تقم بإضافة أي منتجات إلى عربة التسوق بعد</p>
                <a href="products.html" class="btn-primary" style="margin-top: 20px; display: inline-block;">
                    ابدأ التسوق
                </a>
            </div>
        `;
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

        this.updateCartCount();
    }

    updateCartCount() {
        const itemsCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = itemsCount;
        });
    }

    //  دالة إضافة المنتج الجديدة
    addItem(product, price, image = '', farm = '') {
        const existingItem = this.cart.find(item => item.product === product);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                product: product,
                price: parseFloat(price),
                image: image,
                farm: farm,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product} تمت الإضافة إلى السلة`);
        
        // إذا كانت صفحة السلة مفتوحة، تحديثها
        if (document.getElementById('cartItems')) {
            this.loadCart();
        }
    }

    updateQuantity(product, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(product);
            return;
        }
        
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
        this.showNotification('تم إزالة المنتج من السلة');
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            
            //  مزامنة مع الباك إند إذا المستخدم مسجل
            this.syncWithBackendIfLoggedIn();
            
        } catch (e) {
            console.error('خطأ في حفظ السلة:', e);
            this.showNotification('عذراً، لا يمكن إضافة المزيد من المنتجات', 'error');
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.loadCart();
        this.updateCartCount();
        this.showNotification('تم تفريغ السلة');
    }

    //  Event Delegation الجديدة
    setupEventDelegation() {
        // إزالة الـ listeners القديمة
        this.removeOldListeners();
        
        // إضافة listener واحد لجميع الأحداث
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
        
        // زر اتمام الشراء
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', this.handleCheckout.bind(this));
        }
    }

    removeOldListeners() {
        // يمكن إضافة منطق لإزالة الـ listeners القديمة إذا احتجت
    }

    handleClick(e) {
        // زيادة الكمية
        if (e.target.closest('.increase')) {
            const product = e.target.closest('.increase').dataset.product;
            const item = this.cart.find(item => item.product === product);
            if (item) {
                this.updateQuantity(product, item.quantity + 1);
            }
        }

        // تقليل الكمية
        if (e.target.closest('.decrease')) {
            const product = e.target.closest('.decrease').dataset.product;
            const item = this.cart.find(item => item.product === product);
            if (item && item.quantity > 1) {
                this.updateQuantity(product, item.quantity - 1);
            }
        }

        // إزالة المنتج
        if (e.target.closest('.remove-item')) {
            const product = e.target.closest('.remove-item').dataset.product;
            this.removeItem(product);
        }
    }

    handleChange(e) {
        if (e.target.classList.contains('quantity-input')) {
            const product = e.target.dataset.product;
            const newQuantity = parseInt(e.target.value) || 1;
            if (newQuantity > 0) {
                this.updateQuantity(product, newQuantity);
            }
        }
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('عربة التسوق فارغة!', 'error');
            return;
        }
        
        // التحقق إذا المستخدم مسجل
        const token = localStorage.getItem('access_token');
        if (!token) {
            this.showNotification('الرجاء تسجيل الدخول أولاً', 'error');
            setTimeout(() => {
                window.location.href = 'pages/login.html';
            }, 1500);
            return;
        }
        
        window.location.href = 'checkout.html';
    }

    //  دالة الإشعارات الجديدة
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    //  دالة المزامنة مع الباك إند
    async syncWithBackendIfLoggedIn() {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        try {
            const response = await fetch('http://127.0.0.1:8001/api/cart/sync/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cart: this.cart })
            });
            
            if (!response.ok) {
                console.warn('فشل في مزامنة السلة مع الخادم');
            }
        } catch (error) {
            console.error('خطأ في المزامنة:', error);
        }
    }

    //  إضافة أنيميشن للإشعارات
    addNotificationStyles() {
        if (document.getElementById('cart-notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'cart-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-100%);
                    opacity: 0;
                }
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-content i {
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(style);
    }

    //  دالة للحصول على إجمالي السلة
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    //  دالة للحصول على عدد المنتجات
    getItemsCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    //  دالة للحصول على عناصر السلة
    getCartItems() {
        return [...this.cart];
    }
}

// تهيئة عربة التسوق عند تحميل الصفحة
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();
    
    //  جعل الكلوبال للاستخدام في صفحات أخرى
    window.cartManager = cartManager;
});

//  دالة مساعدة للاستخدام في صفحات المنتجات
function addToCart(product, price, image, farm) {
    if (window.cartManager) {
        cartManager.addItem(product, price, image, farm);
    } else {
        // إذا cartManager غير موجود، ننشئ سلة مؤقتة
        const tempCart = JSON.parse(localStorage.getItem('cart')) || [];
        tempCart.push({
            product: product,
            price: price,
            image: image,
            farm: farm,
            quantity: 1
        });
        localStorage.setItem('cart', JSON.stringify(tempCart));
        
        // إشعار
        const notification = document.createElement('div');
        notification.innerHTML = `${product} تمت الإضافة إلى السلة`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 9999;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

//  جعل الدالة متاحة عالمياً
window.addToCart = addToCart;
