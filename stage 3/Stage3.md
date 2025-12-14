# Portfolio Project – Technical Documentation (Stage 3)

## Dairy Direct – Connecting Farms Directly with Consumers



Backend: **Django REST Framework**  

Database: **PostgreSQL**  

Frontend: **Web (HTML, CSS, JavaScript / React optional)**



---



# 0. User Stories and Mockups



## Must Have

- As a consumer, I want to register/login so that I can place orders.

- As a farm owner, I want to register/login so that I can manage my products.

- As a farm owner, I want to add products so inventory stays accurate.

- As a farm owner, I want to delete products so inventory stays accurate.

- As a farm owner, I want to set daily capacity so I avoid accepting too many orders.

- As a consumer, I want to browse available products and farms so that I can choose the best option to buy from.

- As a consumer, I want to place orders so that I can purchase products directly from farms.

- As a farm owner, I want to update order status so that customers know when their order is being prepared or completed.

- As a consumer, I want to track my orders so that I know the progress and delivery status.

- As the system, I must prevent ordering out-of-stock items so that incorrect orders are not processed.



## Should Have

- As a consumer, I want to see my order history.

- As a farm owner, I want to view analytics about sales.



## Could Have

- As a farm owner, I want to export data reports.

- As a consumer, I want to add favorite products.



## Won't Have

- AI recommendations  

- Real-time delivery tracking  

- Mobile app version  

- Automated logistics  



---



## Mockups

Mockups were designed using **Figma** and include:

- Login / Signup Page

- Product Listing Page

- Farm Dashboard

- Checkout Page

- Order History



---



# 1. System Architecture



## High-Level Components

- **Frontend**: Web application (HTML / CSS / JavaScript / React).

- **Backend**: Python + Django REST Framework (DRF).

- **Database**: PostgreSQL relational database.

- **External API**: Moyasar payment gateway.



## Data Flow

Farm Owner / Consumer → Frontend → Django REST API → PostgreSQL → Response → User  

Django API ↔ External Payment API



## Architecture Diagram (Text)


- **Clients**:  
  - Consumer web browser  
  - Farm owner web browser  

- **Frontend Web App**:  
  - Renders pages (login, signup, product listing, farm dashboard, checkout, order history).  
  - Communicates with backend via JSON over HTTPS.  

- **Django REST API**:  
  - Handles authentication, authorization, business rules, and validation.  
  - Exposes REST endpoints for users, farms, products, orders, capacities, and payments.  

- **PostgreSQL Database**:  
  - Stores normalized relational data for users, farms, products, inventory, orders, and payments.  

- **Moyasar Payment Gateway**:  
  - Used for secure payment processing and capturing payment status.  

---

# 2. Components, Classes, and Database Design

## Backend Components (Django)

- **core app** (existing):  
  - **Models**: `Farm`, `Product`, `Quantity`, `Order`, `OrderItem`, `Payment`, `Favorite`.  
  - **Serializers**: Map models to JSON (e.g., `ProductSerializer`, `OrderSerializer`).  
  - **Views / ViewSets**: Provide REST endpoints using DRF viewsets.  
  - **Permissions**: Custom permissions to distinguish farm owners vs consumers.  

- **Authentication & Authorization**:  
  - Use Django’s built-in `User` model with groups/roles (`FARM_OWNER`, `CONSUMER`).  
  - Token or JWT-based authentication for API calls (depending on project constraints).  

### Key Django Models – Attributes and Core Methods

> **Class Diagram**: See `class-diagram.mmd` for a visual UML class diagram showing all Django models, their attributes, methods, and relationships.

- **Farm**  
  - **Attributes**: `owner`(ForeignKey → User), `name`(String), `location`(String), `description`(Text), `created_at`(DateTime).  
  - **Core methods** (examples):  
    - `__str__()` – returns farm name.  
    - Helper queries like `get_active_products()`.  

- **Product**  
  - **Attributes**: `farm`(ForeignKey → Farm), `name`(String), `description`(Text), `price`(Decimal / Float), `unit`(String), `is_active`(Boolean).  
  - **Core methods**:  
    - `__str__()` – returns product name.  
    - `is_available_for_date(date)` – checks capacity for a given day (via `Quantity`).  

- **Quantity**  
  - **Attributes**: `product`(ForeignKey → Product), `date`(Date), `max_quantity`(Integer), `reserved_quantity`(Integer).  
  - **Core methods**:  
    - `available_quantity()` – returns `max_quantity - reserved_quantity`.  
    - `reserve(qty)` – increments `reserved_quantity` with validation (cannot exceed `max_quantity`).  

