// CartManager للـ React - مدمج من cart.js
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.listeners = [];
    }

    // إضافة مستمع للتغييرات
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // إشعار جميع المستمعين
    notify() {
        this.listeners.forEach(listener => listener(this.cart));
    }

    // إضافة منتج للسلة
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
        this.notify();
        return true;
    }

    // تحديث الكمية
    updateQuantity(product, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(product);
            return;
        }

        const item = this.cart.find(item => item.product === product);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.notify();
        }
    }

    // إزالة منتج
    removeItem(product) {
        this.cart = this.cart.filter(item => item.product !== product);
        this.saveCart();
        this.notify();
    }

    // حفظ السلة
    async saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));

            // مزامنة مع الباك إند إذا المستخدم مسجل
            await this.syncWithBackendIfLoggedIn();

        } catch (e) {
            console.error('خطأ في حفظ السلة:', e);
            throw new Error('عذراً، لا يمكن إضافة المزيد من المنتجات');
        }
    }

    // تفريغ السلة
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.notify();
    }

    // الحصول على إجمالي السلة
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // الحصول على عدد المنتجات
    getItemsCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // الحصول على عناصر السلة
    getCartItems() {
        return [...this.cart];
    }

    // مزامنة مع الباك إند
    async syncWithBackendIfLoggedIn() {
        // Backend cart endpoint does not exist yet. 
        // Sync disabled to prevent 404 errors.
        return;
    }

    // تحميل السلة من الباك إند
    async loadFromBackend() {
        // Backend cart endpoint does not exist yet.
        return;
    }
}

// إنشاء instance واحد مشترك
const cartManager = new CartManager();

export default cartManager;

