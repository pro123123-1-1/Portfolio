
## Stage 2 – Project Charter

### 0) Project Objectives

**Purpose**  
Build a simple web platform that connects a local farm with consumers, helps the farm organize daily products and orders, and reduces waste.

**SMART Objectives**

- Deliver a working MVP for one sample farm by the end of the semester, including:
  - farm account,
  - product management,
  - receiving orders from users.
- Provide a farm dashboard with three clear metrics:
  - total orders,
  - top-selling products,
  - daily capacity usage.
- Support a full demo flow for three test users:
  - sign up → browse products → place order → update order status.

---

### 1) Stakeholders and Team Roles

**Stakeholders**

- **Internal**
  - Project team members
  - Instructors / mentors
- **External (potential)**
  - Local farm owners
  - End consumers

**Team Roles**

- **Project Coordinator / PM**  
  Organizes meetings, splits tasks, and tracks time and progress.     **Abdullah**  

- **Backend Developer**  and **QA** 
  Designs the database and APIs, and implements product and order logic.      **Raghad**     **Abdullah**  

- **Frontend Developer**  and **QA** 
  Builds the farm dashboard and consumer shop, and connects them to the APIs.      **Haifa**    **Najwa**

- **Data & Documentation Owner**  
  Prepares simple sample data and keeps project documents and reports up to date.         **Najwa**

---

### 2) Project Scope

**In-Scope (MVP)**

- One web application with two roles: **Farm** and **Consumer**.
- Simple sign-up and login for farms and users.
- Real payment gateway integration (cards, Apple Pay, STC Pay,Moyasar etc.).
- **Farm side:**
  - Create an account and log in.
  - Manage products (add / edit / delete) with price and quantity.
  - Set daily capacity or available amount for orders.
  - View orders and change their status (e.g. in progress, completed).
  - See a basic analytics section (total orders, top products, capacity usage).
- **Consumer side:**
  - Create an account and log in.
  - Browse available farm products.
  - Place orders (choose quantity + simple delivery/pick-up option).
  - View order history and current order status.
- Use one shared database for users, products, and orders.

**Out-of-Scope (MVP)**
- Complex delivery features or live map tracking.
- Native mobile applications (web-only for this project).
- Advanced AI-based analytics (considered as **Future Work**).


 **Deliverables**     
 - Web Application
---

### 3) Risks and Mitigation

- ** Payment gateway issues **  
If Moyasar or other payment gateways fail or delay production approval, real payments can’t be processed and the project launch may be delayed.

---




### 4) High-Level Plan

- **Weeks 1–2 (Stage 1):**  
  Form the team, pick the Dairy Direct idea, and write the idea summary.

- **Weeks 3–4 (Stage 2):**  
  Complete this charter: purpose, objectives, stakeholders, scope, risks, and plan.

- **Weeks 5–6 (Stage 3):**  
  Design the ERD, define the main APIs, and plan the frontend page structure.

- **Weeks 7–10 (Stage 4):**  
  Implement auth, products, orders, and analytics; test internally.

- **Weeks 11–12 (Stage 5):**  
  Fix bugs, polish the UI, and prepare the final live demo and report.

---

### 5) URLs (Sharing)

- **Project charter file (PDF / Google Doc):** `<add link here>`
- **Frontend repository:** `<GitHub URL>`
- **Backend repository:** `<GitHub URL>`
- **Extra documentation (Notion / other):** `<optional link>`
