# ExpiryBox Security Specification & Hardening

## 1. Authentication & Session Management
- **Passwords**: Hashed with BCrypt (work factor 12). Plain-text passwords are never stored or logged.
- **Sessions**: Tracked via `HttpSession` with session ID regeneration on login to prevent Session Fixation.
- **Cookies**: `HttpOnly`, `SameSite=Lax`, and `Secure` flag on HTTPS.

## 2. Authorization & IDOR/BOLA Defense
Every product, notification, and image operation enforces:
`WHERE id = ? AND user_id = ?`
Users cannot read, modify, or delete products belonging to other accounts.

## 3. SQL Injection Defense
Zero string concatenation is permitted in SQL queries. 100% of database interactions utilize parameterized `PreparedStatement` instances via try-with-resources.

## 4. Cross-Site Request Forgery (CSRF)
All state-modifying POST/PUT/DELETE requests validate a cryptographically secure token stored in the user's session (`X-CSRF-Token` header or `_csrf` form field).

## 5. Cross-Site Scripting (XSS)
- JSTL `<c:out>` and context-aware escaping on output.
- Strict Content-Security-Policy (CSP) headers blocking unsafe inline script execution.

## 6. Secure Uploads
- File extension and real MIME type inspection (`image/jpeg`, `image/png`, `image/webp`).
- Max upload size capped at 10MB.
- File names are sanitized with UUIDs to avoid directory traversal.
- Uploads stored outside web root and streamed through authenticated `ImageViewServlet`.
