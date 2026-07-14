import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ToolRequest {
  tool: string;
  target: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { tool, target } = await req.json() as ToolRequest;

    if (!tool || !target) {
      return new Response(
        JSON.stringify({ error: "Tool type and target are required" }),
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

    let result: Record<string, unknown> = {};

    switch (tool) {
      case "dns_lookup":
        result = await dnsLookup(target);
        break;
      case "http_headers":
        result = await httpHeaderAnalysis(target);
        break;
      case "ssl_check":
        result = await sslCheck(target);
        break;
      case "whois_lookup":
        result = await whoisLookup(target);
        break;
      case "port_scan":
        result = portScanSimulation(target);
        break;
      case "cve_search":
        result = await cveSearch(target);
        break;
      case "url_reputation":
        result = await urlReputationCheck(target);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown tool: ${tool}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }

    await supabase.from("scan_history").insert({
      user_id: user.id,
      tool_type: tool,
      target,
      result,
      status: "completed",
    });

    return new Response(
      JSON.stringify({ tool, target, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function dnsLookup(domain: string): Promise<Record<string, unknown>> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const records: Record<string, unknown> = { domain: cleanDomain };

  try {
    const aResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
    const aData = await aResponse.json();
    records["A"] = aData.Answer?.map((a: { data: string }) => a.data) ?? [];
  } catch { records["A"] = []; }

  try {
    const aaaaResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=AAAA`);
    const aaaaData = await aaaaResponse.json();
    records["AAAA"] = aaaaData.Answer?.map((a: { data: string }) => a.data) ?? [];
  } catch { records["AAAA"] = []; }

  try {
    const mxResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=MX`);
    const mxData = await mxResponse.json();
    records["MX"] = mxData.Answer?.map((m: { data: string }) => m.data) ?? [];
  } catch { records["MX"] = []; }

  try {
    const txtResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=TXT`);
    const txtData = await txtResponse.json();
    records["TXT"] = txtData.Answer?.map((t: { data: string }) => t.data) ?? [];
  } catch { records["TXT"] = []; }

  try {
    const nsResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=NS`);
    const nsData = await nsResponse.json();
    records["NS"] = nsData.Answer?.map((n: { data: string }) => n.data) ?? [];
  } catch { records["NS"] = []; }

  try {
    const cnameResponse = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=CNAME`);
    const cnameData = await cnameResponse.json();
    records["CNAME"] = cnameData.Answer?.map((c: { data: string }) => c.data) ?? [];
  } catch { records["CNAME"] = []; }

  return records;
}

async function httpHeaderAnalysis(url: string): Promise<Record<string, unknown>> {
  let target = url;
  if (!target.startsWith("http")) target = "https://" + target;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(target, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const securityHeaders = {
      "strict-transport-security": headers["strict-transport-security"] ?? null,
      "content-security-policy": headers["content-security-policy"] ?? null,
      "x-frame-options": headers["x-frame-options"] ?? null,
      "x-content-type-options": headers["x-content-type-options"] ?? null,
      "referrer-policy": headers["referrer-policy"] ?? null,
      "permissions-policy": headers["permissions-policy"] ?? null,
      "x-xss-protection": headers["x-xss-protection"] ?? null,
    };

    const missing: string[] = [];
    for (const [key, value] of Object.entries(securityHeaders)) {
      if (!value) missing.push(key);
    }

    const grade = missing.length === 0 ? "A+" : missing.length <= 2 ? "A" : missing.length <= 4 ? "B" : missing.length <= 6 ? "C" : "D";

    return {
      url: target,
      status: response.status,
      statusText: response.statusText,
      headers,
      securityHeaders,
      missingHeaders: missing,
      securityGrade: grade,
    };
  } catch (err) {
    return { url: target, error: `Failed to fetch: ${err.message}` };
  }
}

async function sslCheck(domain: string): Promise<Record<string, unknown>> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`https://${cleanDomain}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const certInfo: Record<string, unknown> = {
      domain: cleanDomain,
      hasSSL: true,
      protocol: response.url.startsWith("https") ? "HTTPS" : "HTTP",
    };

    const serverHeader = response.headers.get("server");
    if (serverHeader) certInfo.server = serverHeader;

    certInfo.status = response.status;

    return certInfo;
  } catch {
    return { domain: cleanDomain, hasSSL: false, error: "Could not establish SSL connection" };
  }
}

async function whoisLookup(domain: string): Promise<Record<string, unknown>> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

  return {
    domain: cleanDomain,
    registrar: "Example Registrar, LLC",
    creationDate: "2010-01-15",
    expirationDate: "2026-01-15",
    updatedDate: "2025-06-01",
    nameServers: ["ns1.example.com", "ns2.example.com"],
    status: ["clientTransferProhibited", "serverDeleteProhibited"],
    registrantOrg: "Example Organization",
    registrantCountry: "US",
    note: "WHOIS data is simulated in this environment. For production, integrate a WHOIS API service.",
  };
}

function portScanSimulation(target: string): Promise<Record<string, unknown>> {
  const cleanTarget = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const commonPorts = [
    { port: 21, service: "FTP", status: "closed" },
    { port: 22, service: "SSH", status: "open" },
    { port: 25, service: "SMTP", status: "closed" },
    { port: 53, service: "DNS", status: "open" },
    { port: 80, service: "HTTP", status: "open" },
    { port: 110, service: "POP3", status: "closed" },
    { port: 143, service: "IMAP", status: "closed" },
    { port: 443, service: "HTTPS", status: "open" },
    { port: 3306, service: "MySQL", status: "closed" },
    { port: 3389, service: "RDP", status: "closed" },
    { port: 5432, service: "PostgreSQL", status: "closed" },
    { port: 8080, service: "HTTP-Alt", status: "closed" },
  ];

  const openPorts = commonPorts.filter(p => p.status === "open");

  return Promise.resolve({
    target: cleanTarget,
    scanTime: new Date().toISOString(),
    portsScanned: commonPorts.length,
    openPorts: openPorts.length,
    results: commonPorts,
    note: "Port scan is simulated in this environment. For production, integrate a proper network scanning service.",
  });
}

async function cveSearch(query: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=10`,
      {
        headers: { "Accept": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error(`NVD API returned ${response.status}`);
    }

    const data = await response.json();
    const vulnerabilities = (data.vulnerabilities ?? []).map((v: { cve: Record<string, unknown> }) => {
      const cve = v.cve;
      const descriptions = cve.descriptions as Array<{ lang: string; value: string }> ?? [];
      const metrics = cve.metrics as { cvssMetricV31?: Array<{ cvssData: { baseScore: number; baseSeverity: string } }> } ?? {};
      const cvss = metrics.cvssMetricV31?.[0]?.cvssData;

      return {
        id: cve.id,
        description: descriptions.find((d) => d.lang === "en")?.value ?? "No description available",
        published: cve.published,
        lastModified: cve.lastModified,
        cvssScore: cvss?.baseScore ?? null,
        cvssSeverity: cvss?.baseSeverity ?? null,
        url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      };
    });

    return {
      query,
      totalResults: data.totalResults ?? 0,
      vulnerabilities,
    };
  } catch (err) {
    return { query, error: `CVE search failed: ${err.message}`, vulnerabilities: [] };
  }
}

async function urlReputationCheck(url: string): Promise<Record<string, unknown>> {
  let target = url;
  if (!target.startsWith("http")) target = "https://" + target;

  const suspiciousPatterns = [
    { pattern: /\d+\.\d+\.\d+\.\d+/, label: "Contains IP address instead of domain" },
    { pattern: /@/, label: "Contains @ symbol" },
    { pattern: /\bit\.\|id\./i, label: "Uses internationalized domain" },
    { pattern: /[а-я]/, label: "Contains Cyrillic characters (possible homograph attack)" },
    { pattern: /bit\.ly|tinyurl|t\.co|goo\.gl/i, label: "Uses URL shortener" },
  ];

  const flags: string[] = [];
  for (const { pattern, label } of suspiciousPatterns) {
    if (pattern.test(target)) flags.push(label);
  }

  const hasHTTPS = target.startsWith("https://");
  if (!hasHTTPS) flags.push("Not using HTTPS");

  const riskScore = Math.min(flags.length * 20, 100);
  const riskLevel = riskScore === 0 ? "Low" : riskScore <= 40 ? "Medium" : "High";

  return {
    url: target,
    hasHTTPS,
    flags,
    riskScore,
    riskLevel,
    note: "This is a heuristic check. For production, integrate a reputation API like Google Safe Browsing or VirusTotal.",
  };
}
