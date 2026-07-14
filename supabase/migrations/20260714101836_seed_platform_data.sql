/*
# Seed Initial Platform Data

Populates the platform with cybersecurity content:
- Course categories, sample courses with modules and lessons
- Achievement definitions, forum categories
*/

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug, description, icon) VALUES
('Web Security', 'web-security', 'Learn about web application vulnerabilities, OWASP Top 10, and secure coding practices.', 'Globe'),
('Network Security', 'network-security', 'Master network defense, packet analysis, and intrusion detection.', 'Network'),
('Cryptography', 'cryptography', 'Understand encryption, hashing, digital signatures, and PKI.', 'KeyRound'),
('Malware Analysis', 'malware-analysis', 'Analyze malicious software and understand attack vectors.', 'Bug'),
('Digital Forensics', 'digital-forensics', 'Learn forensic investigation techniques and evidence handling.', 'Search'),
('Ethical Hacking', 'ethical-hacking', 'Master penetration testing and offensive security methodologies.', 'Sword')
ON CONFLICT (slug) DO NOTHING;

-- ============ COURSES ============
INSERT INTO courses (title, slug, description, category_id, difficulty, status, estimated_hours) VALUES
('Web Application Security Fundamentals', 'web-app-security-fundamentals',
 'Learn the fundamentals of web application security including the OWASP Top 10 vulnerabilities, common attack vectors, and defensive strategies.',
 (SELECT id FROM categories WHERE slug = 'web-security'), 'beginner', 'published', 12),
('Network Defense and Monitoring', 'network-defense-monitoring',
 'A comprehensive guide to network security monitoring, SIEM systems, and intrusion detection.',
 (SELECT id FROM categories WHERE slug = 'network-security'), 'intermediate', 'published', 18),
('Applied Cryptography for Developers', 'applied-cryptography',
 'Practical cryptography implementation for software developers including symmetric/asymmetric encryption, hashing, and key management.',
 (SELECT id FROM categories WHERE slug = 'cryptography'), 'intermediate', 'published', 15),
('Introduction to Malware Analysis', 'intro-malware-analysis',
 'Learn static and dynamic malware analysis techniques to understand malicious software behavior.',
 (SELECT id FROM categories WHERE slug = 'malware-analysis'), 'advanced', 'published', 20),
('Penetration Testing Essentials', 'pentesting-essentials',
 'Master the fundamentals of penetration testing including reconnaissance, exploitation, and reporting.',
 (SELECT id FROM categories WHERE slug = 'ethical-hacking'), 'intermediate', 'published', 25)
ON CONFLICT (slug) DO NOTHING;

-- ============ MODULES ============
INSERT INTO modules (course_id, title, description, position) VALUES
((SELECT id FROM courses WHERE slug = 'web-app-security-fundamentals'), 'Introduction to Web Security', 'Understanding the web security landscape', 0),
((SELECT id FROM courses WHERE slug = 'web-app-security-fundamentals'), 'OWASP Top 10 Deep Dive', 'Detailed analysis of each OWASP vulnerability', 1),
((SELECT id FROM courses WHERE slug = 'web-app-security-fundamentals'), 'Secure Coding Practices', 'How to write secure code and prevent vulnerabilities', 2)
ON CONFLICT DO NOTHING;

INSERT INTO modules (course_id, title, description, position) VALUES
((SELECT id FROM courses WHERE slug = 'network-defense-monitoring'), 'Network Fundamentals', 'TCP/IP, protocols, and network architecture', 0),
((SELECT id FROM courses WHERE slug = 'network-defense-monitoring'), 'Security Monitoring Tools', 'SIEM, IDS/IPS, and network analysis tools', 1),
((SELECT id FROM courses WHERE slug = 'network-defense-monitoring'), 'Incident Response', 'Detecting and responding to security incidents', 2)
ON CONFLICT DO NOTHING;

-- ============ LESSONS ============
INSERT INTO lessons (module_id, title, content, position, duration_minutes) VALUES
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 0),
 'The Web Security Landscape',
 '## The Web Security Landscape

Web application security is the practice of protecting websites and online services from security threats. As more applications move to the web, understanding web security becomes critical for every developer.

### Key Concepts

- **Attack Surface**: The total points where an attacker can attempt to enter or extract data
- **Threat Modeling**: Identifying potential threats and vulnerabilities
- **Defense in Depth**: Multiple layers of security controls

### Why Web Security Matters

1. Data breaches can expose sensitive user information
2. Legal and regulatory requirements (GDPR, HIPAA)
3. Reputational damage from security incidents
4. Financial losses from attacks and remediation',
 0, 15),
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 0),
 'Understanding HTTP and HTTPS',
 '## HTTP and HTTPS

HTTP (HyperText Transfer Protocol) is the foundation of web communication. HTTPS adds encryption via TLS/SSL.

### HTTP Methods
- GET: Retrieve data
- POST: Submit data
- PUT: Update data
- DELETE: Remove data

### Security Headers

Content-Security-Policy: default-src self
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000