- **Order**  
  - **Attributes**: `consumer`(ForeignKey → User), `farm`(ForeignKey → Farm), `status`(String), `total_amount`(Decimal), `created_at`(DateTime), `updated_at`(DateTime).  
  - **Core methods**:  
    - `calculate_total()` – sums `OrderItem.quantity * unit_price`.  
    - `can_update_status(new_status)` – enforces valid status transitions.  
    - `mark_paid()` – sets status to `CONFIRMED` and may trigger capacity updates / notifications.  

- **OrderItem**  
  - **Attributes**: `order`(ForeignKey → Order), `product`(ForeignKey → Product), `quantity`(Integer), `unit_price`(Decimal).  
  - **Core methods**:  
    - `line_total()` – returns `quantity * unit_price`.  

- **Payment**  
  - **Attributes**: `order`(ForeignKey → Order), `provider`(String), `provider_payment_id`(String), `status`(String), `amount`(Decimal), `created_at`(DateTime).  
  - **Core methods**:  
    - `mark_success()` / `mark_failed()` – update status and related `Order` status.  
    - `is_completed()` – convenience method to check if payment is final.  


## Database Entities (Relational Schema – Simplified)

- **User** (Django `auth_user`)  
  - `id`, `username`, `email`, `password_hash`, `is_active`, `date_joined`  
  - Role handled via `Group` or a `profile.role` field.  

- **Farm**  
  - `id` (PK)  
  - `owner` (FK → User)  
  - `name`  
  - `location`  
  - `description`  
  - `created_at`  

- **Product**  
  - `id` (PK)  
  - `farm` (FK → Farm)  
  - `name`  
  - `description`  
  - `price`  
  - `unit` (e.g., liter, kg)  
  - `is_active`  

- **Quantity**  
  - `id` (PK)  
  - `product` (FK → Product)  
  - `date`  
  - `max_quantity`  
  - `reserved_quantity` (updated as orders are placed)  

