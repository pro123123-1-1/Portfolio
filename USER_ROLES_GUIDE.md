# دليل الأدوار - User Roles Guide

## الأدوار المتاحة (3 أنواع)

### 1. Admin (المدير) 👨‍💼
- **كيفية الحصول عليه**: يتم إنشاؤه من Django Admin أو `createsuperuser`
- **الصلاحيات**:
  - ✅ الوصول الكامل لـ Django Admin
  - ✅ إدارة جميع المستخدمين
  - ✅ إدارة جميع المزارع والمنتجات
  - ✅ يمكنه أن يكون مزارع ومستهلك أيضاً
  - ✅ يمكنه التصفح والشراء

**إنشاء Admin:**
```bash
python manage.py createsuperuser
```

### 2. Farmer (المزارع) 👨‍🌾
- **كيفية التسجيل**: `is_farmer: true` عند التسجيل
- **الصلاحيات**:
  - ✅ إنشاء وإدارة مزرعته
  - ✅ إضافة/تعديل/حذف منتجاته
  - ✅ رؤية طلبات مزرعته
  - ✅ **يمكنه التصفح والشراء كـ Consumer** (مثل YouTube)
  - ✅ يمكنه الشراء من مزارعين آخرين

**مثال تسجيل مزارع:**
```json
POST /api/auth/register/
{
  "username": "farmer1",
  "email": "farmer@example.com",
  "password": "password123",
  "password2": "password123",
  "is_farmer": true,
  "is_consumer": true  // مهم: حتى يتمكن من الشراء
}
```

### 3. Consumer (المستهلك) 🛒
- **كيفية التسجيل**: `is_consumer: true` (افتراضي)
- **الصلاحيات**:
  - ✅ التصفح والبحث عن المنتجات
  - ✅ وضع الطلبات
  - ✅ رؤية طلباته فقط
  - ✅ لا يمكنه إنشاء مزرعة

**مثال تسجيل مستهلك:**
```json
POST /api/auth/register/
{
  "username": "consumer1",
  "email": "consumer@example.com",
  "password": "password123",
  "password2": "password123",
  "is_consumer": true  // افتراضي
}
```

## السيناريوهات المهمة

### السيناريو 1: المزارع يشتري من مزارع آخر 🎯
```javascript
// المزارع يسجل دخول
const loginResponse = await login('farmer@example.com', 'password');
// role: "farmer_consumer"

// المزارع يتصفح المنتجات (كـ consumer)
const products = await fetch('/api/products/');

// المزارع يضع طلب (كـ consumer)
const order = await createOrder({
  farm: 2,  // مزرعة أخرى
  items: [...]
});
```

### السيناريو 2: المزارع يدير مزرعته
```javascript
// المزارع ينشئ مزرعته
const farm = await createFarm({
  name: "مزرعة الألبان",
  location: "الرياض",
  daily_capacity: 50
});

// المزارع يضيف منتجات
const product = await createProduct({
  name: "حليب طازج",
  price: 15.50,
  stock_quantity: 100
});

// المزارع يرى طلبات مزرعته
const farmOrders = await fetch('/api/orders/');
// سيرى: طلباته الشخصية + طلبات مزرعته
```

### السيناريو 3: Admin يدير النظام
```javascript
// Admin يمكنه:
// 1. الوصول لـ Django Admin: /admin/
// 2. إدارة جميع المستخدمين
// 3. إدارة جميع المزارع
// 4. يمكنه أيضاً أن يكون مزارع ومستهلك
```

## Response Structure

### عند تسجيل الدخول:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "farmer1",
    "email": "farmer@example.com",
    "is_farmer": true,
    "is_consumer": true,
    "is_staff": false,
    "is_superuser": false,
    "role": "farmer_consumer",  // ⭐ مهم
    "is_admin": false
  },
  "role": "farmer_consumer",  // ⭐ للاستخدام السريع
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

### قيم الـ Role الممكنة:
- `"consumer"` - مستهلك فقط
- `"farmer"` - مزارع فقط (نادر)
- `"farmer_consumer"` - مزارع + مستهلك (الأفضل!)
- `"admin"` - مدير فقط
- `"admin_farmer"` - مدير + مزارع
- `"admin_consumer"` - مدير + مستهلك
- `"admin_farmer_consumer"` - مدير + مزارع + مستهلك

## Frontend Logic

### التحقق من الدور:
```javascript
// بعد تسجيل الدخول
const user = loginResponse.user;

if (user.is_admin) {
  // عرض لوحة Admin
  showAdminPanel();
}

if (user.is_farmer) {
  // عرض لوحة المزارع
  showFarmerDashboard();
  
  // ⭐ المهم: المزارع يمكنه أيضاً الشراء!
  if (user.is_consumer) {
    showShoppingCart();  // يمكنه الشراء
  }
}

if (user.is_consumer) {
  // عرض المتجر
  showStore();
  showShoppingCart();
}
```

### مثال كامل:
```javascript
function handleLogin(user) {
  // Admin
  if (user.is_admin) {
    window.location.href = '/admin-dashboard';
    return;
  }
  
  // Farmer
  if (user.is_farmer) {
    // عرض لوحة المزارع
    showFarmerDashboard();
    
    // ⭐ المزارع يمكنه الشراء أيضاً!
    if (user.is_consumer) {
      showStoreButton();  // زر للذهاب للمتجر
      showShoppingCart(); // سلة التسوق
    }
  }
  
  // Consumer (أو مزارع يريد الشراء)
  if (user.is_consumer) {
    showStore();
    showShoppingCart();
  }
}
```

## ملاحظات مهمة ⚠️

1. **المزارع يجب أن يكون `is_consumer: true` للشراء**
   ```json
   {
     "is_farmer": true,
     "is_consumer": true  // ⭐ مهم!
   }
   ```

2. **Admin يتم إنشاؤه من Django Admin فقط**
   - لا يمكن التسجيل كـ Admin من API
   - يجب استخدام `createsuperuser`

3. **المزارع يمكنه الشراء والتصفح**
   - مثل YouTube: يمكنك أن تكون Creator و Consumer في نفس الوقت
   - المزارع يدخل كمزارع عادي
   - يمكنه التصفح والشراء كـ consumer

4. **الصلاحيات في API:**
   - المزارعون فقط: إنشاء/تعديل مزارعهم
   - المزارعون فقط: إدارة منتجاتهم
   - جميع المستخدمين (بما في ذلك المزارعون): التصفح والشراء
   - Admin: صلاحيات كاملة من Django Admin

## الخلاصة ✅

- ✅ **3 أدوار**: Admin, Farmer, Consumer
- ✅ **المزارع يمكنه الشراء**: مثل YouTube
- ✅ **مرن وآمن**: JWT Authentication
- ✅ **جاهز للاستخدام**: Frontend يمكنه الربط مباشرة

