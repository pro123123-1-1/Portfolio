# دليل البدء السريع - Quick Start Guide

## ✅ النظام جاهز! 

تم إعداد نظام المصادقة بالكامل مع دعم **3 أدوار**:

### 1. Admin (المدير) 👨‍💼
- يتم إنشاؤه من Django Admin
- صلاحيات كاملة

### 2. Farmer (المزارع) 👨‍🌾
- يمكنه إدارة مزرعته ومنتجاته
- **يمكنه التصفح والشراء كـ Consumer** (مثل YouTube) ⭐

### 3. Consumer (المستهلك) 🛒
- يمكنه التصفح والشراء فقط

## 🚀 الخطوات السريعة

### 1. تثبيت المكتبات
```bash
cd Portfolio/backend
pip install -r ../requirements.txt
```

### 2. إنشاء Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. إنشاء Admin (اختياري)
```bash
python manage.py createsuperuser
```

### 4. تشغيل السيرفر
```bash
python manage.py runserver
```

## 📝 أمثلة الاستخدام

### تسجيل مزارع (يمكنه الشراء أيضاً):
```bash
POST http://localhost:8000/api/auth/register/
{
  "username": "farmer1",
  "email": "farmer@example.com",
  "password": "password123",
  "password2": "password123",
  "is_farmer": true,
  "is_consumer": true  // ⭐ مهم للشراء
}
```

### تسجيل مستهلك:
```bash
POST http://localhost:8000/api/auth/register/
{
  "username": "consumer1",
  "email": "consumer@example.com",
  "password": "password123",
  "password2": "password123",
  "is_consumer": true  // افتراضي
}
```

### تسجيل الدخول:
```bash
POST http://localhost:8000/api/auth/login/
{
  "email": "farmer@example.com",
  "password": "password123"
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
    "is_consumer": true,
    "role": "farmer_consumer",  // ⭐ الدور
    "is_admin": false
  },
  "role": "farmer_consumer",
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

## 🎯 المميزات الرئيسية

✅ **3 أدوار**: Admin, Farmer, Consumer  
✅ **المزارع يمكنه الشراء**: مثل YouTube  
✅ **JWT Authentication**: آمن ومشابه لـ YouTube  
✅ **مرن**: يدعم الأدوار المتعددة  
✅ **جاهز للربط**: Frontend يمكنه الربط مباشرة  

## 📚 الملفات التوثيقية

- `AUTHENTICATION_GUIDE.md` - دليل المصادقة الكامل
- `USER_ROLES_GUIDE.md` - دليل الأدوار التفصيلي
- `AUTHENTICATION_SUMMARY_AR.md` - ملخص بالعربية

## ⚠️ ملاحظات مهمة

1. **المزارع يجب أن يكون `is_consumer: true` للشراء**
2. **Admin يتم إنشاؤه من Django Admin فقط**
3. **المزارع يدخل كمزارع عادي ويمكنه الشراء كـ consumer**
4. **كل شيء جاهز - فقط تحتاج migrations**

## 🎉 الخلاصة

النظام **مضبوط تماماً**! المزارعون يمكنهم:
- ✅ إدارة مزارعهم
- ✅ التصفح والشراء كـ consumers
- ✅ رؤية طلباتهم وطلبات مزارعهم

**جاهز للربط مع Frontend!** 🚀