- **Order**  
  - `id` (PK)  
  - `consumer` (FK → User)  
  - `farm` (FK → Farm)  
  - `status` (`PENDING`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`)  
  - `total_amount`  
  - `created_at`  
  - `updated_at`  

- **OrderItem**  
  - `id` (PK)  
  - `order` (FK → Order)  
  - `product` (FK → Product)  
  - `quantity`  
  - `unit_price`  

- **Payment**  
  - `id` (PK)  
  - `order` (FK → Order)  
  - `provider` (e.g., `moyasar`)  
  - `provider_payment_id`  
  - `status` (`INITIATED`, `PAID`, `FAILED`, `REFUNDED`)  
  - `amount`  
  - `created_at`  

- **Favorite** (optional – “Could Have”)  
  - `id` (PK)  
  - `consumer` (FK → User)  
  - `product` (FK → Product)  

This schema:  
- Enforces referential integrity between farms, products, orders, and users.  
- Enables capacity checks via the `Quantity` table to prevent overbooking.  

> See also `er-diagram.mmd` for a Mermaid ER diagram showing these tables, attributes, and relationships visually.

## Frontend Components (UI)

- **Auth Pages**  
  - `LoginPage` – form for username/email + password; calls `/api/auth/login/`.  
  - `RegisterPage` – registration form with role selection (consumer / farm owner); calls `/api/auth/register/`.  

- **Consumer-Facing UI**  
  - `HomePage` / `FarmListPage` – lists farms with basic info; integrates with `GET /api/farms/`.  
  - `ProductListPage` – shows products for a selected farm; uses `GET /api/products/?farm={id}`.  
  - `CartComponent` – holds selected products and quantities in client state.  
  - `CheckoutPage` – summarizes cart, collects delivery details if needed, and posts to `/api/orders/`.  
  - `OrderHistoryPage` – lists consumer orders; uses `GET /api/orders/?mine=true`.  
  - `OrderDetailPage` – shows status timeline and items; uses `GET /api/orders/{id}/`.  

- **Farm Owner Dashboard**  
  - `FarmDashboardPage` – overview of farm stats and recent orders (`GET /api/farms/mine/`, `GET /api/orders/?farm={id}`).  
  - `ProductManagementPage` – table of products with create/edit/delete actions using `/api/products/`.  
  - `CapacityManagementPage` – UI to set daily capacity per product and date; calls `/api/capacities/`.  
  - `OrderManagementPage` – allows updating order status via `PATCH /api/orders/{id}/status/`.  

- **Shared Components**  
  - `Navbar` – shows links based on role and auth state.  
  - `ProtectedRoute` – wrapper to ensure only authenticated users (and correct roles) access certain pages.  
  - `Notification/Alert` – displays success/error messages for API interactions.  

These components are intentionally high-level: implementation can be plain HTML/CSS/JS or React, but the **responsibilities and interactions** remain the same.

---

# 3. High-Level Sequence Diagrams (Text)

## 3.1 Consumer Places an Order

1. **Consumer** selects products and quantities on the frontend.  
2. **Frontend** sends `POST /api/orders/` with cart details and selected farm.  
3. **Django API**:  
   - Authenticates consumer.  
   - Validates that each product belongs to the specified farm.  
   - Checks `Quantity` for each product/date to ensure requested quantity + reserved ≤ max.  
   - If valid, creates `Order` and `OrderItem` records with `status = PENDING`.  
4. **Django API** calls Moyasar to initiate payment, creates a `Payment` record with `status = INITIATED`.  
5. **Moyasar** returns a payment URL/token.  
6. **Frontend** redirects the consumer to the payment page or uses an embedded payment widget.  
7. **Moyasar** processes payment and calls the backend webhook (e.g., `POST /api/payments/webhook/`).  
8. **Django API** verifies the signature, updates `Payment.status` and `Order.status` to `CONFIRMED` (if successful).  
9. **Frontend** fetches updated order details from `GET /api/orders/{id}/` and shows confirmation.  

## 3.2 Farm Owner Manages Products

1. **Farm Owner** logs in and opens the dashboard.  
2. **Frontend** calls `GET /api/farms/mine/` and `GET /api/products/?farm=<id>`.  
3. **API** authenticates and returns only products belonging to that owner’s farm(s).  
4. When the owner creates/edits/deletes a product, the frontend sends `POST`/`PATCH`/`DELETE` to `/api/products/`.  
5. **API** validates ownership and applies the change.  

## 3.3 Consumer Tracks an Order

1. **Consumer** opens “My Orders”.  
2. **Frontend** requests `GET /api/orders/?mine=true`.  
3. **API** filters orders by the authenticated consumer and returns a list with statuses.  
4. Consumer selects an order; frontend calls `GET /api/orders/{id}/` for details and timeline.  

---

> See also `sequence-diagrams.mmd` for visual Mermaid sequence diagrams of these flows.

# 4. API Specifications

## 4.1 External API – Moyasar

Base URL: `https://api.moyasar.com/v1/`

- **Authentication**:  
  - Uses API key authentication via `Authorization` header: `Bearer {api_key}`  
  - API keys are stored securely in Django environment variables.  

- **Payments**
  - `POST https://api.moyasar.com/v1/payments/` – Create payment session (server-side call from Django).  
    - **Input**:  
      ```json
      {
        "amount": 12000,
        "currency": "SAR",
        "description": "Order #123 - Farm Products",
        "callback_url": "https://yourdomain.com/api/payments/webhook/",
        "metadata": {
          "order_id": 123,
          "farm_id": 1
        }
      }
      ```  
    - **Output**:  
      ```json
      {
        "id": "payment_abc123",
        "status": "initiated",
        "amount": 12000,
        "currency": "SAR",
        "description": "Order #123 - Farm Products",
        "invoice_id": null,
        "ip": null,
        "callback_url": "https://yourdomain.com/api/payments/webhook/",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "metadata": {
          "order_id": 123,
          "farm_id": 1
        },
        "source": {
          "type": "creditcard",
          "company": "visa",
          "name": "John Doe",
          "number": "4111111111111111",
          "gateway_id": "gw_xyz789",
          "reference_number": "ref_456",
          "token": "token_abc123",
          "message": null,
          "transaction_url": "https://moyasar.com/payment/abc123"
        }
      }
      ```  
  - `GET https://api.moyasar.com/v1/payments/{payment_id}/` – Retrieve payment details.  
    - **Output**: Payment object with current status and details.  

- **Webhooks**
  - Moyasar sends payment status updates to Django webhook endpoint: `POST /api/payments/webhook/`  
    - **Input** (from Moyasar):  
      ```json
      {
        "id": "payment_abc123",
        "status": "paid",
        "amount": 12000,
        "currency": "SAR",
        "description": "Order #123 - Farm Products",
        "metadata": {
          "order_id": 123,
          "farm_id": 1
        },
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:35:00Z"
      }
      ```  
    - **Security**: Django verifies webhook signature using Moyasar secret key to ensure authenticity.  
    - **Processing**: Django updates `Payment.status` and `Order.status` based on webhook payload.  

## 4.2 Internal REST API (Examples)

Base URL: `/api/`

- **Auth**
  - `POST /api/auth/register/`  
    - **Input**: `{ username, email, password, role }`  
    - **Output**: `{ id, username, email, role, token }`  
  - `POST /api/auth/login/`  
    - **Input**: `{ username_or_email, password }`  
    - **Output**: `{ token, user: { id, username, role } }`  

- **Farms**
  - `GET /api/farms/` – List farms (public).  
  - `GET /api/farms/{id}/` – Farm details.  
  - `GET /api/farms/mine/` – List farms owned by the authenticated farm owner.  

- **Products**
  - `GET /api/products/?farm={farm_id}` – List products for a farm.  
  - `POST /api/products/` (farm owner only) – Create product.  
  - `PATCH /api/products/{id}/` (owner only) – Update product.  
  - `DELETE /api/products/{id}/` (owner only) – Soft delete or deactivate.  

- **Capacity**
  - `GET /api/capacities/?product={product_id}&date={YYYY-MM-DD}`  
  - `POST /api/capacities/` (owner only) – Set or update daily capacity.  

- **Orders**
  - `GET /api/orders/?mine=true` – List orders for authenticated consumer.  
  - `GET /api/orders/?farm={farm_id}` – List orders for a farm owner’s farm.  
  - `POST /api/orders/`  
    - **Input**:  
      ```json
      {
        "farm_id": 1,
        "items": [
          { "product_id": 10, "quantity": 2 },
          { "product_id": 15, "quantity": 1 }
        ]
      }
      ```  
    - **Output**:  
      ```json
      {
        "id": 123,
        "status": "PENDING",
        "total_amount": 120.00,
        "payment_id": 456,
        "payment_url": "https://..."
      }
      ```  
  - `PATCH /api/orders/{id}/status/` (farm owner only)  
    - **Input**: `{ "status": "PREPARING" }`  
    - **Output**: updated order summary.  

- **Payments**
  - `POST /api/payments/webhook/` – Receives events from Moyasar.  
  - `GET /api/payments/{id}/` – Payment details (for order owner or farm owner).  

---

# 5. Source Control Management (SCM) Plan

- **Repository**: Git (GitHub).  
- **Branching Strategy**:  
  - `main`: always deployable; contains stable MVP.  
  - Feature branches: `feature/auth`, `feature/orders`, `feature/payments`, etc.  
  - Use pull requests for merging into `main`, with at least one review (if team).  
- **Commit Practices**:  
  - Small, focused commits with descriptive messages (`Add order model and serializer`).  
  - Avoid committing secrets; use environment variables for API keys.  
- **Release Tags**:  
  - Tag MVP-ready versions as `v1.0.0-mvp`, etc.  

---

# 6. Quality Assurance (QA) Strategy

- **Automated Tests** (Django + DRF):  
  - **Unit tests** for models (capacity checks, order totals).  
  - **API tests** for key endpoints (auth, orders, payments, capacities).  
  - Use Django’s `TestCase` and DRF’s API test client.  

- **Manual Testing**:  
  - User flows: register → login → browse products → place order → pay → track order.  
  - Farm flows: register → create farm → add products → set capacity → update order status.  

- **Validation and Error Handling**:  
  - Clear error messages for insufficient capacity, invalid payment, or unauthorized access.  
  - Input validation in serializers and model constraints.  

- **Performance & Reliability (for MVP level)**:  
  - Basic pagination for product and order lists.  
  - Indexes on common query fields (e.g., `farm_id`, `product_id`, `created_at`).  

---

# 7. Technical Justifications

- **Django REST Framework + PostgreSQL**:  
  - Strong ecosystem, rapid development, and excellent support for REST APIs.  
  - PostgreSQL provides robust relational features, transactions, and constraints needed for financial and inventory data.  

- **Separation of Roles (Farm Owner vs Consumer)**:  
  - Aligns with user stories and enforces clear authorization boundaries for security.  

- **Quantity Table**:  
  - Directly supports the requirement *“As a farm owner, I want to set daily capacity so I avoid accepting too many orders”* and  
    *“As the system, I must prevent ordering out-of-stock items.”*  

- **External Payment Gateway (Moyasar)**:  
  - Offloads PCI and security complexity to a specialized provider.  
  - Meets non-functional requirements for secure, reliable payment processing.  

- **RESTful API Design**:  
  - Enables future expansion (e.g., mobile app) without changing backend logic.  

- **SCM and QA Practices**:  
  - Reduce regression risk, enable safe collaboration, and ensure that the MVP remains stable as features evolve.  

Overall, these choices balance **fast MVP delivery** with **scalability and maintainability**, matching the functional goals (ordering, capacity management, tracking) and non-functional needs (security, data integrity, extensibility).
