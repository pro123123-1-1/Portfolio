# دليل نظام المصادقة - Authentication Guide

## نظرة عامة

تم إعداد نظام مصادقة مشابه لـ YouTube باستخدام JWT (JSON Web Tokens). النظام يدعم:
- ✅ تسجيل الدخول بالبريد الإلكتروني أو اسم المستخدم
- ✅ دعم الأدوار المتعددة: المزارع يمكنه أن يكون مستهلك أيضاً
- ✅ JWT Tokens للوصول الآمن
- ✅ تحديث تلقائي للـ tokens

## المميزات الرئيسية

### 1. الأدوار المتعددة (Multi-Role Support)
- **المستهلك (Consumer)**: يمكنه التصفح والشراء (افتراضي)
- **المزارع (Farmer)**: يمكنه إدارة مزرعته ومنتجاته
- **المزارع + المستهلك**: المزارع يمكنه أيضاً التصفح والشراء مثل أي مستهلك

### 2. نظام المصادقة
- استخدام JWT Tokens (مثل YouTube)
- Access Token صالح لمدة ساعة
- Refresh Token صالح لمدة 7 أيام
- تحديث تلقائي للـ tokens

## API Endpoints

### 1. التسجيل (Register)
```
POST /api/auth/register/
```

**Request Body:**
```json
{
  "username": "farmer1",
  "email": "farmer@example.com",
  "password": "securepassword123",
  "password2": "securepassword123",
  "first_name": "أحمد",
  "last_name": "محمد",
  "phone_number": "0501234567",
  "is_farmer": true,
  "is_consumer": true
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "farmer1",
    "email": "farmer@example.com",
    "first_name": "أحمد",
    "last_name": "محمد",
    "is_farmer": true,
    "is_consumer": true
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. تسجيل الدخول (Login)
```
POST /api/auth/login/
```

**Request Body (بالبريد الإلكتروني):**
```json
{
  "email": "farmer@example.com",
  "password": "securepassword123"
}
```

**أو (باسم المستخدم):**
```json
{
  "username": "farmer1",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "farmer1",
    "email": "farmer@example.com",
    "is_farmer": true,
    "is_consumer": true
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 3. الحصول على الملف الشخصي (Profile)
```
GET /api/auth/profile/
Headers: Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "farmer1",
  "email": "farmer@example.com",
  "first_name": "أحمد",
  "last_name": "محمد",
  "is_farmer": true,
  "is_consumer": true
}
```

### 4. تحديث الملف الشخصي
```
PUT /api/auth/profile/
Headers: Authorization: Bearer <access_token>
```

### 5. التحقق من Token
```
GET /api/auth/verify/
Headers: Authorization: Bearer <access_token>
```

### 6. تحديث Access Token
```
POST /api/auth/token/refresh/
Body: { "refresh": "<refresh_token>" }
```

## استخدام الـ Tokens في Frontend

### حفظ الـ Tokens
```javascript
// بعد تسجيل الدخول أو التسجيل
localStorage.setItem('access_token', response.data.tokens.access);
localStorage.setItem('refresh_token', response.data.tokens.refresh);
```

### إرسال الـ Token مع الطلبات
```javascript
const token = localStorage.getItem('access_token');
fetch('http://localhost:8000/api/auth/profile/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### تحديث الـ Token تلقائياً
```javascript
async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
}
```

## سيناريوهات الاستخدام

### السيناريو 1: مزارع يريد إدارة مزرعته
1. يسجل كـ `is_farmer: true`
2. بعد تسجيل الدخول، ينشئ مزرعة: `POST /api/farms/`
3. يضيف منتجات: `POST /api/products/`
4. يمكنه أيضاً التصفح والشراء كـ consumer

### السيناريو 2: مستهلك عادي
1. يسجل كـ `is_consumer: true` (افتراضي)
2. يتصفح المنتجات: `GET /api/products/`
3. يضع طلبات: `POST /api/orders/`

### السيناريو 3: مزارع يشتري من مزارع آخر
1. المزارع لديه `is_farmer: true` و `is_consumer: true`
2. يتصفح منتجات المزارعين الآخرين
3. يضع طلب كـ consumer عادي
4. يمكنه إدارة مزرعته في نفس الوقت

## الأمان والصلاحيات

- ✅ جميع المستخدمين يمكنهم التصفح (قراءة فقط)
- ✅ المستخدمون المسجلون فقط يمكنهم الشراء
- ✅ المزارعون فقط يمكنهم إنشاء/تعديل مزارعهم
- ✅ مالك المزرعة فقط يمكنه إدارة منتجاته
- ✅ المستخدمون يرون طلباتهم فقط
- ✅ المزارعون يرون طلباتهم + طلبات مزارعهم

## الخطوات التالية

1. **تثبيت المكتبات:**
   ```bash
   pip install -r requirements.txt
   ```

2. **إنشاء Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **إنشاء Superuser (اختياري):**
   ```bash
   python manage.py createsuperuser
   ```

4. **تشغيل السيرفر:**
   ```bash
   python manage.py runserver
   ```

## ملاحظات مهمة

- ⚠️ تأكد من تحديث `.env` ببيانات قاعدة البيانات
- ⚠️ في الإنتاج، غيّر `SECRET_KEY` في `.env`
- ⚠️ تأكد من إعداد CORS بشكل صحيح للـ frontend
- ✅ النظام يدعم المزارعين الذين يريدون الشراء أيضاً
- ✅ لا حاجة لتغيير الكود الموجود، فقط أضف الـ migrations

