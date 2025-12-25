// بيانات المنتجات
const products = [
    {
        id: 1,
        name: "تمر سكري",
        price: 45,
        category: "dates",
        farm: "مزرعة النخيل",
        image: "https://images.unsplash.com/photo-1594736797933-d0d69e1e5d3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        rating: 4.5,
        reviews: 128
    },
    {
        id: 2,
        name: "فراولة طازجة",
        price: 40,
        category: "fruits",
        farm: "مزرعة الفواكه",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        rating: 4.2,
        reviews: 95
    },
    {
        id: 3,
        name: "طماطم عضوية",
        price: 15,
        category: "vegetables",
        farm: "مزارع الوادي",
        image: "https://images.unsplash.com/photo-1546470427-e212b7d310a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        rating: 4.8,
        reviews: 210
    },
    {
        id: 4,
        name: "حليب طازج",
        price: 12,
        category: "dairy",
        farm: "مزرعة الألبان",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        rating: 4.6,
        reviews: 167
    },
    {
        id: 5,
        name: "تمر خلاص",
        price: 60,
        category: "dates",
        farm: "مزرعة النخيل",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        rating: 4.9,
        reviews: 89
    },
    {
        id: 6,
        name: "عنب أحمر",
        price: 35,
        category: "fruits",
        farm: "مزرعة الفواكه",
        image: "https://images.unsplash.com/photo-1591206369813-3e02ad795e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        rating: 4.3,
        reviews: 76
    }
];

// عرض المنتجات
function displayProducts(productsToShow = products) {
    const productsGrid = document.querySelector('.products-grid');
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">لا توجد منتجات تطابق معايير البحث</p>';
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image" style="background-image: url('${product.image}')"></div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">${product.price} ريال / كجم</div>
                <div class="product-farm">${product.farm}</div>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.reviews})</span>
                </div>
                <button class="btn-primary add-to-cart" 
                        data-product="${product.name}" 
                        data-price="${product.price}">
                    أضف إلى السلة
                </button>
            </div>
        </div>
    `).join('');
}

// توليد النجوم للتقييم
function generateStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars.push('<i class="fas fa-star"></i>');
    }
    
    if (hasHalfStar) {
        stars.push('<i class="fas fa-star-half-alt"></i>');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
        stars.push('<i class="far fa-star"></i>');
    }
    
    return stars.join('');
}

// تصفية المنتجات
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    let filteredProducts = products;
    
    // تصفية حسب التصنيف
    if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    // تصفية حسب السعر
    if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-').map(Number);
        filteredProducts = filteredProducts.filter(product => product.price >= min && product.price <= max);
    }
    
    displayProducts(filteredProducts);
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    
    // إضافة أحداث للمرشحات
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('priceFilter').addEventListener('change', filterProducts);
});