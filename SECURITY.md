# Security Policy

## Overview

CyberLearn is built with security as a core principle. This document outlines the security measures implemented and guidelines for responsible disclosure.

## Security Measures

### Authentication & Authorization
- **Supabase Auth**: Email/password authentication with secure session management
- **Row Level Security (RLS)**: Enabled on all 15+ database tables
- **Role-Based Access Control**: Three roles (student, instructor, admin) with scoped policies
- **Protected Routes**: Client-side route guards redirect unauthenticated users
- **Session Management**: Automatic token refresh and secure session storage

### Database Security
- **RLS Policies**: Owner-scoped CRUD on all user data tables
- **Admin-Only Access**: Course management restricted to admin/instructor roles
- **Parameterized Queries**: All database access via Supabase client (no raw SQL)
- **Foreign Key Constraints**: Referential integrity enforced on all relationships
- **Cascade Deletes**: Proper cleanup of related data on user deletion

### Frontend Security
- **Input Validation**: All forms validate input before submission
- **XSS Prevention**: React's built-in escaping, no dangerouslySetInnerHTML
- **No Hardcoded Secrets**: All credentials in environment variables
- **Content Security Policy**: Security headers configured in deployment
- **HTTPS Enforcement**: All connections use TLS

### Edge Functions Security
- **JWT Verification**: All edge functions verify user authentication
- **CORS Headers**: Properly configured on all edge function responses
- **Error Handling**: Try/catch blocks prevent information leakage
- **Service Role Key**: Used only server-side, never exposed to client

### OWASP Top 10 Compliance
1. **Broken Access Control**: RLS + role-based policies
2. **Cryptographic Failures**: TLS 1.3, secure password hashing via Supabase Auth
3. **Injection**: Parameterized queries, no string concatenation in SQL
4. **Insecure Design**: Security-first architecture with defense in depth
5. **Security Misconfiguration**: Minimal attack surface, proper defaults
6. **Vulnerable Components**: Regular dependency updates
7. **Auth Failures**: Secure session management, rate limiting considerations
8. **Data Integrity Failures**: Database constraints and triggers
9. **Logging Failures**: Security events logged in scan_history and notifications
10. **SSRF**: Edge functions validate and sanitize external API calls

## Security Tools

The platform includes built-in security tools for educational purposes:
- Password Strength Checker (client-side, no data transmitted)
- Hash Generator and Identifier (client-side)
- DNS Lookup (via Google DNS API)
- HTTP Header Analyzer (via edge function)
- SSL Certificate Checker (via edge function)
- WHOIS Lookup (via edge function)
- Port Scanner (simulated, no actual network scanning)
- CVE Search (via NVD API)
- URL Reputation Checker (heuristic analysis)

## Responsible Disclosure

If you discover a security vulnerability:
1. Do not exploit the vulnerability
2. Report it privately to the development team
3. Provide a detailed description and reproduction steps
4. Allow reasonable time for a fix before public disclosure

## Dependency Security

- All dependencies are pinned to specific versions
- Regular security audits via `npm audit`
- No unnecessary dependencies (minimal dependency tree)
- Production build verified before each deployment
