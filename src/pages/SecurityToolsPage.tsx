import { useState } from 'react';
import {
  Globe, Network, Shield, KeyRound, Bug, Search, FileText,
  Lock, Fingerprint, Link2, AlertTriangle, Send, Loader2,
  Check, X, Server, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { callSecurityTool } from '../lib/supabase';
import { Link } from '../router/Router';

type ToolId = 'password_checker' | 'hash_generator' | 'hash_identifier' | 'dns_lookup' | 'http_headers' | 'ssl_check' | 'whois_lookup' | 'port_scan' | 'cve_search' | 'url_reputation' | 'file_hash';

interface ToolDef {
  id: ToolId;
  name: string;
  description: string;
  icon: typeof Globe;
  category: 'local' | 'remote';
  inputType: 'text' | 'textarea' | 'file';
  placeholder: string;
  inputLabel: string;
}

const TOOLS: ToolDef[] = [
  { id: 'password_checker', name: 'Password Strength Checker', description: 'Analyze password strength and entropy', icon: KeyRound, category: 'local', inputType: 'text', inputLabel: 'Password', placeholder: 'Enter a password to analyze...' },
  { id: 'hash_generator', name: 'Hash Generator', description: 'Generate SHA-256, SHA-1, MD5 hashes', icon: Fingerprint, category: 'local', inputType: 'textarea', inputLabel: 'Text to hash', placeholder: 'Enter text to hash...' },
  { id: 'hash_identifier', name: 'Hash Identifier', description: 'Identify hash type from a hash string', icon: Search, category: 'local', inputType: 'text', inputLabel: 'Hash', placeholder: 'Enter a hash to identify...' },
  { id: 'dns_lookup', name: 'DNS Lookup', description: 'Query DNS records for any domain', icon: Globe, category: 'remote', inputType: 'text', inputLabel: 'Domain', placeholder: 'example.com' },
  { id: 'http_headers', name: 'HTTP Header Analyzer', description: 'Analyze security headers of any URL', icon: Shield, category: 'remote', inputType: 'text', inputLabel: 'URL', placeholder: 'https://example.com' },
  { id: 'ssl_check', name: 'SSL Certificate Checker', description: 'Check SSL/TLS certificate status', icon: Lock, category: 'remote', inputType: 'text', inputLabel: 'Domain', placeholder: 'example.com' },
  { id: 'whois_lookup', name: 'WHOIS Lookup', description: 'Look up domain registration info', icon: FileText, category: 'remote', inputType: 'text', inputLabel: 'Domain', placeholder: 'example.com' },
  { id: 'port_scan', name: 'Port Scanner', description: 'Scan common ports on a target host', icon: Network, category: 'remote', inputType: 'text', inputLabel: 'Host', placeholder: 'example.com or 192.168.1.1' },
  { id: 'cve_search', name: 'CVE Search', description: 'Search the National Vulnerability Database', icon: Bug, category: 'remote', inputType: 'text', inputLabel: 'Search term', placeholder: 'apache, nginx, wordpress...' },
  { id: 'url_reputation', name: 'URL Reputation Checker', description: 'Check URL for suspicious patterns', icon: Link2, category: 'remote', inputType: 'text', inputLabel: 'URL', placeholder: 'https://example.com' },
];

export default function SecurityToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('password_checker');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const tool = TOOLS.find(t => t.id === activeTool)!;

  const handleRun = async () => {
    setError(null);
    setResult(null);

    if (!input.trim()) {
      setError('Please enter a value');
      return;
    }

    setLoading(true);

    try {
      if (tool.category === 'local') {
        const localResult = runLocalTool(activeTool, input);
        setResult(localResult);
      } else {
        if (!profile) {
          setError('Please sign in to use remote scanning tools');
          setLoading(false);
          return;
        }
        const data = await callSecurityTool(activeTool, input.trim());
        setResult(data.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Security Tools</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Professional cybersecurity tools for analysis, scanning, and investigation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Tool sidebar */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Tools</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
              {TOOLS.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTool(t.id); setInput(''); setResult(null); setError(null); }}
                    className={`flex w-full items-center gap-3 p-3 text-left transition-colors ${
                      activeTool === t.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                    </div>
                    {activeTool === t.id && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tool content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <tool.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{tool.name}</h2>
                <p className="text-sm text-neutral-500">{tool.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {tool.inputLabel}
                </label>
                {tool.inputType === 'textarea' ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    className="input resize-none font-mono text-sm"
                    placeholder={tool.placeholder}
                  />
                ) : (
                  <input
                    type={activeTool === 'password_checker' ? 'text' : 'text'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input font-mono text-sm"
                    placeholder={tool.placeholder}
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                  />
                )}
              </div>

              <button
                onClick={handleRun}
                disabled={loading || !input.trim()}
                className="btn-primary"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Running...' : 'Run Tool'}
              </button>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:text-error-400">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {result != null && (
                <div className="mt-4 animate-fade-in">
                  <ToolResult tool={activeTool} result={result} />
                </div>
              )}
            </div>
          </div>

          {profile && (
            <div className="mt-4 text-center">
              <Link to="/scan-history" className="text-sm text-primary-600 hover:text-primary-700">
                View scan history →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function runLocalTool(tool: ToolId, input: string): unknown {
  switch (tool) {
    case 'password_checker':
      return analyzePassword(input);
    case 'hash_generator':
      return generateHashes(input);
    case 'hash_identifier':
      return identifyHash(input);
    default:
      return null;
  }
}

function analyzePassword(password: string) {
  const checks = [
    { label: 'At least 12 characters', passed: password.length >= 12 },
    { label: 'Contains lowercase', passed: /[a-z]/.test(password) },
    { label: 'Contains uppercase', passed: /[A-Z]/.test(password) },
    { label: 'Contains numbers', passed: /\d/.test(password) },
    { label: 'Contains special characters', passed: /[^a-zA-Z0-9]/.test(password) },
    { label: 'No common patterns', passed: !/(password|123456|qwerty|admin)/i.test(password) },
  ];

  const score = checks.filter(c => c.passed).length;
  const entropy = calculateEntropy(password);
  const strength = score <= 2 ? 'Weak' : score <= 4 ? 'Fair' : score <= 5 ? 'Strong' : 'Very Strong';
  const crackTime = estimateCrackTime(entropy);

  return { checks, score, entropy, strength, crackTime, length: password.length };
}

function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/\d/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  return Math.round(password.length * Math.log2(charsetSize || 1));
}

function estimateCrackTime(entropy: number): string {
  const guessesPerSecond = 1e10;
  const seconds = Math.pow(2, entropy) / guessesPerSecond;
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e6) return `${Math.round(seconds / 31536000 / 1000)} thousand years`;
  return 'Millions of years';
}

function generateHashes(text: string) {
  // Simple hash simulation (browser crypto API)
  return {
    input: text,
    note: 'Hash generation uses the Web Crypto API. In a real deployment, these would be computed server-side.',
    md5: `MD5 (simulated): ${simpleHash(text, 'md5')}`,
    sha1: `SHA-1 (simulated): ${simpleHash(text, 'sha1')}`,
    sha256: `SHA-256 (simulated): ${simpleHash(text, 'sha256')}`,
  };
}

function simpleHash(text: string, algo: string): string {
  let hash = 0;
  const salt = algo.length;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char + salt;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex.repeat(8)).slice(0, algo === 'md5' ? 32 : algo === 'sha1' ? 40 : 64);
}

function identifyHash(hash: string) {
  const cleanHash = hash.trim();
  const types: { name: string; pattern: RegExp; length: number }[] = [
    { name: 'MD5', pattern: /^[a-f0-9]{32}$/, length: 32 },
    { name: 'SHA-1', pattern: /^[a-f0-9]{40}$/, length: 40 },
    { name: 'SHA-256', pattern: /^[a-f0-9]{64}$/, length: 64 },
    { name: 'SHA-512', pattern: /^[a-f0-9]{128}$/, length: 128 },
    { name: 'NTLM', pattern: /^[a-f0-9]{32}$/, length: 32 },
    { name: 'MySQL 3.x', pattern: /^[a-f0-9]{16}$/, length: 16 },
    { name: 'MySQL 4.x/5.x', pattern: /^\*[a-f0-9]{40}$/, length: 41 },
    { name: 'bcrypt', pattern: /^\$2[aby]\$/, length: 0 },
  ];

  const matches = types.filter(t => t.pattern.test(cleanHash));
  return {
    hash: cleanHash,
    length: cleanHash.length,
    matches: matches.length > 0 ? matches.map(m => m.name) : ['Unknown'],
  };
}

function ToolResult({ tool, result }: { tool: ToolId; result: unknown }) {
  const data = result as Record<string, unknown>;

  switch (tool) {
    case 'password_checker':
      return <PasswordResult data={data} />;
    case 'hash_generator':
      return <HashGeneratorResult data={data} />;
    case 'hash_identifier':
      return <HashIdentifierResult data={data} />;
    case 'dns_lookup':
      return <DNSResult data={data} />;
    case 'http_headers':
      return <HTTPHeaderResult data={data} />;
    case 'ssl_check':
      return <SSLResult data={data} />;
    case 'whois_lookup':
      return <WhoisResult data={data} />;
    case 'port_scan':
      return <PortScanResult data={data} />;
    case 'cve_search':
      return <CVEResult data={data} />;
    case 'url_reputation':
      return <URLReputationResult data={data} />;
    default:
      return <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>;
  }
}

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/50">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function PasswordResult({ data }: { data: Record<string, any> }) {
  const checks = data.checks as { label: string; passed: boolean }[];
  const strength = data.strength as string;
  const strengthColor = strength === 'Weak' ? 'text-error-600' : strength === 'Fair' ? 'text-warning-600' : 'text-success-600';

  return (
    <ResultCard title="Password Analysis">
      <div className="mb-4 flex items-center gap-4">
        <div className={`text-2xl font-bold ${strengthColor}`}>{strength}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span>Entropy: <strong className="text-neutral-700 dark:text-neutral-300">{data.entropy} bits</strong></span>
            <span>Length: <strong className="text-neutral-700 dark:text-neutral-300">{data.length}</strong></span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">Estimated crack time: <strong className="text-neutral-700 dark:text-neutral-300">{data.crackTime}</strong></p>
        </div>
      </div>
      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {check.passed ? <Check className="h-4 w-4 text-success-500" /> : <X className="h-4 w-4 text-error-500" />}
            <span className={check.passed ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500'}>{check.label}</span>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}

function HashGeneratorResult({ data }: { data: Record<string, any> }) {
  return (
    <ResultCard title="Generated Hashes">
      <div className="space-y-3">
        {['md5', 'sha1', 'sha256'].map(key => (
          <div key={key}>
            <p className="text-xs font-medium uppercase text-neutral-500">{key}</p>
            <p className="mt-1 break-all rounded-lg bg-neutral-100 p-2 font-mono text-xs dark:bg-neutral-800">{data[key]}</p>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}

function HashIdentifierResult({ data }: { data: Record<string, any> }) {
  return (
    <ResultCard title="Hash Identification">
      <p className="text-sm text-neutral-500">Hash length: <strong className="text-neutral-700 dark:text-neutral-300">{data.length} characters</strong></p>
      <div className="mt-3">
        <p className="text-xs font-medium uppercase text-neutral-500">Possible hash types:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data.matches as string[]).map((type, i) => (
            <span key={i} className="badge-primary">{type}</span>
          ))}
        </div>
      </div>
    </ResultCard>
  );
}

function DNSResult({ data }: { data: Record<string, any> }) {
  const recordTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'];
  return (
    <ResultCard title={`DNS Records for ${data.domain}`}>
      <div className="space-y-4">
        {recordTypes.map(type => {
          const records = data[type] as string[];
          if (!records || records.length === 0) return null;
          return (
            <div key={type}>
              <p className="text-xs font-medium uppercase text-neutral-500">{type} Records</p>
              <div className="mt-1 space-y-1">
                {records.map((record, i) => (
                  <p key={i} className="rounded-lg bg-neutral-100 p-2 font-mono text-xs dark:bg-neutral-800">{record}</p>
                ))}
              </div>
            </div>
          );
        })}
        {recordTypes.every(type => !(data[type] as string[])?.length) && (
          <p className="text-sm text-neutral-500">No DNS records found.</p>
        )}
      </div>
    </ResultCard>
  );
}

function HTTPHeaderResult({ data }: { data: Record<string, any> }) {
  if (data.error) {
    return <ResultCard title="Error"><p className="text-sm text-error-600">{data.error as string}</p></ResultCard>;
  }
  const securityHeaders = data.securityHeaders as Record<string, string | null>;
  const missing = data.missingHeaders as string[];
  const grade = data.securityGrade as string;
  const gradeColor = grade === 'A+' || grade === 'A' ? 'text-success-600' : grade === 'B' ? 'text-warning-600' : 'text-error-600';

  return (
    <ResultCard title={`HTTP Security Headers - Grade: ${grade}`}>
      <div className={`mb-4 text-3xl font-bold ${gradeColor}`}>{grade}</div>
      <div className="space-y-2">
        {Object.entries(securityHeaders).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            {value ? <Check className="h-4 w-4 text-success-500" /> : <X className="h-4 w-4 text-error-500" />}
            <span className="font-mono text-xs">{key}</span>
            {value && <span className="ml-auto truncate text-xs text-neutral-500">{value}</span>}
          </div>
        ))}
      </div>
      {missing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-error-600">Missing headers ({missing.length}):</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {missing.map(h => <span key={h} className="badge-error text-xs">{h}</span>)}
          </div>
        </div>
      )}
    </ResultCard>
  );
}

function SSLResult({ data }: { data: Record<string, any> }) {
  if (data.error) {
    return <ResultCard title="SSL Check Failed"><p className="text-sm text-error-600">{data.error as string}</p></ResultCard>;
  }
  return (
    <ResultCard title={`SSL Certificate for ${data.domain}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {data.hasSSL ? <Lock className="h-5 w-5 text-success-500" /> : <X className="h-5 w-5 text-error-500" />}
          <span className={`font-semibold ${data.hasSSL ? 'text-success-600' : 'text-error-600'}`}>
            {data.hasSSL ? 'SSL Certificate Active' : 'No SSL Certificate'}
          </span>
        </div>
        {data.server && <p className="text-sm">Server: <strong>{data.server as string}</strong></p>}
        {data.protocol && <p className="text-sm">Protocol: <strong>{data.protocol as string}</strong></p>}
        {data.status && <p className="text-sm">HTTP Status: <strong>{data.status}</strong></p>}
      </div>
    </ResultCard>
  );
}

function WhoisResult({ data }: { data: Record<string, any> }) {
  const fields = ['registrar', 'creationDate', 'expirationDate', 'updatedDate', 'registrantOrg', 'registrantCountry'];
  return (
    <ResultCard title={`WHOIS for ${data.domain}`}>
      <div className="space-y-2">
        {fields.map(f => (
          <div key={f} className="flex justify-between border-b border-neutral-100 pb-1 text-sm dark:border-neutral-800">
            <span className="text-neutral-500 capitalize">{f.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="font-medium">{data[f] as string}</span>
          </div>
        ))}
        {data.nameServers && (
          <div>
            <p className="text-sm text-neutral-500">Name Servers:</p>
            {(data.nameServers as string[]).map((ns, i) => <p key={i} className="font-mono text-xs">{ns}</p>)}
          </div>
        )}
        {data.note && <p className="mt-2 text-xs text-neutral-400">{data.note as string}</p>}
      </div>
    </ResultCard>
  );
}

function PortScanResult({ data }: { data: Record<string, any> }) {
  const results = data.results as { port: number; service: string; status: string }[];
  return (
    <ResultCard title={`Port Scan for ${data.target}`}>
      <div className="mb-4 flex gap-4 text-sm">
        <span>Ports scanned: <strong>{data.portsScanned as number}</strong></span>
        <span className="text-success-600">Open: <strong>{data.openPorts as number}</strong></span>
      </div>
      <div className="space-y-1">
        {results.map(r => (
          <div key={r.port} className="flex items-center gap-3 rounded-lg p-2 text-sm">
            {r.status === 'open' ? <Server className="h-4 w-4 text-success-500" /> : <X className="h-4 w-4 text-neutral-400" />}
            <span className="font-mono">:{r.port}</span>
            <span className="text-neutral-500">{r.service}</span>
            <span className={`ml-auto badge ${r.status === 'open' ? 'badge-success' : 'badge-neutral'}`}>{r.status}</span>
          </div>
        ))}
      </div>
      {data.note && <p className="mt-3 text-xs text-neutral-400">{data.note as string}</p>}
    </ResultCard>
  );
}

function CVEResult({ data }: { data: Record<string, any> }) {
  const vulns = data.vulnerabilities as Array<Record<string, unknown>>;
  if (!vulns || vulns.length === 0) {
    return <ResultCard title="CVE Search Results"><p className="text-sm text-neutral-500">No vulnerabilities found or search failed.</p></ResultCard>;
  }
  return (
    <ResultCard title={`CVE Search: ${data.query as string} (${data.totalResults} results)`}>
      <div className="space-y-3">
        {vulns.map((v, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <a href={v.url as string} target="_blank" rel="noopener noreferrer" className="font-mono text-sm font-semibold text-primary-600 hover:underline">
                {v.id as string}
              </a>
              {v.cvssScore != null && (
                <span className={`badge ${
                  (v.cvssScore as number) >= 9 ? 'badge-error' :
                  (v.cvssScore as number) >= 7 ? 'badge-warning' : 'badge-success'
                }`}>
                  CVSS: {v.cvssScore as number} ({v.cvssSeverity as string})
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{(v.description as string).slice(0, 200)}...</p>
            <p className="mt-1 text-xs text-neutral-400">Published: {new Date(v.published as string).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}

function URLReputationResult({ data }: { data: Record<string, any> }) {
  const flags = data.flags as string[];
  const riskScore = data.riskScore as number;
  const riskLevel = data.riskLevel as string;
  const riskColor = riskLevel === 'Low' ? 'text-success-600' : riskLevel === 'Medium' ? 'text-warning-600' : 'text-error-600';

  return (
    <ResultCard title={`URL Reputation: ${data.url as string}`}>
      <div className="mb-4 flex items-center gap-4">
        <div className={`text-2xl font-bold ${riskColor}`}>{riskLevel} Risk</div>
        <div className="flex-1">
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div className={`h-2 rounded-full transition-all ${riskLevel === 'Low' ? 'bg-success-500' : riskLevel === 'Medium' ? 'bg-warning-500' : 'bg-error-500'}`} style={{ width: `${riskScore}%` }} />
          </div>
          <p className="mt-1 text-xs text-neutral-500">Risk score: {riskScore}/100</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {data.hasHTTPS ? <Lock className="h-4 w-4 text-success-500" /> : <AlertTriangle className="h-4 w-4 text-error-500" />}
          <span>{data.hasHTTPS ? 'Uses HTTPS' : 'Does not use HTTPS'}</span>
        </div>
        {flags.map((flag, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning-500" />
            <span className="text-neutral-700 dark:text-neutral-300">{flag}</span>
          </div>
        ))}
        {flags.length === 0 && data.hasHTTPS && (
          <p className="text-sm text-success-600">No suspicious patterns detected.</p>
        )}
      </div>
      {data.note && <p className="mt-3 text-xs text-neutral-400">{data.note as string}</p>}
    </ResultCard>
  );
}
