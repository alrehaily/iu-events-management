import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let chromium;
try {
  ({ chromium } = require('../e2e/node_modules/@playwright/test'));
} catch {
  ({ chromium } = require('@playwright/test'));
}

const WIDTH = 2172;
const HEIGHT = 724;

const COVERS = [
  {
    key: 'ai-applications',
    titleEn: 'Artificial Intelligence Applications',
    titleAr: 'تطبيقات الذكاء الاصطناعي',
    topicLabel: 'DEEP LEARNING & APPLIED MODEL PIPELINE',
    bgStart: '#050a14',
    bgEnd: '#091629',
    windowTitle: 'ai_pipeline.py — PyTorch & Transformers IDE (Python 3.12)',
    accent: '#06b6d4',
    renderWindow: () => `
      <!-- IDE Window Chrome -->
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      <!-- Window Titlebar -->
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#1e293b"/>
      <!-- Window Controls -->
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#94a3b8" font-family="'Consolas', 'Courier New', monospace" font-size="14" text-anchor="middle">ai_pipeline.py — PyTorch &amp; Transformers IDE (Python 3.12)</text>

      <!-- IDE Sub-bar / Tabs -->
      <rect x="506" y="112" width="1160" height="34" fill="#091122"/>
      <rect x="516" y="114" width="180" height="32" rx="4" fill="#0f172a"/>
      <text x="532" y="135" fill="#38bdf8" font-family="'Consolas', monospace" font-size="13">ai_pipeline.py</text>
      <text x="716" y="135" fill="#64748b" font-family="'Consolas', monospace" font-size="13">dataset_loader.py</text>
      <text x="866" y="135" fill="#64748b" font-family="'Consolas', monospace" font-size="13">model_config.json</text>

      <!-- Code Editor Body -->
      <!-- Line Numbers Column -->
      <rect x="506" y="146" width="55" height="360" fill="#091122"/>
      <g fill="#475569" font-family="'Consolas', monospace" font-size="13" text-anchor="end">
        <text x="548" y="174">1</text>
        <text x="548" y="200">2</text>
        <text x="548" y="226">3</text>
        <text x="548" y="252">4</text>
        <text x="548" y="278">5</text>
        <text x="548" y="304">6</text>
        <text x="548" y="330">7</text>
        <text x="548" y="356">8</text>
        <text x="548" y="382">9</text>
        <text x="548" y="408">10</text>
        <text x="548" y="434">11</text>
        <text x="548" y="460">12</text>
        <text x="548" y="486">13</text>
      </g>

      <!-- Python AI Code with Syntax Highlighting -->
      <g font-family="'Consolas', 'Fira Code', monospace" font-size="13.5" xml:space="preserve">
        <text x="580" y="174"><tspan fill="#c084fc">import</tspan> <tspan fill="#e2e8f0">torch</tspan></text>
        <text x="580" y="200"><tspan fill="#c084fc">from</tspan> <tspan fill="#e2e8f0">transformers</tspan> <tspan fill="#c084fc">import</tspan> <tspan fill="#67e8f9">AutoModelForCausalLM</tspan><tspan fill="#94a3b8">, </tspan><tspan fill="#67e8f9">AutoTokenizer</tspan></text>
        <text x="580" y="226"><tspan fill="#64748b"># Load model pipeline on GPU accelerator</tspan></text>
        <text x="580" y="252"><tspan fill="#e2e8f0">device = </tspan><tspan fill="#fef08a">"cuda"</tspan> <tspan fill="#c084fc">if</tspan> <tspan fill="#e2e8f0">torch.cuda.is_available() </tspan><tspan fill="#c084fc">else</tspan> <tspan fill="#fef08a">"cpu"</tspan></text>
        <text x="580" y="278"><tspan fill="#e2e8f0">tokenizer = </tspan><tspan fill="#67e8f9">AutoTokenizer</tspan><tspan fill="#94a3b8">.from_pretrained(</tspan><tspan fill="#fde047">"iu-academic-arabic-llm"</tspan><tspan fill="#94a3b8">)</tspan></text>
        <text x="580" y="304"><tspan fill="#e2e8f0">model = </tspan><tspan fill="#67e8f9">AutoModelForCausalLM</tspan><tspan fill="#94a3b8">.from_pretrained(</tspan><tspan fill="#fde047">"iu-academic-arabic-llm"</tspan><tspan fill="#94a3b8">).to(device)</tspan></text>
        <text x="580" y="330"><tspan fill="#64748b"># Interactive token generation and evaluation</tspan></text>
        <text x="580" y="356"><tspan fill="#e2e8f0">prompt = </tspan><tspan fill="#86efac">"كيف يدعم الذكاء الاصطناعي منظومة البحث العلمي الجامعي؟"</tspan></text>
        <text x="580" y="382"><tspan fill="#e2e8f0">inputs = tokenizer(prompt, return_tensors=</tspan><tspan fill="#fef08a">"pt"</tspan><tspan fill="#e2e8f0">).to(device)</tspan></text>
        <text x="580" y="408"><tspan fill="#e2e8f0">output = model.generate(**inputs, max_new_tokens=</tspan><tspan fill="#f97316">150</tspan><tspan fill="#e2e8f0">, temperature=</tspan><tspan fill="#f97316">0.7</tspan><tspan fill="#e2e8f0">)</tspan></text>
        <text x="580" y="434"><tspan fill="#e2e8f0">response = tokenizer.decode(output[</tspan><tspan fill="#f97316">0</tspan><tspan fill="#e2e8f0">], skip_special_tokens=</tspan><tspan fill="#c084fc">True</tspan><tspan fill="#e2e8f0">)</tspan></text>
        <text x="580" y="460"><tspan fill="#67e8f9">print</tspan><tspan fill="#e2e8f0">(response)</tspan></text>
      </g>

      <!-- Terminal / Runtime Status Bar at Bottom -->
      <rect x="506" y="506" width="1160" height="59" fill="#090f1d"/>
      <line x1="506" y1="506" x2="1666" y2="506" stroke="#1e293b" stroke-width="1.5"/>
      <g fill="#38bdf8" font-family="'Consolas', monospace" font-size="12.5">
        <text x="526" y="528">[STATUS: MODEL LOADED]</text>
        <text x="730" y="528">CUDA DEVICE: 0 (NVIDIA RTX)</text>
        <text x="1000" y="528">LOSS: 0.0418</text>
        <text x="1140" y="528">INFERENCE LATENCY: 38ms/tok</text>
        <text x="1420" y="528" fill="#4ade80">MEMORY: 6.2GB / 16GB</text>
      </g>
      <text x="526" y="550" fill="#94a3b8" font-family="'Consolas', monospace" font-size="12">&gt; python ai_pipeline.py --eval-mode=academic --strict-citations=true [EXECUTION SUCCESSFUL]</text>
    `,
  },
  {
    key: 'cyber-awareness',
    titleEn: 'Cybersecurity Awareness Workshop',
    titleAr: 'ورشة التوعية بالأمن السيبراني',
    topicLabel: 'NETWORK DEFENSE & THREAT MITIGATION CONSOLE',
    bgStart: '#040d16',
    bgEnd: '#071828',
    windowTitle: 'Enterprise Security Console — Threat Defense & Identity Protection v4.2',
    accent: '#10b981',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#0b1322" stroke="#1e293b" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#132338"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#94a3b8" font-family="'Consolas', monospace" font-size="14" text-anchor="middle">Security Console — Active Threat Defense &amp; Identity Protection v4.2</text>

      <!-- 3 Metrics Cards -->
      <g transform="translate(526, 126)">
        <!-- Metric 1 -->
        <rect width="360" height="68" rx="8" fill="#0f1f33" stroke="#10b981" stroke-width="1.5"/>
        <text x="16" y="26" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="600">FIREWALL &amp; ENDPOINT STATUS</text>
        <text x="16" y="52" fill="#34d399" font-family="'Consolas', monospace" font-size="17" font-weight="700">ACTIVE &amp; MONITORED</text>
        <circle cx="330" cy="34" r="8" fill="#10b981"/>

        <!-- Metric 2 -->
        <rect x="380" width="360" height="68" rx="8" fill="#0f1f33" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="396" y="26" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="600">AUTHENTICATION (MFA / 2FA)</text>
        <text x="396" y="52" fill="#38bdf8" font-family="'Consolas', monospace" font-size="17" font-weight="700">100% ENFORCED (ZERO-TRUST)</text>
        <circle cx="710" cy="34" r="8" fill="#38bdf8"/>

        <!-- Metric 3 -->
        <rect x="760" width="360" height="68" rx="8" fill="#0f1f33" stroke="#f59e0b" stroke-width="1.5"/>
        <text x="776" y="26" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="600">INCIDENT THREAT LEVEL</text>
        <text x="776" y="52" fill="#fbbf24" font-family="'Consolas', monospace" font-size="17" font-weight="700">LOW (0 CRITICAL BREACHES)</text>
        <circle cx="1090" cy="34" r="8" fill="#f59e0b"/>
      </g>

      <!-- Live Security Log Table -->
      <g transform="translate(526, 212)">
        <rect width="1120" height="280" rx="8" fill="#080f1a" stroke="#1e293b" stroke-width="1.5"/>
        <!-- Table Header -->
        <rect width="1120" height="36" rx="8" fill="#111d2e"/>
        <text x="20" y="23" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">TIMESTAMP</text>
        <text x="180" y="23" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">PROTOCOL / SERVICE</text>
        <text x="440" y="23" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">SOURCE IP / IDENTIFIER</text>
        <text x="750" y="23" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">SECURITY ACTION TAKEN</text>
        <text x="1000" y="23" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">STATUS</text>

        <!-- Row 1 -->
        <g transform="translate(0, 36)" font-family="'Consolas', monospace" font-size="13">
          <text x="20" y="28" fill="#94a3b8">10:14:02.148</text>
          <text x="180" y="28" fill="#38bdf8">HTTPS / TLS 1.3</text>
          <text x="440" y="28" fill="#e2e8f0">portal.iu.edu.sa [Student Auth]</text>
          <text x="750" y="28" fill="#34d399">MFA Multi-Factor Token Verified</text>
          <rect x="1000" y="12" width="75" height="22" rx="4" fill="#065f46"/>
          <text x="1012" y="28" fill="#34d399" font-weight="700">PASSED</text>
        </g>
        <line x1="0" y1="76" x2="1120" y2="76" stroke="#1e293b"/>

        <!-- Row 2 -->
        <g transform="translate(0, 76)" font-family="'Consolas', monospace" font-size="13">
          <text x="20" y="28" fill="#94a3b8">10:12:45.902</text>
          <text x="180" y="28" fill="#f87171">SMTP Phishing Filter</text>
          <text x="440" y="28" fill="#fca5a5">mail.login-verify-account.xyz</text>
          <text x="750" y="28" fill="#f87171">Malicious Link Quarantined &amp; Dropped</text>
          <rect x="1000" y="12" width="75" height="22" rx="4" fill="#7f1d1d"/>
          <text x="1008" y="28" fill="#fca5a5" font-weight="700">BLOCKED</text>
        </g>
        <line x1="0" y1="116" x2="1120" y2="116" stroke="#1e293b"/>

        <!-- Row 3 -->
        <g transform="translate(0, 116)" font-family="'Consolas', monospace" font-size="13">
          <text x="20" y="28" fill="#94a3b8">10:10:11.320</text>
          <text x="180" y="28" fill="#fbbf24">SSH Port Audit</text>
          <text x="440" y="28" fill="#e2e8f0">Port 22 / Authorized Key Ring</text>
          <text x="750" y="28" fill="#34d399">Key-Based Authentication Confirmed</text>
          <rect x="1000" y="12" width="75" height="22" rx="4" fill="#065f46"/>
          <text x="1012" y="28" fill="#34d399" font-weight="700">PASSED</text>
        </g>
        <line x1="0" y1="156" x2="1120" y2="156" stroke="#1e293b"/>

        <!-- Row 4 -->
        <g transform="translate(0, 156)" font-family="'Consolas', monospace" font-size="13">
          <text x="20" y="28" fill="#94a3b8">10:07:54.018</text>
          <text x="180" y="28" fill="#c084fc">Credential Vault</text>
          <text x="440" y="28" fill="#e2e8f0">Hash Verification: SHA-256 + Salt</text>
          <text x="750" y="28" fill="#34d399">Zero Plaintext / Strong Complexity Met</text>
          <rect x="1000" y="12" width="75" height="22" rx="4" fill="#065f46"/>
          <text x="1012" y="28" fill="#34d399" font-weight="700">PASSED</text>
        </g>
        <line x1="0" y1="196" x2="1120" y2="196" stroke="#1e293b"/>

        <!-- Summary Footer -->
        <rect y="235" width="1120" height="45" rx="8" fill="#0b1728"/>
        <text x="20" y="262" fill="#34d399" font-family="'Consolas', monospace" font-size="13">&gt; [DEFENSE AUDIT COMPLETE]: 12,480 Network Events Inspected | Zero Credential Compromises</text>
      </g>
    `,
  },
  {
    key: 'research-innovation',
    titleEn: 'University Innovation Forum',
    titleAr: 'ملتقى الابتكار الجامعي',
    topicLabel: 'ACADEMIC RESEARCH & PROTOTYPE VALIDATION',
    bgStart: '#02160d',
    bgEnd: '#06331e',
    windowTitle: 'Academic Research & Innovation Lab — Project Milestone & Prototype Tracker',
    accent: '#fbbf24',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#061e14" stroke="#084b2f" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#083823"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#86efac" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Academic Research &amp; Innovation Lab — Project Milestone &amp; Prototype Tracker</text>

      <!-- Innovation Pipeline Stages Bar -->
      <g transform="translate(526, 126)">
        <rect width="1120" height="52" rx="8" fill="#032517" stroke="#084b2f" stroke-width="1.5"/>
        <g font-family="'Cairo', system-ui" font-size="13.5" font-weight="700">
          <text x="40" y="32" fill="#34d399">1. بلورة الفكرة والبحث الأدبي ✓</text>
          <text x="320" y="32" fill="#34d399">2. بناء النموذج المخبري (Prototype) ✓</text>
          <text x="660" y="32" fill="#fbbf24">3. التقييم الميداني والتحكيم الأكاديمي ●</text>
          <text x="960" y="32" fill="#94a3b8">4. براءة الاختراع والنشر</text>
        </g>
      </g>

      <!-- Project Showcase Cards (2 Columns) -->
      <g transform="translate(526, 194)">
        <!-- Project 1 Card -->
        <rect width="545" height="195" rx="8" fill="#04281a" stroke="#10b981" stroke-width="1.5"/>
        <text x="24" y="35" fill="#fde047" font-family="'Cairo', system-ui" font-size="17" font-weight="800">مشروع 1: نظام التحليل الذكي لمصادر الطاقة الجامعية</text>
        <text x="24" y="62" fill="#a7f3d0" font-family="system-ui" font-size="13">مجال البحث: الهندسة التطبيقية وإنترنت الأشياء (IoT)</text>
        <text x="24" y="85" fill="#e2e8f0" font-family="system-ui" font-size="13">نسبة إنجاز النموذج الأولي: 94% | التجارب المخبرية: 18 جلسة ناجحة</text>
        <!-- Progress bar -->
        <rect x="24" y="102" width="497" height="10" rx="5" fill="#083823"/>
        <rect x="24" y="102" width="467" height="10" rx="5" fill="#10b981"/>
        <text x="24" y="140" fill="#94a3b8" font-family="'Consolas', monospace" font-size="12">الملكية الفكرية: إيداع رسمي برقم (IU-PAT-2026-04)</text>
        <text x="24" y="165" fill="#34d399" font-family="'Cairo', system-ui" font-size="13" font-weight="700">جاهز للعرض أمام لجنة الابتكار والتحكيم الأكاديمي</text>

        <!-- Project 2 Card -->
        <rect x="575" width="545" height="195" rx="8" fill="#04281a" stroke="#084b2f" stroke-width="1.5"/>
        <text x="599" y="35" fill="#fde047" font-family="'Cairo', system-ui" font-size="17" font-weight="800">مشروع 2: منصة التوثيق وحفظ التراث الرقمي بالمدينة</text>
        <text x="599" y="62" fill="#a7f3d0" font-family="system-ui" font-size="13">مجال البحث: نظم المعلومات وعلوم البيانات المعرفية</text>
        <text x="599" y="85" fill="#e2e8f0" font-family="system-ui" font-size="13">نسبة إنجاز النموذج الأولي: 88% | الدقة المعيارية: 96.5%</text>
        <!-- Progress bar -->
        <rect x="599" y="102" width="497" height="10" rx="5" fill="#083823"/>
        <rect x="599" y="102" width="437" height="10" rx="5" fill="#fbbf24"/>
        <text x="599" y="140" fill="#94a3b8" font-family="'Consolas', monospace" font-size="12">التكامل المجتمعي: شراكة معرفية مع مركز دراسات المدينة</text>
        <text x="599" y="165" fill="#fbbf24" font-family="'Cairo', system-ui" font-size="13" font-weight="700">مرحلة الفحص التجريبي النهائي وقياس الأثر</text>
      </g>

      <!-- Bottom Metrics Ribbon -->
      <g transform="translate(526, 405)">
        <rect width="1120" height="70" rx="8" fill="#032517" stroke="#084b2f" stroke-width="1.5"/>
        <text x="30" y="32" fill="#fde047" font-family="'Consolas', monospace" font-size="14" font-weight="700">LAB METRICS: 48 Registered Student Projects</text>
        <text x="460" y="32" fill="#34d399" font-family="'Consolas', monospace" font-size="14" font-weight="700">12 Working Prototypes</text>
        <text x="760" y="32" fill="#67e8f9" font-family="'Consolas', monospace" font-size="14" font-weight="700">8 Faculty Research Mentors</text>
        <text x="30" y="55" fill="#a7f3d0" font-family="'Cairo', system-ui" font-size="13">معايير التحكيم: الابتكار الأصيل (35%)، الجدوى التقنية (30%)، الأثر المجتمعي (20%)، جودة العرض (15%)</text>
      </g>
    `,
  },
  {
    key: 'cloud-fundamentals',
    titleEn: 'Cloud Computing Workshop',
    titleAr: 'ورشة الحوسبة السحابية',
    topicLabel: 'CLOUD INFRASTRUCTURE ARCHITECTURE & KUBERNETES CONSOLE',
    bgStart: '#040d1a',
    bgEnd: '#0a1d36',
    windowTitle: 'Cloud Infrastructure Console — Multi-Region Kubernetes & Virtual Instances',
    accent: '#38bdf8',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#0b172a" stroke="#1e293b" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#132742"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#94a3b8" font-family="'Consolas', monospace" font-size="14" text-anchor="middle">Cloud Infrastructure Console — Cluster Overview &amp; VPC Networks (Riyadh me-central-1)</text>

      <!-- 4 Cloud Metrics KPI Widgets -->
      <g transform="translate(526, 126)">
        <rect width="265" height="66" rx="8" fill="#0f223d" stroke="#0284c7" stroke-width="1.5"/>
        <text x="16" y="24" fill="#94a3b8" font-family="system-ui" font-size="11" font-weight="700">COMPUTE / K8S PODS</text>
        <text x="16" y="48" fill="#38bdf8" font-family="'Consolas', monospace" font-size="16" font-weight="700">8 NODES (32 vCPU)</text>

        <rect x="285" width="265" height="66" rx="8" fill="#0f223d" stroke="#0284c7" stroke-width="1.5"/>
        <text x="301" y="24" fill="#94a3b8" font-family="system-ui" font-size="11" font-weight="700">OBJECT STORAGE (S3)</text>
        <text x="301" y="48" fill="#38bdf8" font-family="'Consolas', monospace" font-size="16" font-weight="700">2.8 TB (AES-256)</text>

        <rect x="570" width="265" height="66" rx="8" fill="#0f223d" stroke="#10b981" stroke-width="1.5"/>
        <text x="586" y="24" fill="#94a3b8" font-family="system-ui" font-size="11" font-weight="700">CLUSTER UPTIME SLA</text>
        <text x="586" y="48" fill="#34d399" font-family="'Consolas', monospace" font-size="16" font-weight="700">99.99% AVAILABLE</text>

        <rect x="855" width="265" height="66" rx="8" fill="#0f223d" stroke="#c084fc" stroke-width="1.5"/>
        <text x="871" y="24" fill="#94a3b8" font-family="system-ui" font-size="11" font-weight="700">NETWORK LATENCY</text>
        <text x="871" y="48" fill="#c084fc" font-family="'Consolas', monospace" font-size="16" font-weight="700">14ms REGIONAL</text>
      </g>

      <!-- Cloud Topology & Service Nodes Grid -->
      <g transform="translate(526, 208)">
        <rect width="1120" height="275" rx="8" fill="#081322" stroke="#1e293b" stroke-width="1.5"/>
        <rect width="1120" height="34" rx="8" fill="#102038"/>
        <text x="24" y="22" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">INSTANCE NAME</text>
        <text x="250" y="22" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">ZONE</text>
        <text x="390" y="22" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">IP ADDRESS / VPC</text>
        <text x="640" y="22" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">AUTOSCALING CPU LOAD</text>
        <text x="960" y="22" fill="#64748b" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">HEALTH</text>

        <!-- Node 1 -->
        <g transform="translate(0, 34)" font-family="'Consolas', monospace" font-size="13">
          <text x="24" y="26" fill="#e2e8f0">iu-web-cluster-prod-01</text>
          <text x="250" y="26" fill="#94a3b8">me-central-1a</text>
          <text x="390" y="26" fill="#38bdf8">10.0.1.14 (Private)</text>
          <rect x="640" y="14" width="220" height="12" rx="4" fill="#1e293b"/>
          <rect x="640" y="14" width="88" height="12" rx="4" fill="#38bdf8"/>
          <text x="870" y="25" fill="#94a3b8" font-size="11">40%</text>
          <rect x="960" y="10" width="80" height="20" rx="4" fill="#065f46"/>
          <text x="975" y="24" fill="#34d399" font-weight="700">HEALTHY</text>
        </g>
        <line x1="0" y1="70" x2="1120" y2="70" stroke="#1e293b"/>

        <!-- Node 2 -->
        <g transform="translate(0, 70)" font-family="'Consolas', monospace" font-size="13">
          <text x="24" y="26" fill="#e2e8f0">iu-web-cluster-prod-02</text>
          <text x="250" y="26" fill="#94a3b8">me-central-1b</text>
          <text x="390" y="26" fill="#38bdf8">10.0.1.18 (Private)</text>
          <rect x="640" y="14" width="220" height="12" rx="4" fill="#1e293b"/>
          <rect x="640" y="14" width="75" height="12" rx="4" fill="#38bdf8"/>
          <text x="870" y="25" fill="#94a3b8" font-size="11">34%</text>
          <rect x="960" y="10" width="80" height="20" rx="4" fill="#065f46"/>
          <text x="975" y="24" fill="#34d399" font-weight="700">HEALTHY</text>
        </g>
        <line x1="0" y1="106" x2="1120" y2="106" stroke="#1e293b"/>

        <!-- Node 3 -->
        <g transform="translate(0, 106)" font-family="'Consolas', monospace" font-size="13">
          <text x="24" y="26" fill="#e2e8f0">iu-api-gateway-k8s</text>
          <text x="250" y="26" fill="#94a3b8">me-central-1a</text>
          <text x="390" y="26" fill="#38bdf8">10.0.2.05 (Public LB)</text>
          <rect x="640" y="14" width="220" height="12" rx="4" fill="#1e293b"/>
          <rect x="640" y="14" width="114" height="12" rx="4" fill="#38bdf8"/>
          <text x="870" y="25" fill="#94a3b8" font-size="11">52%</text>
          <rect x="960" y="10" width="80" height="20" rx="4" fill="#065f46"/>
          <text x="975" y="24" fill="#34d399" font-weight="700">HEALTHY</text>
        </g>
        <line x1="0" y1="142" x2="1120" y2="142" stroke="#1e293b"/>

        <!-- Node 4 -->
        <g transform="translate(0, 142)" font-family="'Consolas', monospace" font-size="13">
          <text x="24" y="26" fill="#e2e8f0">iu-db-postgres-master</text>
          <text x="250" y="26" fill="#94a3b8">me-central-1a</text>
          <text x="390" y="26" fill="#38bdf8">10.0.3.10 (Isolated DB)</text>
          <rect x="640" y="14" width="220" height="12" rx="4" fill="#1e293b"/>
          <rect x="640" y="14" width="62" height="12" rx="4" fill="#38bdf8"/>
          <text x="870" y="25" fill="#94a3b8" font-size="11">28%</text>
          <rect x="960" y="10" width="80" height="20" rx="4" fill="#065f46"/>
          <text x="975" y="24" fill="#34d399" font-weight="700">HEALTHY</text>
        </g>
        <line x1="0" y1="178" x2="1120" y2="178" stroke="#1e293b"/>

        <!-- Console Message -->
        <rect y="215" width="1120" height="60" rx="8" fill="#0c192c"/>
        <text x="24" y="245" fill="#38bdf8" font-family="'Consolas', monospace" font-size="13">&gt; kubectl get pods -n production: 12/12 Pods Running | Ingress Controller: Zero Dropped Connections</text>
      </g>
    `,
  },
  {
    key: 'career-workshop',
    titleEn: 'Career Preparation Workshop',
    titleAr: 'ورشة الاستعداد لسوق العمل',
    topicLabel: 'ATS RESUME OPTIMIZATION & INTERVIEW READINESS',
    bgStart: '#0d0c22',
    bgEnd: '#1a183b',
    windowTitle: 'Career Readiness & ATS Resume Optimization Workbench',
    accent: '#818cf8',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#11102b" stroke="#312e81" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#1e1b4b"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Professional Resume &amp; ATS Career Readiness Audit System</text>

      <!-- Two-Column Layout: Left Resume Preview, Right ATS Scorecard -->
      <g transform="translate(526, 126)">
        <!-- Left: Realistic CV Preview Box -->
        <rect width="520" height="350" rx="8" fill="#ffffff" stroke="#c7d2fe" stroke-width="2"/>
        <g transform="translate(24, 24)">
          <!-- CV Header -->
          <text x="0" y="20" fill="#1e1b4b" font-family="'Cairo', system-ui" font-size="18" font-weight="800">عبدالله محمد الجهني</text>
          <text x="0" y="38" fill="#4338ca" font-family="system-ui" font-size="12" font-weight="600">مهندس برمجيات ونظم حاسوبية | بكالوريوس علوم الحاسب (مرتبة شرف)</text>
          <text x="0" y="54" fill="#64748b" font-family="'Consolas', monospace" font-size="11">المدينة المنورة، المملكة العربية السعودية | linkedin.com/in/ajohani | github.com/ajohani</text>
          <line x1="0" y1="65" x2="472" y2="65" stroke="#e0e7ff" stroke-width="1.5"/>

          <!-- Section 1 -->
          <text x="0" y="85" fill="#312e81" font-family="system-ui" font-size="13" font-weight="700">TECHNICAL COMPETENCIES &amp; SKILLS</text>
          <g transform="translate(0, 95)" font-family="system-ui" font-size="11">
            <rect width="68" height="20" rx="4" fill="#e0e7ff"/>
            <text x="8" y="14" fill="#3730a3">Python 3</text>
            <rect x="74" width="78" height="20" rx="4" fill="#e0e7ff"/>
            <text x="82" y="14" fill="#3730a3">PostgreSQL</text>
            <rect x="158" width="60" height="20" rx="4" fill="#e0e7ff"/>
            <text x="166" y="14" fill="#3730a3">FastAPI</text>
            <rect x="224" width="60" height="20" rx="4" fill="#e0e7ff"/>
            <text x="232" y="14" fill="#3730a3">Docker</text>
            <rect x="290" width="78" height="20" rx="4" fill="#e0e7ff"/>
            <text x="298" y="14" fill="#3730a3">Git Workflow</text>
          </g>

          <!-- Section 2 -->
          <text x="0" y="142" fill="#312e81" font-family="system-ui" font-size="13" font-weight="700">PROFESSIONAL EXPERIENCE &amp; PROJECTS</text>
          <text x="0" y="162" fill="#1e1b4b" font-family="system-ui" font-size="12" font-weight="700">قائد فريق مشروع التخرج — منصة إدارة الفعاليات الجامعية</text>
          <text x="0" y="178" fill="#475569" font-family="system-ui" font-size="11.5">• تصميم بنية معمارية سحابية قابلة للتوسع باستخدام PostgreSQL وخدمات الويب المصغرة.</text>
          <text x="0" y="194" fill="#475569" font-family="system-ui" font-size="11.5">• تطوير دورة عمل الحجز والتسجيل الآلي وإصدار التذاكر المعتمدة برمز QR مشفر.</text>
          <text x="0" y="210" fill="#475569" font-family="system-ui" font-size="11.5">• إنجاز اختبارات التحقق الشاملة (E2E Playwright) بنسبة نجاح 100% لكافة المسارات.</text>

          <!-- Section 3 -->
          <text x="0" y="238" fill="#312e81" font-family="system-ui" font-size="13" font-weight="700">PROFESSIONAL ACCREDITATION &amp; HONORS</text>
          <text x="0" y="258" fill="#1e1b4b" font-family="system-ui" font-size="12">• جائزة التميز في الابتكار التقني — كلية الحاسب الآلي 2026</text>
          <text x="0" y="274" fill="#1e1b4b" font-family="system-ui" font-size="12">• 140 ساعة عمل تطوعي معتمدة في الدعم التقني والتطوير المؤسسي</text>
        </g>

        <!-- Right: ATS Audit Scorecard -->
        <g transform="translate(545, 0)">
          <rect width="575" height="350" rx="8" fill="#1e1b4b" stroke="#4338ca" stroke-width="1.5"/>
          <g transform="translate(24, 24)">
            <text x="0" y="20" fill="#a5b4fc" font-family="system-ui" font-size="13" font-weight="700">ATS SCANNER COMPLIANCE RATING</text>
            <text x="0" y="60" fill="#34d399" font-family="'Consolas', monospace" font-size="38" font-weight="800">98% [MATCH]</text>
            <text x="0" y="85" fill="#c7d2fe" font-family="system-ui" font-size="13">درجة تطابق استثنائية مع معايير أنظمة الفرز الوظيفي الآلي</text>

            <!-- Checklist -->
            <g transform="translate(0, 110)" font-family="system-ui" font-size="13">
              <text x="0" y="20" fill="#34d399">✓ صياغة واضحة للعناوين القياسية (Standard Section Headings)</text>
              <text x="0" y="48" fill="#34d399">✓ استخدام الأفعال الإجرائية والنتائج الرقمية القابلة للقياس</text>
              <text x="0" y="76" fill="#34d399">✓ التوافق الدلالي مع الكلمات المفتاحية في قطاع التوظيف التقني</text>
              <text x="0" y="104" fill="#34d399">✓ خلو المستند من الجداول المعقدة أو الرموز المسببة لأخطاء الفرز</text>
              <text x="0" y="132" fill="#fbbf24">● جاهزية المقابلات الشخصية (STAR Method Prepared)</text>
            </g>

            <!-- Bottom Target Roles -->
            <rect y="260" width="527" height="42" rx="6" fill="#312e81"/>
            <text x="16" y="286" fill="#e0e7ff" font-family="'Cairo', system-ui" font-size="13" font-weight="700">المسار المستهدف: مهندس برمجيات / مطور نظم سحابية / محلل حلول تقنية</text>
          </g>
        </g>
      </g>
    `,
  },
  {
    key: 'student-volunteering',
    titleEn: 'Student Volunteering Initiative',
    titleAr: 'مبادرة التطوع الطلابي',
    topicLabel: 'CAMPUS CIVIC ENGAGEMENT & VOLUNTEERING PLATFORM',
    bgStart: '#1a050e',
    bgEnd: '#330a1b',
    windowTitle: 'Student Volunteering Platform — Islamic University of Madinah',
    accent: '#fb7185',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#200612" stroke="#4c0519" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#3b081e"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#fecdd3" font-family="'Cairo', system-ui" font-size="14" font-weight="700" text-anchor="middle">بوابة العمل التطوعي الجامعي — الجامعة الإسلامية بالمدينة المنورة</text>

      <!-- 3 Metrics Ribbon -->
      <g transform="translate(526, 126)">
        <rect width="360" height="66" rx="8" fill="#2c0818" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="20" y="25" fill="#fda4af" font-family="'Cairo', system-ui" font-size="12" font-weight="600">إجمالي الساعات التطوعية الموثقة</text>
        <text x="20" y="52" fill="#ffffff" font-family="'Consolas', monospace" font-size="20" font-weight="800">4,850+ ساعة معتمدة</text>

        <rect x="380" width="360" height="66" rx="8" fill="#2c0818" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="400" y="25" fill="#fda4af" font-family="'Cairo', system-ui" font-size="12" font-weight="600">الطلبة المتطوعون النشطون</text>
        <text x="400" y="52" fill="#ffffff" font-family="'Consolas', monospace" font-size="20" font-weight="800">420 طالباً مسجلاً</text>

        <rect x="760" width="360" height="66" rx="8" fill="#2c0818" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="780" y="25" fill="#fde047" font-family="'Cairo', system-ui" font-size="12" font-weight="600">المبادرات والمشاريع المعتمدة</text>
        <text x="780" y="52" fill="#ffffff" font-family="'Consolas', monospace" font-size="20" font-weight="800">18 مبادرة مجتمعية</text>
      </g>

      <!-- Active Volunteering Initiatives Table -->
      <g transform="translate(526, 208)">
        <rect width="1120" height="275" rx="8" fill="#17040d" stroke="#3b081e" stroke-width="1.5"/>
        <rect width="1120" height="34" rx="8" fill="#290717"/>
        <text x="24" y="22" fill="#fda4af" font-family="'Cairo', system-ui" font-size="13" font-weight="700">اسم الفرصة التطوعية</text>
        <text x="420" y="22" fill="#fda4af" font-family="'Cairo', system-ui" font-size="13" font-weight="700">المجال / الجهة المنظمة</text>
        <text x="700" y="22" fill="#fda4af" font-family="'Cairo', system-ui" font-size="13" font-weight="700">الساعات المعتمدة</text>
        <text x="960" y="22" fill="#fda4af" font-family="'Cairo', system-ui" font-size="13" font-weight="700">الحالة</text>

        <!-- Row 1 -->
        <g transform="translate(0, 34)" font-family="'Cairo', system-ui" font-size="13.5">
          <text x="24" y="26" fill="#ffffff" font-weight="700">خدمة ضيوف الرحمن وزوار المسجد النبوي</text>
          <text x="420" y="26" fill="#fecdd3">المسؤولية المجتمعية والخدمات الميدانية</text>
          <text x="700" y="26" fill="#fde047" font-weight="700">120 ساعة</text>
          <rect x="960" y="9" width="80" height="22" rx="4" fill="#065f46"/>
          <text x="980" y="25" fill="#34d399" font-weight="700">جارية</text>
        </g>
        <line x1="0" y1="70" x2="1120" y2="70" stroke="#290717"/>

        <!-- Row 2 -->
        <g transform="translate(0, 70)" font-family="'Cairo', system-ui" font-size="13.5">
          <text x="24" y="26" fill="#ffffff" font-weight="700">برنامج الإرشاد الأكاديمي ودعم الطلاب الجدد</text>
          <text x="420" y="26" fill="#fecdd3">عمادة شؤون الطلاب والأندية الطلابية</text>
          <text x="700" y="26" fill="#fde047" font-weight="700">85 ساعة</text>
          <rect x="960" y="9" width="80" height="22" rx="4" fill="#065f46"/>
          <text x="975" y="25" fill="#34d399" font-weight="700">مكتملة</text>
        </g>
        <line x1="0" y1="106" x2="1120" y2="106" stroke="#290717"/>

        <!-- Row 3 -->
        <g transform="translate(0, 106)" font-family="'Cairo', system-ui" font-size="13.5">
          <text x="24" y="26" fill="#ffffff" font-weight="700">مبادرة الحرم الجامعي الأخضر وحماية البيئة</text>
          <text x="420" y="26" fill="#fecdd3">نادي أصدقاء البيئة والأنشطة الطلابية</text>
          <text x="700" y="26" fill="#fde047" font-weight="700">60 ساعة</text>
          <rect x="960" y="9" width="80" height="22" rx="4" fill="#065f46"/>
          <text x="980" y="25" fill="#34d399" font-weight="700">جارية</text>
        </g>
        <line x1="0" y1="142" x2="1120" y2="142" stroke="#290717"/>

        <!-- Row 4 -->
        <g transform="translate(0, 142)" font-family="'Cairo', system-ui" font-size="13.5">
          <text x="24" y="26" fill="#ffffff" font-weight="700">التنظيم والدعم التقني للمؤتمرات الجامعية</text>
          <text x="420" y="26" fill="#fecdd3">إدارة تقنية المعلومات وتنظيم الفعاليات</text>
          <text x="700" y="26" fill="#fde047" font-weight="700">90 ساعة</text>
          <rect x="960" y="9" width="80" height="22" rx="4" fill="#1e3a8a"/>
          <text x="978" y="25" fill="#93c5fd" font-weight="700">معتمدة</text>
        </g>
        <line x1="0" y1="178" x2="1120" y2="178" stroke="#290717"/>

        <!-- Accreditation Footer Note -->
        <rect y="215" width="1120" height="60" rx="8" fill="#200612"/>
        <text x="24" y="250" fill="#34d399" font-family="'Cairo', system-ui" font-size="13" font-weight="700">✓ التوثيق المعتمد: تُسجل كافة الساعات والشهادات المكتسبة بصورة آلية وموثوقة ضمن السجل المهاري للطالب.</text>
      </g>
    `,
  },
  {
    key: 'digital-forensics',
    titleEn: 'Digital Forensics Seminar',
    titleAr: 'ندوة الأدلة الجنائية الرقمية',
    topicLabel: 'DIGITAL FORENSICS WORKBENCH & INTEGRITY HASH AUDIT',
    bgStart: '#040914',
    bgEnd: '#081728',
    windowTitle: 'Digital Forensics Workbench — Disk Image Analysis & Cryptographic Integrity Suite',
    accent: '#00f5d4',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#09131f" stroke="#1e293b" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#0f1f33"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#94a3b8" font-family="'Consolas', monospace" font-size="14" text-anchor="middle">Digital Forensics Workbench — Disk Image Analysis &amp; Chain of Custody Audit Suite</text>

      <!-- Evidence Case Header -->
      <g transform="translate(526, 126)">
        <rect width="1120" height="66" rx="8" fill="#0d1b2a" stroke="#00f5d4" stroke-width="1.5"/>
        <text x="24" y="26" fill="#94a3b8" font-family="'Consolas', monospace" font-size="12">CASE IDENTIFIER: IU-DF-2026-0814</text>
        <text x="350" y="26" fill="#94a3b8" font-family="'Consolas', monospace" font-size="12">ACQUISITION: Bit-Stream Raw Image (/dev/nvme0n1)</text>
        <text x="820" y="26" fill="#34d399" font-family="'Consolas', monospace" font-size="12" font-weight="700">WRITE-BLOCKER: HARDWARE ENFORCED</text>

        <!-- Cryptographic Hashes -->
        <text x="24" y="50" fill="#00f5d4" font-family="'Consolas', monospace" font-size="12.5" font-weight="700">SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 [VERIFIED MATCH ✓]</text>
        <text x="820" y="50" fill="#34d399" font-family="'Consolas', monospace" font-size="12.5">MD5: d41d8cd98f00b204e9800998ecf8427e</text>
      </g>

      <!-- Forensic Analysis Panes (Hex View + Artifact Timeline) -->
      <g transform="translate(526, 208)">
        <!-- Left Hex Editor View -->
        <rect width="640" height="275" rx="8" fill="#050c14" stroke="#1e293b" stroke-width="1.5"/>
        <rect width="640" height="32" rx="8" fill="#0b1726"/>
        <text x="20" y="21" fill="#64748b" font-family="'Consolas', monospace" font-size="12" font-weight="700">OFFSET (HEX)   00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F   DECODED TEXT</text>

        <g font-family="'Consolas', monospace" font-size="11.5" fill="#94a3b8" xml:space="preserve">
          <text x="20" y="54"><tspan fill="#38bdf8">00000000: </tspan><tspan fill="#00f5d4">4D 5A </tspan>90 00 03 00 00 00  04 00 00 00 FF FF 00 00   <tspan fill="#34d399">MZ..............</tspan></text>
          <text x="20" y="74"><tspan fill="#38bdf8">00000010: </tspan>B8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00   ........@.......</text>
          <text x="20" y="94"><tspan fill="#38bdf8">00000020: </tspan>00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................</text>
          <text x="20" y="114"><tspan fill="#38bdf8">00000030: </tspan>00 00 00 00 00 00 00 00  00 00 00 00 80 00 00 00   ................</text>
          <text x="20" y="134"><tspan fill="#38bdf8">00000040: </tspan>0E 1F BA 0E 00 B4 09 CD  21 B8 01 4C CD 21 <tspan fill="#fde047">54 68</tspan>   ........!..L!.<tspan fill="#fde047">Th</tspan></text>
          <text x="20" y="154"><tspan fill="#38bdf8">00000050: </tspan><tspan fill="#fde047">69 73 20 70 72 6F 67 72  61 6D 20 63 61 6E 6E 6F</tspan>   <tspan fill="#fde047">is program canno</tspan></text>
          <text x="20" y="174"><tspan fill="#38bdf8">00000060: </tspan><tspan fill="#fde047">74 20 62 65 20 72 75 6E  20 69 6E 20 44 4F 53 20</tspan>   <tspan fill="#fde047">t be run in DOS </tspan></text>
          <text x="20" y="194"><tspan fill="#38bdf8">00000070: </tspan><tspan fill="#fde047">6D 6F 64 65 2E 0D 0D 0A  24 00 00 00 00 00 00 00</tspan>   <tspan fill="#fde047">mode....$.......</tspan></text>
          <text x="20" y="214"><tspan fill="#38bdf8">00000080: </tspan>50 45 00 00 4C 01 04 00  E4 84 8E 67 00 00 00 00   <tspan fill="#34d399">PE..L......g....</tspan></text>
          <text x="20" y="234"><tspan fill="#38bdf8">00000090: </tspan>00 00 00 00 E0 00 02 01  0B 01 0E 1E 00 30 01 00   .............0..</text>
          <text x="20" y="254"><tspan fill="#38bdf8">000000A0: </tspan>00 20 00 00 00 00 00 00  10 12 00 00 00 10 00 00   . ..............</text>
        </g>

        <!-- Right Timeline & Artifacts Pane -->
        <g transform="translate(660, 0)">
          <rect width="460" height="275" rx="8" fill="#081422" stroke="#1e293b" stroke-width="1.5"/>
          <rect width="460" height="32" rx="8" fill="#0f1f33"/>
          <text x="20" y="21" fill="#00f5d4" font-family="'Consolas', monospace" font-size="12" font-weight="700">ARTIFACT TIMELINE ANALYSIS (MFT / USN)</text>

          <g font-family="'Consolas', monospace" font-size="11.5" fill="#e2e8f0" transform="translate(16, 45)">
            <text x="0" y="18" fill="#38bdf8">[08:14:02 UTC] File Created: \System32\svc_auth.dll</text>
            <text x="0" y="38" fill="#fbbf24">• MFT Record 142088 Modified (RunKey Persistence)</text>
            <text x="0" y="65" fill="#38bdf8">[08:14:18 UTC] Process Execution Event 4688</text>
            <text x="0" y="85" fill="#e2e8f0">• Hash verified in NIST National Software Library</text>
            <text x="0" y="112" fill="#38bdf8">[08:14:45 UTC] Network Connection Socket Bound</text>
            <text x="0" y="132" fill="#f87171">• Outbound Connection Attempt Flagged &amp; Blocked</text>

            <!-- Bottom Chain of Custody Stamp -->
            <rect y="160" width="428" height="55" rx="6" fill="#07192b" stroke="#00f5d4" stroke-width="1"/>
            <text x="12" y="182" fill="#34d399" font-weight="700">CHAIN OF CUSTODY VERIFIED INTACT</text>
            <text x="12" y="202" fill="#94a3b8" font-size="11">Digital Evidence Handling Standard ISO/IEC 27037 Met</text>
          </g>
        </g>
      </g>
    `,
  },
  {
    key: 'entrepreneurship',
    titleEn: 'Entrepreneurship Forum',
    titleAr: 'ملتقى ريادة الأعمال',
    topicLabel: 'BUSINESS MODEL CANVAS & VENTURE METRICS',
    bgStart: '#110521',
    bgEnd: '#240a45',
    windowTitle: 'Startup Accelerator & Business Model Canvas Workbench (Seed Stage)',
    accent: '#f97316',
    renderWindow: () => `
      <rect x="506" y="70" width="1160" height="495" rx="12" fill="#17072d" stroke="#3b0764" stroke-width="2"/>
      <path d="M 506 82 A 12 12 0 0 1 518 70 L 1654 70 A 12 12 0 0 1 1666 82 L 1666 112 L 506 112 Z" fill="#2e0854"/>
      <circle cx="530" cy="91" r="6" fill="#ef4444"/>
      <circle cx="548" cy="91" r="6" fill="#f59e0b"/>
      <circle cx="566" cy="91" r="6" fill="#10b981"/>
      <text x="1086" y="96" fill="#e9d5ff" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Startup Accelerator &amp; Business Model Canvas Workbench (Seed Stage)</text>

      <!-- Business Model Canvas 3-Block Grid -->
      <g transform="translate(526, 126)">
        <!-- Block 1: Value Proposition -->
        <rect width="360" height="235" rx="8" fill="#220b3f" stroke="#a855f7" stroke-width="1.5"/>
        <text x="20" y="32" fill="#facc15" font-family="'Cairo', system-ui" font-size="16" font-weight="800">1. القيمة المقترحة (Value Proposition)</text>
        <g font-family="system-ui" font-size="12.5" fill="#f3e8ff" transform="translate(20, 52)">
          <text x="0" y="18">• منصة موحدة لإدارة الفعاليات الجامعية والتذاكر الرقمية</text>
          <text x="0" y="42">• أتمتة التحقق برمز الاستجابة السريعة (QR) في ثوانٍ</text>
          <text x="0" y="66">• لوحة تحليلات لحظية لبيانات الحضور والإيرادات والتقارير</text>
          <text x="0" y="90">• حماية قصوى للبيانات وسيادة معلوماتية كاملة محلياً</text>
          <rect y="115" width="320" height="48" rx="6" fill="#3b0764"/>
          <text x="12" y="145" fill="#fde047" font-weight="700">الميزة التنافسية: تجربة استخدام متكاملة باللغتين</text>
        </g>

        <!-- Block 2: Customer Segments -->
        <rect x="380" width="360" height="235" rx="8" fill="#220b3f" stroke="#a855f7" stroke-width="1.5"/>
        <text x="400" y="32" fill="#facc15" font-family="'Cairo', system-ui" font-size="16" font-weight="800">2. شرائح العملاء (Customer Segments)</text>
        <g font-family="system-ui" font-size="12.5" fill="#f3e8ff" transform="translate(400, 52)">
          <text x="0" y="18">• الجامعات ومؤسسات التعليم العالي الحكومية والأهلية</text>
          <text x="0" y="42">• الكليات والمعاهد ومراكز التدريب المهني المتخصصة</text>
          <text x="0" y="66">• الأندية الطلابية والجمعيات العلمية والمجتمعية</text>
          <text x="0" y="90">• منظمو المؤتمرات والمعارض الأكاديمية والمهنية</text>
          <rect y="115" width="320" height="48" rx="6" fill="#3b0764"/>
          <text x="12" y="145" fill="#fde047" font-weight="700">حجم السوق المستهدف: 65+ جامعة ومؤسسة تعليمية</text>
        </g>

        <!-- Block 3: Revenue Streams -->
        <rect x="760" width="360" height="235" rx="8" fill="#220b3f" stroke="#f97316" stroke-width="1.5"/>
        <text x="780" y="32" fill="#f97316" font-family="'Cairo', system-ui" font-size="16" font-weight="800">3. مصادر الإيرادات (Revenue Streams)</text>
        <g font-family="system-ui" font-size="12.5" fill="#f3e8ff" transform="translate(780, 52)">
          <text x="0" y="18">• اشتراكات سنوية مرنة للجامعات (B2B SaaS)</text>
          <text x="0" y="42">• رسوم رمزية على مبيعات التذاكر المدفوعة والملتقيات</text>
          <text x="0" y="66">• باقات مخصصة للتكامل السحابي والربط البرمجي (API)</text>
          <text x="0" y="90">• خدمات الدعم الفني وتخصيص البوابات المؤسسية</text>
          <rect y="115" width="320" height="48" rx="6" fill="#4c0519"/>
          <text x="12" y="145" fill="#fca5a5" font-weight="700">استدامة مالية: تدفق نقدي متكرر وهامش ربح 78%</text>
        </g>
      </g>

      <!-- Financial Unit Economics & Venture Metrics Bar -->
      <g transform="translate(526, 380)">
        <rect width="1120" height="95" rx="8" fill="#1b0733" stroke="#f97316" stroke-width="1.5"/>
        <g font-family="'Consolas', monospace" font-size="13.5" font-weight="700">
          <text x="30" y="35" fill="#facc15">CAC: 120 SAR</text>
          <text x="210" y="35" fill="#34d399">LTV: 2,800 SAR</text>
          <text x="410" y="35" fill="#38bdf8">LTV/CAC: 23.3x [SUPERIOR]</text>
          <text x="690" y="35" fill="#f43f5e">MONTHLY RUNWAY: 18 MONTHS</text>
          <text x="960" y="35" fill="#34d399">PITCH SCORE: 94/100</text>
        </g>
        <line x1="30" y1="52" x2="1090" y2="52" stroke="#3b0764"/>
        <text x="30" y="77" fill="#f3e8ff" font-family="'Cairo', system-ui" font-size="13">خطة النمو: التوسع لـ 5 جامعات خلال المرحلة الأولى، واستهداف نقطة التعادل المالي (Break-even) بحلول الشهر 14.</text>
      </g>
    `,
  },
];

