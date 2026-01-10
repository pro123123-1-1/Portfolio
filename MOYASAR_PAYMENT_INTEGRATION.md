# 💳 تكامل نظام الدفع مع Moyasar - دليل شامل

## ✅ ما تم إنجازه

### Backend (Django REST Framework)

1. **Payment Model** - تم إنشاؤه مسبقاً
2. **Payment Endpoints:**
   - `POST /api/payments/create/` - إنشاء دفع جديد
   - `GET /api/payments/{id}/status/` - التحقق من حالة الدفع
   - `GET /api/payments/order/{order_id}/` - الحصول على دفع حسب رقم الطلب
   - `POST /api/payments/webhook/` - Webhook من Moyasar
   - `GET /api/payments/success/` - Callback للنجاح
   - `GET /api/payments/failure/` - Callback للفشل

3. **دعم طرق الدفع:**
   - ✅ Credit Card (بطاقات الائتمان)
   - ✅ Mada (مدى)
   - ✅ STC Pay
   - ✅ Apple Pay

4. **Webhook Handling:**
   - تحديث حالة الدفع تلقائياً
   - تحديث حالة الطلب عند الدفع الناجح

### Frontend (React)

1. **PaymentPage** - صفحة اختيار طريقة الدفع
   - اختيار بين Credit Card, STC Pay, Apple Pay
   - إعادة توجيه لصفحة Moyasar

2. **PaymentSuccessPage** - صفحة نجاح الدفع
   - عرض تفاصيل الدفع
   - روابط للطلبات والتسوق

3. **PaymentFailurePage** - صفحة فشل الدفع
   - عرض أسباب الفشل
   - إمكانية إعادة المحاولة

## 🔑 إعداد API Keys

### 1. إنشاء ملف `.env` في `backend/`

```env
# Moyasar Payment Gateway (Test Environment)
MOYASAR_SECRET_KEY=sk_test_YN2kdGkuEJj4JdBgBiAd5rBbmq3dQp4s4o5ozbaK
MOYASAR_PUBLISHABLE_KEY=pk_test_hvQ5Gui49kUXije7b1EhzkVHboZEaeCRqKj2Q1wR
```

### 2. تأكد من `.env` في `.gitignore`

```
.env
*.env
backend/.env
```

## 📋 سير العمل (Payment Flow)

### 1. إنشاء الطلب
```
المستخدم → السلة → إتمام الشراء → إنشاء Order
```

### 2. اختيار طريقة الدفع
```
PaymentPage → اختيار طريقة (Credit Card / STC Pay / Apple Pay)
```

### 3. إنشاء Payment
```
Frontend → POST /api/payments/create/
Backend → Moyasar API → Payment URL
```

### 4. الدفع
```
المستخدم → Moyasar Payment Page → إتمام الدفع
```

### 5. Webhook
```
Moyasar → POST /api/payments/webhook/ → تحديث Payment & Order
```

### 6. إعادة التوجيه
```
Moyasar → /payment/success أو /payment/failure
```

## 🔧 API Endpoints

### إنشاء دفع جديد

**Request:**
```http
POST /api/payments/create/
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "payment_method": "stcpay"  // creditcard, stcpay, applepay, mada
}
```

**Response:**
```json
{
  "payment": {
    "id": 1,
    "order_id": 1,
    "status": "pending",
    "amount": "150.00",
    "payment_method": "stcpay",
    "payment_url": "https://moyasar.com/payment/..."
  },
  "payment_url": "https://moyasar.com/payment/...",
  "moyasar_publishable_key": "pk_test_..."
}
```

### التحقق من حالة الدفع

**Request:**
```http
GET /api/payments/{payment_id}/status/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "payment_id": 1,
  "order_id": 1,
  "status": "paid",
  "amount": "150.00",
  "payment_method": "stcpay"
}
```

### الحصول على دفع حسب Order ID

**Request:**
```http
GET /api/payments/order/{order_id}/
Authorization: Bearer <token>
```

## 🧪 الاختبار

### Test Cards (للمعاملات التجريبية)

**بطاقة ناجحة:**
- Card Number: `4111111111111111`
- CVV: أي 3 أرقام
- Expiry: أي تاريخ مستقبلي

**بطاقة فاشلة:**
- Card Number: `4000000000000002`

### STC Pay Test

- استخدم حساب STC Pay تجريبي للاختبار

### Apple Pay Test

- يتطلب جهاز يدعم Apple Pay (iPhone, iPad, Mac)

## 📝 Webhook Configuration

### في Moyasar Dashboard:

1. اذهب إلى Settings > Webhooks
2. أضف Webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook/
   ```
3. اختر Events:
   - `payment.paid`
   - `payment.failed`
   - `payment.authorized`

### للاختبار المحلي:

استخدم ngrok أو similar:
```bash
ngrok http 8001
# استخدم الـ URL من ngrok في Moyasar Dashboard
```

## 🔄 Callback URLs

بعد الدفع، Moyasar يعيد التوجيه إلى:

- **Success:** `/payment/success?id={payment_id}`
- **Failure:** `/payment/failure?id={payment_id}`

يمكن تخصيص هذه URLs في Moyasar Dashboard.

## ⚠️ ملاحظات مهمة

1. **Environment Variables:**
   - استخدم Test Keys للتطوير
   - استخدم Production Keys للإنتاج
   - لا ترفع `.env` على GitHub

2. **Security:**
   - Webhook يجب أن يكون HTTPS في الإنتاج
   - تحقق من webhook signature (اختياري)

3. **Error Handling:**
   - جميع الأخطاء يتم معالجتها
   - رسائل خطأ واضحة للمستخدم

4. **Payment Methods:**
   - STC Pay و Apple Pay قد تحتاج إعدادات إضافية في Moyasar Dashboard
   - تحقق من توفر هذه الطرق في حسابك

## 📚 المراجع

- [Moyasar API Documentation](https://docs.moyasar.com)
- [Moyasar Payment Methods](https://docs.moyasar.com/payment-methods)
- [Moyasar Webhooks](https://docs.moyasar.com/webhooks)

## ✅ Checklist

- [x] Payment Model
- [x] Payment Endpoints
- [x] دعم STC Pay
- [x] دعم Apple Pay
- [x] Webhook Handling
- [x] صفحات النجاح/الفشل
- [x] Error Handling
- [ ] إضافة API Keys في `.env`
- [ ] تشغيل Migrations
- [ ] اختبار التدفق الكامل

## 🎉 جاهز للاستخدام!

بعد إضافة API Keys وتشغيل migrations، النظام جاهز للاستخدام!

---

**ملاحظة:** تأكد من إضافة API Keys في ملف `.env` قبل التشغيل.