These headers protect against XSS, clickjacking, and MIME-type attacks.',
 1, 20)
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id, title, content, position, duration_minutes) VALUES
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 1),
 'SQL Injection',
 '## SQL Injection

SQL injection (SQLi) occurs when user input is improperly sanitized and executed as part of a SQL query.

### Example Attack

Vulnerable query: SELECT * FROM users WHERE username = input
Attacker input: admin OR 1=1
Result: SELECT * FROM users WHERE username = admin OR 1=1

### Prevention

1. Use parameterized queries / prepared statements
2. Input validation and sanitization
3. Least privilege database accounts
4. Web Application Firewall (WAF)

### Types of SQL Injection

- **In-band**: Same channel for attack and results
- **Blind**: No direct data return, use boolean/time-based techniques
- **Out-of-band**: Different channel for data exfiltration',
 0, 25),
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 1),
 'Cross-Site Scripting (XSS)',
 '## Cross-Site Scripting (XSS)

XSS allows attackers to inject malicious scripts into web pages viewed by other users.

### Types of XSS

1. **Stored XSS**: Malicious script stored on server, executed when viewed
2. **Reflected XSS**: Script embedded in URL, reflected back by server
3. **DOM-based XSS**: Script executed via DOM manipulation

### Prevention

- Output encoding / escaping
- Content Security Policy (CSP)
- Input validation
- HttpOnly cookies

Vulnerable: element.innerHTML = userInput
Safe: element.textContent = userInput',
 1, 25),
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 1),
 'Cross-Site Request Forgery (CSRF)',
 '## Cross-Site Request Forgery (CSRF)

CSRF tricks users into executing unwanted actions on a web application where they are authenticated.

### How CSRF Works

1. User logs into target site (has valid session cookie)
2. User visits malicious site
3. Malicious site sends request to target site
4. Browser includes session cookie automatically

### Prevention

- Anti-CSRF tokens
- SameSite cookie attribute
- Require re-authentication for sensitive actions
- Verify Origin and Referer headers',
 2, 20)
ON CONFLICT DO NOTHING;

INSERT INTO lessons (module_id, title, content, position, duration_minutes) VALUES
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 2),
 'Secure Session Management',
 '## Secure Session Management

Session management is critical for maintaining user authentication state securely.

### Best Practices

1. Use strong session identifiers (128+ bits of entropy)
2. Regenerate session IDs after login
3. Set appropriate cookie attributes:
   - HttpOnly: Prevent JavaScript access
   - Secure: HTTPS only
   - SameSite: Prevent CSRF
4. Implement session timeout
5. Server-side session invalidation

### Common Mistakes

- Predictable session IDs
- Not regenerating sessions after authentication
- Long session timeouts without activity checks
- Not invalidating sessions on logout',
 0, 20),
((SELECT m.id FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.slug = 'web-app-security-fundamentals' AND m.position = 2),
 'Security Testing and Code Review',
 '## Security Testing and Code Review

Security testing helps identify vulnerabilities before deployment.

### Testing Approaches

1. **Static Application Security Testing (SAST)**: Analyzes source code
2. **Dynamic Application Security Testing (DAST)**: Tests running application
3. **Interactive Application Security Testing (IAST)**: Combines SAST and DAST
4. **Manual Code Review**: Human analysis of code

### Code Review Checklist

- Input validation on all user inputs
- Output encoding for all rendered data
- Authentication and authorization checks
- Error handling without information leakage
- Secure configuration management
- Dependency vulnerability scanning',
 1, 30)
ON CONFLICT DO NOTHING;

-- ============ ACHIEVEMENTS ============
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
('First Steps', 'Complete your first lesson', 'Footprints', 'complete_first_lesson', 10),
('Quick Learner', 'Complete 10 lessons', 'Zap', 'complete_10_lessons', 25),
('Course Conqueror', 'Complete your first course', 'Trophy', 'complete_first_course', 50),
('Security Scholar', 'Complete 5 courses', 'GraduationCap', 'complete_5_courses', 100),
('Forum Contributor', 'Create your first forum topic', 'MessageSquare', 'create_first_topic', 15),
('Note Taker', 'Create your first note', 'StickyNote', 'create_first_note', 10),
('Security Advocate', 'Earn 5 achievements', 'ShieldCheck', 'earn_5_achievements', 75),
('Dedicated Learner', 'Study for 7 consecutive days', 'Flame', 'streak_7_days', 50)
ON CONFLICT (name) DO NOTHING;

-- ============ FORUM CATEGORIES ============
INSERT INTO forum_categories (name, slug, description, icon) VALUES
('General Discussion', 'general-discussion', 'Talk about anything cybersecurity related', 'MessageCircle'),
('Help & Support', 'help-support', 'Ask questions and get help from the community', 'LifeBuoy'),
('Security News', 'security-news', 'Share and discuss the latest security news', 'Newspaper'),
('CTF & Challenges', 'ctf-challenges', 'Discuss capture the flag challenges and security puzzles', 'Flag'),
('Tools & Resources', 'tools-resources', 'Share useful security tools and learning resources', 'Wrench')
ON CONFLICT (slug) DO NOTHING;