async function main() {
  console.log(`Starting generation of ${COVERS.length} authentic subject-specific covers at ${WIDTH}x${HEIGHT}...`);
  const outputDir = path.resolve(__dirname, '../backend/resources/demo/covers');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const cover of COVERS) {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
        <defs>
          <linearGradient id="bg-${cover.key}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${cover.bgStart}"/>
            <stop offset="100%" stop-color="${cover.bgEnd}"/>
          </linearGradient>
          <radialGradient id="glow-${cover.key}" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stop-color="${cover.accent}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${cover.bgStart}" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Solid Background -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${cover.key})"/>
        <circle cx="1086" cy="320" r="500" fill="url(#glow-${cover.key})"/>

        <!-- Grid Lines for Technical Texture -->
        <g stroke="${cover.accent}" stroke-opacity="0.05" stroke-width="1.5">
          <line x1="0" y1="181" x2="${WIDTH}" y2="181"/>
          <line x1="0" y1="362" x2="${WIDTH}" y2="362"/>
          <line x1="0" y1="543" x2="${WIDTH}" y2="543"/>
          <line x1="506" y1="0" x2="506" y2="${HEIGHT}"/>
          <line x1="1666" y1="0" x2="1666" y2="${HEIGHT}"/>
        </g>

        <!-- The Authentic Realistic UI Window / Code Editor / Dashboard -->
        ${cover.renderWindow(cover)}

        <!-- Bottom Academic Subtitle Branding -->
        <g transform="translate(1086, 615)" text-anchor="middle">
          <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${cover.titleAr}</text>
          <text y="38" fill="${cover.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" letter-spacing="3">${cover.titleEn.toUpperCase()}</text>
        </g>
      </svg>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: #000; }
            svg { display: block; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'load' });
    const targetPath = path.join(outputDir, `gp2-${cover.key}.jpg`);
    await page.screenshot({
      path: targetPath,
      type: 'jpeg',
      quality: 96,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    const stat = fs.statSync(targetPath);
    console.log(`✓ Rendered ${path.basename(targetPath)} (${stat.size.toLocaleString()} bytes)`);
  }

  await browser.close();
  console.log('All 8 subject-specific covers rendered and saved successfully!');
}

main().catch((err) => {
  console.error('Failed to generate covers:', err);
  process.exit(1);
});
