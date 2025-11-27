# Dairy Direct – Connecting Farms Directly with Consumers
*A simple web platform connecting all types of farms (dairy, fruits, vegetables, dates, etc.) directly with consumers.*


##  Stage 1 – Team Formation & Idea Development

###  0. Team Formation
- **First meeting:** October 26 – On-site at Holberton Campus, 4:00 PM  
- **Communication:** WhatsApp group for daily coordination + weekly in-person meetings  

**Team Members & Roles:**
- **Abdullah** – *Project Manager:* Leads coordination, meeting organization, and progress tracking.  
- **Raghad** – *Backend Developer:* Designs the database, builds APIs, and implements business logic.  
- **Haifa** – *Frontend Developer:* Builds and styles the user interface for both farm and consumer roles.  
- **Najwa** – *Data & Documentation Owner:* Handles analytics, testing data, and documentation (reports, README, etc.).  


###  1. Research and Brainstorming
- Each member researched ideas based on personal interests and real-world needs (IELTS preparation, drone delivery, supply chain).  
- The team gathered feedback from people about daily challenges and reviewed YouTube projects for inspiration.  
- Two brainstorming sessions were held:  
  - **October 26:** Initial idea generation  
  - **October 28:** Filtering and evaluation  
- **Techniques used:**  
  - Open brainstorming  
  - Listing pros/cons for each idea  
  - “How Might We…” questions to uncover innovation angles  



###  2. Idea Evaluation
**Evaluation Criteria:** Feasibility, potential impact, technical alignment, scalability, time, and ease of implementation.

#### Idea 1 – AI IELTS Assistant
A platform helping students prepare for IELTS with AI feedback on writing and speaking.  
**Strengths:** Clear target users (students, scholarship applicants); direct AI use.  
**Rejected because:** The market is already crowded with similar tools, making it difficult to stand out in a short timeframe.  

####  Idea 2 – Smart Drone Delivery Simulation
A web app simulating drone delivery routes and services (delivery, inspection, etc.).  
**Strengths:** Visually appealing and technically interesting.  
**Rejected because:** Users might expect real drones; less connected to daily life for a student project.  

####  Idea 3 – Smart Pharma Demand & Inventory
A dashboard for pharmacies/warehouses to monitor medicine demand and reduce expiry waste.  
**Strengths:** Real supply chain issue; valuable business insight.  
**Rejected because:** Requires sensitive data and regulatory knowledge (e.g., SFDA systems) — not practical for a student project.  

####  Idea 4 – Dairy Direct (Selected MVP)
A web platform connecting farms directly with end consumers. Consumers can order fresh products (dairy, fruits, vegetables, dates), and farms can manage capacity and orders.  
**Strengths:** Clear problem, realistic scope, defined users, and good balance between web development and data analytics.  
**Decision:** Selected as the final MVP idea.  



###  3. Decision and Refinement
**Final MVP:** *Dairy Direct – Connecting Farms Directly with Consumers*  

**Problem:**  
Small and medium-sized farms rely on unorganized channels (WhatsApp, calls, or middlemen), leading to inefficiency, lost orders, and product waste.  

**Target Audience:**  
Farm owners (all types) and consumers who want local, fresh, and traceable products directly from farms.  

**Key Features (MVP):**
- **For Farms:**  
  - Register and manage products (milk, dates, fruits, vegetables, etc.)  
  - Set daily capacity and update orders  
  - View simple analytics about demand and top products  
- **For Consumers:**  
  - Browse products  
  - Place and track orders (delivery or pick-up option)  

**Enhancements Discussed:**
- Add daily capacity management to match production with demand  
- Design a simple, mobile-friendly interface  
- Keep analytics minimal at MVP stage to focus on functionality  

**Expected Outcomes:**
- Reduce product waste through better demand matching  
- Digitize small and mid-size farms’ operations  
- Strengthen direct local farm-to-consumer connections  



###  4. Idea Development Documentation
- All stages documented in **Google Docs** (ideas, pros/cons, meeting notes, and decisions).  
- Summary of the selected MVP includes rationale and potential impact.  
- Overview of team formation and workflow to ensure transparency and collaboration.  




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


### 3) Risks and Mitigation

- **Scope creep**  
  Team keeps adding features beyond the MVP.  
  _Mitigation:_ Follow this charter and move extra ideas to a “Future Work” list.

- **Limited time**  
  The project competes with other courses, assignments, and exams.  
  _Mitigation:_ Use small weekly milestones and start core features early.

- **Technical challenges**  
  Limited experience with full-stack (connecting frontend and backend).  
  _Mitigation:_ Keep solutions simple, use tutorials, and pair-program when needed.





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



### 5) URLs (Sharing)

- **Project charter file (PDF / Google Doc):** `<add link here>`
- **Frontend repository:** `<GitHub URL>`
- **Backend repository:** `<GitHub URL>`
- **Extra documentation (Notion / other):** `<optional link>`
