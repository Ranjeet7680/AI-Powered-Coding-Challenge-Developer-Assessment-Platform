# Security Policy

## Authentication & Cryptographic Standards

Coding Task Factory implements defense-in-depth security aligned with **NIST SP 800-63B** and **OWASP Authentication Guidelines**:

- **Password Storage**: Per-user 16-byte random salts (`secrets.token_hex(16)`) with 100,000 rounds of PBKDF2-HMAC-SHA256.
- **Timing-Attack Protection**: Password hashes and JWT signatures are verified with `hmac.compare_digest`.
- **Brute-Force Defense**: Repeated failed logins trigger a 15-minute lockout shield with generic authentication errors to block user enumeration.
- **Session Signing**: Stateless HMAC-SHA256 (`HS256`) JWTs with 7-day expiry and `jti` token identifiers.
- **API Key Protection**: Optional user Gemini API keys are stored server-side and returned masked (`has_gemini_api_key` + `gemini_api_key_preview`).
- **Execution Isolation**: User code runs in ephemeral temporary directories with strict execution timeouts.

## Reporting a Vulnerability

Please **do not** open public GitHub issues for sensitive security vulnerabilities. Report findings privately to the repository maintainer via GitHub Security Advisories with steps to reproduce and impact details.
