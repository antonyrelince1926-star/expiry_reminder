# ExpiryBox Verification & Testing Guide

## 1. Unit & Integration Tests (JUnit 5)
Run the automated test suite:
```bash
mvn test
```

### Covered Test Suites:
- `ExpiryEngineTest`: Validates 5-day notification boundary conditions, today/tomorrow calculation, month and year rollovers, leap years, and month/year precision dates.
- `AuthenticationServiceTest`: Validates BCrypt hash comparison, registration uniqueness, and password strength checks.
- `ProductDaoTest`: Tests parameterized SQL execution, user ownership validation, and cascading deletes.
- `NotificationDeduplicationTest`: Tests unique index violation handling when attempting to generate identical daily reminders.

## 2. Security Test Matrix
| Test Case | Method | Expected Result |
| :--- | :--- | :--- |
| Unauthenticated access to `/dashboard` | `GET /dashboard` | Redirected to `/login` |
| IDOR: User A editing User B product | `POST /products/update?id=99` | 403 Forbidden or 404 Not Found |
| SQL Injection in search query | `GET /products?q=' OR 1=1--` | Safely escaped, 0 malicious matches |
| CSRF forgery test | `POST /products/create` (no token) | 403 Invalid CSRF Token |
| Dangerous file upload | `POST /upload (shell.jsp)` | 400 Rejected mime/extension |
