# Portfolio Project – Stage 4  
## Sprint Execution, QA & Final Integration

## Overview
This stage focuses on executing development sprints, monitoring progress, conducting reviews and retrospectives, and performing final integration and quality assurance testing for the MVP.

The objective is to demonstrate a structured Agile workflow, effective collaboration, and a tested, stable MVP that meets Holberton School requirements.

---

## 0. Plan and Define Sprints

### Purpose
To divide the development phase into short, manageable iterations and ensure controlled delivery of features.

### Sprint Details
- Sprint duration: 1 week
- Sprint scope: MVP core features

### User Stories Breakdown
| User Story | Tasks | Priority |
|-----------|------|----------|
| View products | Product API, product list UI | Must |
| Create orders | Order API, validation logic | Must |
| Authentication | Token verification | Must |
| UI improvements | Styling and UX refinements | Could |

### Prioritization (MoSCoW)
- **Must Have:** Product listing, order creation, authentication
- **Should Have:** Validation and error handling
- **Could Have:** UI enhancements
- **Won’t Have:** Advanced features beyond MVP scope

### Responsibilities
- Backend: API development and business logic
- Frontend: UI integration
- QA: Testing and validation

---

## 1. Execute Development Tasks

### Development Process
Developers implemented sprint tasks while following coding standards and documentation requirements.

### Source Control Management (SCM)
- Feature branches used for isolated development
- Pull requests reviewed before merging
- Main branch kept stable

### QA Involvement
- API testing using Postman
- Automated tests using Pytest

---

## 2. Monitor Progress and Adjust

### Progress Tracking
- Daily stand-ups to review completed tasks and blockers
- Continuous task updates via GitHub commits

### Metrics Observed
- Tasks completed vs planned
- Bug discovery and resolution rate

### Adjustments
- Reduced scope to focus on MVP-critical functionality
- Reassigned tasks when blockers were identified

---

## 3. Sprint Reviews and Retrospectives

### Sprint Review
- Demonstrated completed backend APIs and test results
- Verified end-to-end flows

### Retrospective

**What went well**
- Clear task ownership
- Effective Git workflow
- Early API testing

**Challenges**
- Missing test dependency discovered late

**Improvements**
- Install and verify all test dependencies earlier
- Increase automated test coverage incrementally

---

## 4. Final Integration and QA Testing

### Integration Testing
- Verified frontend-backend communication
- Tested authentication and protected endpoints
- Ensured database CRUD operations worked correctly

### Bugs Identified and Fixed

#### Bug 1: Unit Tests Failing Due to Missing Dependency
**Issue:**  
Unit tests failed during collection due to missing `model-bakery`.

**Fix:**  
```bash
pip install model-bakery
pip freeze > requirements.txt
```

![API Tests Passed](https://github.com/Abdullah-aldafas/Portfolio/blob/main/i1.jpeg)

![Coverage Report](https://github.com/Abdullah-aldafas/Portfolio/blob/main/i2.jpeg)

![Unit Tests Passed](https://github.com/Abdullah-aldafas/Portfolio/blob/main/i3.jpeg)


