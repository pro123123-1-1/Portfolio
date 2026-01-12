# Task 0: Plan and Define Sprints

## Purpose
To structure the development phase into manageable sprints using Agile methodology, ensuring organized workflow, clear ownership, and prioritized MVP delivery.

---

## Sprint Planning Overview
We adopted an Agile framework, dividing work into two one-week sprints. User stories were decomposed into specific tasks, prioritized via MoSCoW, and assigned based on team roles.

---

## Sprint Timeline
| Sprint | Duration | Focus Area |
|--------|----------|------------|
| Sprint 1 | 1 week | Core MVP features |
| Sprint 2 | 1 week | Enhancements, testing, documentation |

---

## User Stories & Task Breakdown

### User Story 1
*As a user, I want to browse available farm products.*  
**Tasks:**
1. Design product listing UI
2. Create product database schema
3. Develop product retrieval API
4. Connect frontend with backend API
5. Test product display functionality

### User Story 2
*As a user, I want to place an order for selected products.*  
**Tasks:**
1. Design order form UI
2. Implement order creation logic
3. Store orders in the database
4. Validate order submission
5. Test order workflow

---

## Task Prioritization (MoSCoW Framework)
| Task | Priority | Reason |
|------|----------|--------|
| Product listing | Must Have | Core MVP functionality |
| Order placement | Must Have | Core MVP functionality |
| Backend APIs | Must Have | Required for data flow |
| User login | Should Have | Important but not critical |
| Order history | Could Have | Nice-to-have feature |
| Reviews & ratings | Won't Have | Out of MVP scope |

---

## Task Dependencies
| Dependency | Impact |
|------------|--------|
| Frontend development ← Backend APIs | UI requires functional APIs |
| Order testing ← Backend order logic | Testing depends on completed logic |
| UI integration ← Finalized DB structure | Integration needs stable schema |

---

## Team Roles & Responsibilities
| Role | Team Member | Key Responsibilities |
|------|-------------|---------------------|
| Project Manager | Abdullah | Coordination, sprint tracking, communication |
| Backend Developer & QA | Raghad Abdullah | API development, database, backend testing |
| Frontend Developer & QA | Haifa Najwa | UI development, frontend testing, UX |
| Data & Documentation | Najwa | Data preparation, documentation, support |

---

## Sprint Details

### Sprint 1: Core MVP Development
**Focus:** Must Have requirements
- Product listing (UI + Backend)
- Order creation system
- Database setup & schema
- Initial frontend-backend integration

### Sprint 2: Enhancements & Testing
**Focus:** Should/Could Have + Quality
- Basic user authentication
- Bug fixes & performance tuning
- End-to-end testing
- Documentation finalization

---

## Deliverable
A comprehensive sprint plan detailing prioritized tasks, sprint durations, dependencies, and team responsibilities—providing a clear roadmap for MVP development.
