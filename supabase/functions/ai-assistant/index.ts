import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  conversationId?: string;
}

const SECURITY_KB: Record<string, string> = {
  "sql injection": `SQL Injection is a code injection technique that exploits vulnerabilities in an application's database layer. Attackers insert malicious SQL queries into input fields to manipulate the database.

**How it works:**
- User input is improperly sanitized and concatenated into SQL queries
- Attackers can read, modify, or delete database contents

**Prevention:**
1. Use parameterized queries / prepared statements
2. Input validation and sanitization
3. Apply least privilege to database accounts
4. Deploy a Web Application Firewall (WAF)

**Types:**
- In-band SQLi: Results returned directly
- Blind SQLi: No direct output, use boolean/time-based techniques
- Out-of-band SQLi: Data exfiltrated via different channel`,

  "xss": `Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users.

**Types:**
1. Stored XSS: Malicious script stored on server, executed when viewed
2. Reflected XSS: Script embedded in URL, reflected by server
3. DOM-based XSS: Script executed via DOM manipulation

**Prevention:**
- Output encoding / escaping all user input
- Content Security Policy (CSP) headers
- Input validation
- Use HttpOnly and Secure cookies
- Framework auto-escaping (React, Angular)`,

  "csrf": `Cross-Site Request Forgery (CSRF) tricks authenticated users into executing unwanted actions on a web application.

**How it works:**
1. User logs into target site (valid session cookie)
2. User visits malicious site
3. Malicious site sends forged request to target site
4. Browser includes session cookie automatically

**Prevention:**
- Anti-CSRF tokens (synchronizer token pattern)
- SameSite cookie attribute (Lax or Strict)
- Require re-authentication for sensitive actions
- Verify Origin and Referer headers`,

  "password": `Strong password security is fundamental to application security.

**Best practices for password hashing:**
- Use bcrypt, scrypt, or Argon2 (never MD5 or SHA-1 for passwords)
- Add unique salt per password
- Use appropriate work factor (bcrypt cost >= 12)
- Consider Pepper (server-side secret)

**Password policy recommendations:**
- Minimum 12 characters
- Allow passphrases
- Check against breach databases (Have I Been Pwned API)
- Don't enforce complex character rules (NIST 800-63B)
- Rate limit login attempts`,

  "owasp": `The OWASP Top 10 is a standard awareness document for web application security.

**OWASP Top 10 (2021):**
1. Broken Access Control
2. Cryptographic Failures
3. Injection (including XSS)
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

Each category represents a class of vulnerabilities that can lead to data breaches, system compromise, or service disruption.`,

  "ssl": `SSL/TLS provides encryption for data in transit between client and server.

**Key concepts:**
- TLS 1.3 is the current standard (avoid TLS 1.0/1.1)
- Certificates validate server identity
- Perfect Forward Secrecy (PFS) protects past sessions
- HSTS header forces HTTPS connections

**Common issues:**
- Expired or self-signed certificates
- Weak cipher suites
- Missing intermediate certificates
- No HSTS header
- Mixed content on HTTPS pages`,

  "ddos": `A Denial of Service (DoS) attack aims to make a service unavailable by overwhelming it with traffic.

**Types:**
- Volumetric: Bandwidth saturation (UDP floods, ICMP floods)
- Protocol: Network protocol exploitation (SYN floods, Ping of Death)
- Application Layer: HTTP floods, slowloris

**Mitigation:**
- Rate limiting and throttling
- CDN with DDoS protection (Cloudflare, AWS Shield)
- Web Application Firewall
- Geographic blocking
- Auto-scaling infrastructure
- Anycast network routing`,

  "malware": `Malware analysis involves understanding malicious software behavior.

**Analysis types:**
1. Static Analysis: Examining code without execution (disassembly, decompilation)
2. Dynamic Analysis: Running malware in a sandbox to observe behavior
3. Behavioral Analysis: Monitoring network traffic, file system changes, registry modifications

**Common malware types:**
- Ransomware: Encrypts data, demands payment
- Trojans: Disguised as legitimate software
- Worms: Self-replicating across networks
- Rootkits: Hide at OS kernel level
- Spyware: Secretly monitors user activity`,
};

function generateResponse(message: string): string {
  const lower = message.toLowerCase();

  for (const [keyword, response] of Object.entries(SECURITY_KB)) {
    if (lower.includes(keyword)) {
      return response;
    }
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return `Hello! I'm your AI Security Assistant. I can help you with:

- Explaining cybersecurity vulnerabilities (SQL injection, XSS, CSRF, etc.)
- Recommending security fixes and best practices
- Understanding OWASP Top 10
- Password security guidance
- SSL/TLS configuration
- Malware analysis concepts
- DDoS mitigation strategies

Ask me about any cybersecurity topic!`;
  }

  if (lower.includes("help") || lower.includes("what can you do")) {
    return `I'm here to help with cybersecurity questions! I can explain:

- **Vulnerabilities**: SQL injection, XSS, CSRF, SSRF
- **Security practices**: Password hashing, input validation, access control
- **OWASP Top 10**: Understanding web application security risks
- **Network security**: SSL/TLS, DDoS mitigation
- **Malware**: Analysis techniques and common types

Just ask me a question about any security topic!`;
  }

  if (lower.includes("how to secure") || lower.includes("how to protect")) {
    return `Here are essential security practices for any application:

1. **Authentication**: Use strong password hashing (bcrypt/Argon2), implement MFA
2. **Authorization**: Apply least privilege, validate permissions on every request
3. **Input Validation**: Sanitize all user input, use allowlists not blocklists
4. **Output Encoding**: Escape data before rendering to prevent XSS
5. **HTTPS**: Enforce TLS 1.3, use HSTS, redirect HTTP to HTTPS
6. **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options
7. **Rate Limiting**: Protect against brute force and DoS
8. **Logging**: Log security events, monitor for anomalies
9. **Dependencies**: Keep libraries updated, scan for vulnerabilities
10. **Secrets**: Never hardcode secrets, use environment variables or vaults

What specific area would you like to dive deeper into?`;
  }

  return `I understand you're asking about "${message}". 

I can help with topics like:
- SQL injection, XSS, CSRF vulnerabilities
- OWASP Top 10 security risks
- Password security and hashing
- SSL/TLS configuration
- Malware analysis
- DDoS mitigation
- General security best practices

Could you rephrase your question or ask about one of these topics? I'll provide a detailed explanation with prevention strategies.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, conversationId } = await req.json() as ChatRequest;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let convId = conversationId;

    if (!convId) {
      const title = message.length > 50 ? message.slice(0, 50) + "..." : message;
      const { data: conv } = await supabase.from("ai_conversations").insert({
        user_id: user.id,
        title,
      }).select("id").maybeSingle();
      convId = conv?.id;
    }

    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    const response = generateResponse(message);

    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: response,
    });

    return new Response(
      JSON.stringify({
        conversationId: convId,
        response,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
