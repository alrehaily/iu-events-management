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
    topicLabel: 'NEURAL NETWORKS & APPLIED MACHINE LEARNING',
    bgStart: '#040b19',
    bgEnd: '#091c38',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#07152d"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="glow-${c.key}" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.32"/>
          <stop offset="60%" stop-color="#0077b6" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#040b19" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="brain-grad-l" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f0ff"/>
          <stop offset="100%" stop-color="#0077b6"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#00f0ff" flood-opacity="0.4"/>
        </filter>
        <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="330" r="460" fill="url(#glow-${c.key})"/>

      <!-- Delicate Technical Coordinate Grid -->
      <g stroke="#00f0ff" stroke-opacity="0.07" stroke-width="1.5">
        <line x1="0" y1="181" x2="${WIDTH}" y2="181"/>
        <line x1="0" y1="362" x2="${WIDTH}" y2="362"/>
        <line x1="0" y1="543" x2="${WIDTH}" y2="543"/>
        <line x1="543" y1="0" x2="543" y2="${HEIGHT}"/>
        <line x1="1629" y1="0" x2="1629" y2="${HEIGHT}"/>
      </g>

      <!-- Corner Framing Brackets -->
      <g stroke="#00f0ff" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Left / Right Data Constellation Traces -->
      <g opacity="0.35">
        <path d="M 260 330 L 420 330 L 480 270 L 620 270" fill="none" stroke="#00f0ff" stroke-width="2" stroke-dasharray="4,6"/>
        <circle cx="260" cy="330" r="5" fill="#00f0ff"/>
        <circle cx="480" cy="270" r="4" fill="#00f0ff"/>
        <circle cx="620" cy="270" r="6" fill="#4361ee"/>

        <path d="M 360 480 L 520 480 L 580 420 L 700 420" fill="none" stroke="#00b4d8" stroke-width="2"/>
        <circle cx="360" cy="480" r="4" fill="#00b4d8"/>
        <circle cx="700" cy="420" r="5" fill="#00f0ff"/>

        <path d="M 1912 330 L 1752 330 L 1692 270 L 1552 270" fill="none" stroke="#7209b7" stroke-width="2" stroke-dasharray="4,6"/>
        <circle cx="1912" cy="330" r="5" fill="#7209b7"/>
        <circle cx="1692" cy="270" r="4" fill="#7209b7"/>
        <circle cx="1552" cy="270" r="6" fill="#00f0ff"/>

        <path d="M 1812 480 L 1652 480 L 1592 420 L 1472 420" fill="none" stroke="#4361ee" stroke-width="2"/>
        <circle cx="1812" cy="480" r="4" fill="#4361ee"/>
        <circle cx="1472" cy="420" r="5" fill="#7209b7"/>
      </g>

      <!-- Center AI Brain & Neural Synapse Core -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <!-- Concentric Neural Pulse Rings -->
        <circle cx="0" cy="0" r="235" fill="none" stroke="#00f0ff" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="6,8"/>
        <circle cx="0" cy="0" r="185" fill="none" stroke="#4361ee" stroke-opacity="0.18" stroke-width="1.5"/>
        <circle cx="0" cy="0" r="140" fill="none" stroke="#00f0ff" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="12,12"/>

        <!-- Central Microchip Core Processor -->
        <rect x="-42" y="-42" width="84" height="84" rx="14" fill="#050c1e" stroke="#00f0ff" stroke-width="3"/>
        <rect x="-24" y="-24" width="48" height="48" rx="8" fill="url(#brain-grad-l)" opacity="0.85"/>
        <circle cx="0" cy="0" r="9" fill="#ffffff" filter="url(#soft-glow)"/>

        <!-- Left Hemisphere Synaptic Nodes & Arcs -->
        <g stroke="#00f0ff" stroke-width="2.8" fill="none">
          <path d="M -42 -20 C -90 -70, -160 -60, -170 10 C -180 80, -120 130, -50 140 C -45 140, -42 120, -42 100" stroke-linecap="round"/>
          <path d="M -42 -40 C -80 -120, -150 -110, -150 -40 C -150 -20, -110 0, -50 0" stroke-linecap="round"/>
          <path d="M -90 -60 L -120 -20 L -80 30 L -120 70 L -60 90"/>
          <path d="M -130 20 L -60 20"/>
        </g>
        <g fill="#00f0ff">
          <circle cx="-170" cy="10" r="6"/>
          <circle cx="-150" cy="-40" r="5"/>
          <circle cx="-120" cy="-20" r="5.5"/>
          <circle cx="-90" cy="-60" r="6"/>
          <circle cx="-80" cy="30" r="5"/>
          <circle cx="-120" cy="70" r="6.5"/>
          <circle cx="-50" cy="140" r="6"/>
          <circle cx="-60" cy="90" r="5"/>
        </g>

        <!-- Right Hemisphere Synaptic Nodes & Arcs -->
        <g stroke="#a855f7" stroke-width="2.8" fill="none">
          <path d="M 42 -20 C 90 -70, 160 -60, 170 10 C 180 80, 120 130, 50 140 C 45 140, 42 120, 42 100" stroke-linecap="round"/>
          <path d="M 42 -40 C 80 -120, 150 -110, 150 -40 C 150 -20, 110 0, 50 0" stroke-linecap="round"/>
          <path d="M 90 -60 L 120 -20 L 80 30 L 120 70 L 60 90"/>
          <path d="M 130 20 L 60 20"/>
        </g>
        <g fill="#a855f7">
          <circle cx="170" cy="10" r="6"/>
          <circle cx="150" cy="-40" r="5"/>
          <circle cx="120" cy="-20" r="5.5"/>
          <circle cx="90" cy="-60" r="6"/>
          <circle cx="80" cy="30" r="5"/>
          <circle cx="120" cy="70" r="6.5"/>
          <circle cx="50" cy="140" r="6"/>
          <circle cx="60" cy="90" r="5"/>
        </g>

        <!-- High-Intensity Synaptic Sparks -->
        <circle cx="-105" cy="-40" r="3.5" fill="#ffffff"/>
        <circle cx="105" cy="-40" r="3.5" fill="#ffffff"/>
        <circle cx="-100" cy="50" r="3.5" fill="#ffffff"/>
        <circle cx="100" cy="50" r="3.5" fill="#ffffff"/>
      </g>

      <!-- Clean Centered Typography -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'cyber-awareness',
    titleEn: 'Cybersecurity Awareness Workshop',
    titleAr: 'ورشة التوعية بالأمن السيبراني',
    topicLabel: 'NETWORK SECURITY & THREAT MITIGATION',
    bgStart: '#060d19',
    bgEnd: '#0a1a2e',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#081424"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="glow-${c.key}" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.32"/>
          <stop offset="60%" stop-color="#047857" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#060d19" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="50%" stop-color="#059669"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
        <linearGradient id="lock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#a7f3d0"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#10b981" flood-opacity="0.4"/>
        </filter>
        <pattern id="hex-grid" width="40" height="69.282" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 40 34.641 L 40 57.735 L 20 69.282 L 0 57.735 Z" fill="none" stroke="#10b981" stroke-width="1" stroke-opacity="0.06"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#hex-grid)"/>
      <circle cx="1086" cy="305" r="440" fill="url(#glow-${c.key})"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#10b981" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Defensive Grid Lines & Rings -->
      <g stroke="#10b981" stroke-opacity="0.15" stroke-width="1.5">
        <circle cx="1086" cy="305" r="285" fill="none" stroke-dasharray="8,10"/>
        <circle cx="1086" cy="305" r="235" fill="none" stroke-dasharray="4,6"/>
      </g>

      <!-- Side Data Panels (Vector Brackets) -->
      <g opacity="0.35" stroke="#10b981" stroke-width="2" fill="none">
        <path d="M 380 230 L 320 230 L 320 380 L 380 380"/>
        <path d="M 340 305 L 480 305" stroke-dasharray="6,6"/>
        <circle cx="480" cy="305" r="5" fill="#10b981"/>

        <path d="M 1792 230 L 1852 230 L 1852 380 L 1792 380"/>
        <path d="M 1832 305 L 1692 305" stroke-dasharray="6,6"/>
        <circle cx="1692" cy="305" r="5" fill="#10b981"/>
      </g>

      <!-- Center Security Shield with Padlock -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <path d="M 0 -170 L 130 -115 C 130 20, 95 125, 0 175 C -95 125, -130 20, -130 -115 Z" fill="#080f1d" stroke="#10b981" stroke-width="3" stroke-opacity="0.4"/>
        <path d="M 0 -150 L 112 -100 C 112 15, 82 105, 0 150 C -82 105, -112 15, -112 -100 Z" fill="url(#shield-grad)" fill-opacity="0.88" stroke="#34d399" stroke-width="3"/>
        <path d="M 0 -150 L 112 -100 C 112 15, 82 105, 0 150 Z" fill="#ffffff" fill-opacity="0.12"/>

        <!-- Center Sleek Padlock -->
        <g transform="translate(0, 5)">
          <path d="M -34 -15 L -34 -48 C -34 -72, 34 -72, 34 -48 L 34 -15" fill="none" stroke="url(#lock-grad)" stroke-width="11" stroke-linecap="round"/>
          <rect x="-48" y="-15" width="96" height="82" rx="16" fill="#064e3b" stroke="#34d399" stroke-width="3.5"/>
          <rect x="-42" y="-10" width="84" height="72" rx="12" fill="#047857" stroke="#10b981" stroke-width="1.5" opacity="0.6"/>
          <circle cx="0" cy="18" r="9" fill="#a7f3d0"/>
          <path d="M -4.5 21 L 4.5 21 L 6.5 40 L -6.5 40 Z" fill="#a7f3d0"/>
        </g>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#34d399" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'research-innovation',
    titleEn: 'University Innovation Forum',
    titleAr: 'ملتقى الابتكار الجامعي',
    topicLabel: 'ACADEMIC RESEARCH & SCIENTIFIC INGENUITY',
    bgStart: '#021a10',
    bgEnd: '#063d26',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#042c1c"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="bulb-glow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.38"/>
          <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#021a10" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="bulb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="40%" stop-color="#fde047"/>
          <stop offset="80%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
        <linearGradient id="ray-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#fbbf24" flood-opacity="0.45"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="305" r="450" fill="url(#bulb-glow)"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#fbbf24" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Radiating Geometric Innovation Rays -->
      <g stroke="url(#ray-grad)" stroke-width="2.5" stroke-linecap="round" opacity="0.65">
        <line x1="1086" y1="95" x2="1086" y2="45"/>
        <line x1="1235" y1="135" x2="1275" y2="100"/>
        <line x1="1295" y1="260" x2="1345" y2="255"/>
        <line x1="1265" y1="385" x2="1310" y2="410"/>
        <line x1="937" y1="135" x2="897" y2="100"/>
        <line x1="877" y1="260" x2="827" y2="255"/>
        <line x1="907" y1="385" x2="862" y2="410"/>
      </g>

      <!-- Spark Stars -->
      <g fill="#fef08a" opacity="0.75">
        <polygon points="1086,30 1089,40 1099,43 1089,46 1086,56 1083,46 1073,43 1083,40"/>
        <polygon points="1310,85 1312,92 1319,94 1312,96 1310,103 1308,96 1301,94 1308,92"/>
        <polygon points="862,85 864,92 871,94 864,96 862,103 860,96 853,94 860,92"/>
      </g>

      <!-- Left / Right Research Constellation Triangles -->
      <g opacity="0.3" stroke="#34d399" stroke-width="1.5" fill="none">
        <polygon points="360,350 440,230 520,350" stroke-dasharray="4,4"/>
        <circle cx="440" cy="230" r="5" fill="#34d399"/>
        <circle cx="360" cy="350" r="5" fill="#fbbf24"/>
        <circle cx="520" cy="350" r="5" fill="#34d399"/>
        <line x1="320" y1="390" x2="560" y2="390"/>

        <polygon points="1812,350 1732,230 1652,350" stroke-dasharray="4,4"/>
        <circle cx="1732" cy="230" r="5" fill="#34d399"/>
        <circle cx="1812" cy="350" r="5" fill="#fbbf24"/>
        <circle cx="1652" cy="350" r="5" fill="#34d399"/>
        <line x1="1612" y1="390" x2="1852" y2="390"/>
      </g>

      <!-- Center Faceted Geometric Lightbulb -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <path d="M 0 -150 C 75 -150, 115 -100, 115 -35 C 115 25, 65 75, 55 110 L -55 110 C -65 75, -115 25, -115 -35 C -115 -100, -75 -150, 0 -150 Z"
              fill="url(#bulb-grad)" fill-opacity="0.9" stroke="#ffffff" stroke-width="3"/>
        <path d="M 0 -150 C 75 -150, 115 -100, 115 -35 C 115 25, 65 75, 55 110 L 0 110 Z"
              fill="#ffffff" fill-opacity="0.2"/>

        <path d="M -30 70 L -25 -20 C -25 -60, -50 -70, -30 -95 C -15 -115, 15 -115, 30 -95 C 50 -70, 25 -60, 25 -20 L 30 70"
              fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <circle cx="0" cy="-75" r="14" fill="#ffffff"/>

        <!-- Base & Threads -->
        <rect x="-48" y="115" width="96" height="15" rx="7" fill="#64748b" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="-42" y="135" width="84" height="15" rx="7" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
        <rect x="-34" y="155" width="68" height="15" rx="7" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <path d="M -22 173 C -22 185, 22 185, 22 173 Z" fill="#1e293b"/>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#fde047" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'cloud-fundamentals',
    titleEn: 'Cloud Computing Workshop',
    titleAr: 'ورشة الحوسبة السحابية',
    topicLabel: 'CLOUD INFRASTRUCTURE & VIRTUALIZATION',
    bgStart: '#06122c',
    bgEnd: '#0f2c61',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#0a1d44"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="cloud-glow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.32"/>
          <stop offset="65%" stop-color="#1d4ed8" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#06122c" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cloud-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="40%" stop-color="#e0f2fe"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
        <linearGradient id="server-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#38bdf8" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="305" r="440" fill="url(#cloud-glow)"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#38bdf8" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Network Elevation & Data Stream Pathways -->
      <g stroke="#38bdf8" stroke-opacity="0.12" stroke-width="1.5">
        <circle cx="1086" cy="305" r="270" fill="none" stroke-dasharray="6,8"/>
        <circle cx="1086" cy="305" r="220" fill="none" stroke-dasharray="12,12"/>
      </g>

      <!-- Side Data Panels -->
      <g opacity="0.4">
        <path d="M 320 305 L 480 305 L 540 245 L 660 245" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,6"/>
        <rect x="280" y="290" width="40" height="30" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
        <circle cx="295" cy="305" r="3" fill="#22c55e"/>

        <path d="M 1852 305 L 1692 305 L 1632 245 L 1512 245" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="4,6"/>
        <rect x="1852" y="290" width="40" height="30" rx="6" fill="#1e293b" stroke="#60a5fa" stroke-width="1.5"/>
        <circle cx="1875" cy="305" r="3" fill="#22c55e"/>
      </g>

      <!-- Center Vector Cloud + Server Blades -->
      <g transform="translate(1086, 290)" filter="url(#shadow-${c.key})">
        <path d="M -130 30 C -160 30, -185 5, -185 -25 C -185 -55, -160 -80, -130 -80 C -125 -80, -120 -78, -115 -75 C -105 -125, -60 -160, 0 -160 C 55 -160, 100 -130, 115 -85 C 122 -88, 128 -90, 135 -90 C 168 -90, 195 -63, 195 -30 C 195 5, 168 30, 135 30 Z"
              fill="url(#cloud-body)" stroke="#ffffff" stroke-width="4"/>

        <!-- Server Blade 1 -->
        <rect x="-110" y="55" width="220" height="32" rx="8" fill="url(#server-grad)" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="-85" cy="71" r="4" fill="#22c55e"/>
        <circle cx="-70" cy="71" r="4" fill="#38bdf8"/>
        <line x1="-50" y1="71" x2="50" y2="71" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        <rect x="65" y="64" width="28" height="14" rx="3" fill="#334155"/>

        <!-- Server Blade 2 -->
        <rect x="-110" y="95" width="220" height="32" rx="8" fill="url(#server-grad)" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="-85" cy="111" r="4" fill="#22c55e"/>
        <circle cx="-70" cy="111" r="4" fill="#38bdf8"/>
        <line x1="-50" y1="111" x2="50" y2="111" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
        <rect x="65" y="104" width="28" height="14" rx="3" fill="#334155"/>

        <!-- Data Bus -->
        <path d="M -50 30 L -50 55" stroke="#38bdf8" stroke-width="3"/>
        <path d="M 0 30 L 0 55" stroke="#38bdf8" stroke-width="3"/>
        <path d="M 50 30 L 50 55" stroke="#38bdf8" stroke-width="3"/>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#7dd3fc" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'career-workshop',
    titleEn: 'Career Preparation Workshop',
    titleAr: 'ورشة الاستعداد لسوق العمل',
    topicLabel: 'CAREER EMPOWERMENT & PROFESSIONAL READINESS',
    bgStart: '#0f0e26',
    bgEnd: '#1e1a47',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#141334"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="career-glow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#818cf8" stop-opacity="0.3"/>
          <stop offset="70%" stop-color="#4f46e5" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#0f0e26" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="briefcase-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4338ca"/>
          <stop offset="100%" stop-color="#312e81"/>
        </linearGradient>
        <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#818cf8" flood-opacity="0.38"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="305" r="440" fill="url(#career-glow)"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#818cf8" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Stepped Career Progression Lines -->
      <g stroke="#818cf8" stroke-opacity="0.12" stroke-width="1.5">
        <line x1="380" y1="420" x2="680" y2="420"/>
        <line x1="530" y1="360" x2="830" y2="360"/>
        <line x1="1792" y1="420" x2="1492" y2="420"/>
        <line x1="1642" y1="360" x2="1342" y2="360"/>
      </g>

      <!-- Center Career Graphic: Briefcase & Structured CV -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <!-- Resume / CV Document (Tilted Slightly in Background) -->
        <g transform="translate(-140, -145) rotate(-6)">
          <rect width="170" height="230" rx="10" fill="#ffffff" stroke="#c7d2fe" stroke-width="3"/>
          <circle cx="35" cy="40" r="16" fill="#818cf8"/>
          <rect x="62" y="30" width="80" height="9" rx="4" fill="#4338ca"/>
          <rect x="62" y="44" width="55" height="7" rx="3" fill="#a5b4fc"/>
          <line x1="20" y1="70" x2="150" y2="70" stroke="#e0e7ff" stroke-width="2"/>
          <rect x="20" y="85" width="130" height="7" rx="3" fill="#6366f1"/>
          <rect x="20" y="99" width="105" height="6" rx="3" fill="#c7d2fe"/>
          <rect x="20" y="112" width="120" height="6" rx="3" fill="#c7d2fe"/>
          <rect x="20" y="132" width="130" height="7" rx="3" fill="#6366f1"/>
          <rect x="20" y="146" width="95" height="6" rx="3" fill="#c7d2fe"/>
          <rect x="20" y="159" width="110" height="6" rx="3" fill="#c7d2fe"/>
          <circle cx="138" cy="195" r="14" fill="url(#gold-accent)"/>
          <path d="M 132 195 L 136 199 L 145 190" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        </g>

        <!-- Executive Professional Briefcase -->
        <g transform="translate(15, -45)">
          <path d="M 40 -12 C 40 -35, 120 -35, 120 -12" fill="none" stroke="#6366f1" stroke-width="10" stroke-linecap="round"/>
          <path d="M 48 -12 C 48 -28, 112 -28, 112 -12" fill="none" stroke="url(#gold-accent)" stroke-width="3" stroke-linecap="round"/>
          <rect x="-20" y="-10" width="200" height="150" rx="18" fill="url(#briefcase-body)" stroke="#818cf8" stroke-width="3.5"/>
          <path d="M -20 -10 L 180 -10 L 160 65 L 0 65 Z" fill="#3730a3" stroke="#6366f1" stroke-width="2"/>
          <rect x="68" y="52" width="24" height="28" rx="5" fill="url(#gold-accent)" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="80" cy="66" r="3" fill="#1e1b4b"/>
          <path d="M -16 115 L -16 136 C -16 142, -10 148, -4 148 L 18 148 Z" fill="#312e81" stroke="#6366f1" stroke-width="2"/>
          <path d="M 176 115 L 176 136 C 176 142, 170 148, 164 148 L 142 148 Z" fill="#312e81" stroke="#6366f1" stroke-width="2"/>
        </g>

        <!-- Upward Career Growth Arrow -->
        <path d="M -220 120 L -90 90 L 30 30 L 180 -70 L 260 -130" fill="none" stroke="url(#gold-accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="8,6"/>
        <polygon points="275,-140 252,-138 266,-120" fill="#f59e0b"/>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#a5b4fc" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'student-volunteering',
    titleEn: 'Student Volunteering Initiative',
    titleAr: 'مبادرة التطوع الطلابي',
    topicLabel: 'CIVIC ENGAGEMENT & COMMUNITY EMPOWERMENT',
    bgStart: '#1d0610',
    bgEnd: '#3a0d1e',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#280916"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="vol-glow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#fb7185" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#e11d48" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#1d0610" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fda4af"/>
          <stop offset="40%" stop-color="#fb7185"/>
          <stop offset="100%" stop-color="#e11d48"/>
        </linearGradient>
        <linearGradient id="hand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#fecdd3"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#fb7185" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="305" r="440" fill="url(#vol-glow)"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#fb7185" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Community Rings & Stars -->
      <g stroke="#fb7185" stroke-opacity="0.15" stroke-width="1.5">
        <circle cx="1086" cy="305" r="275" fill="none" stroke-dasharray="6,8"/>
        <circle cx="1086" cy="305" r="225" fill="none" stroke-dasharray="10,12"/>
      </g>

      <g fill="#fecdd3" opacity="0.6">
        <circle cx="820" cy="270" r="5"/>
        <circle cx="860" cy="190" r="4"/>
        <circle cx="940" cy="140" r="6"/>
        <circle cx="1232" cy="140" r="6"/>
        <circle cx="1312" cy="190" r="4"/>
        <circle cx="1352" cy="270" r="5"/>
      </g>

      <!-- Center Graphic: Supporting Hands & Heart -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <g transform="translate(0, -50)">
          <path d="M 0 65 C -75 10, -110 -35, -70 -75 C -35 -110, 0 -60, 0 -35 C 0 -60, 35 -110, 70 -75 C 110 -35, 75 10, 0 65 Z"
                fill="url(#heart-grad)" stroke="#ffffff" stroke-width="3"/>
          <circle cx="-30" cy="-60" r="8" fill="#ffffff" opacity="0.6"/>
        </g>

        <!-- Left Supporting Hand -->
        <path d="M -140 100 C -120 70, -70 65, -30 85 C -20 90, 0 100, 0 100 C -25 110, -60 115, -90 120 C -120 125, -150 145, -165 170 L -195 140 C -180 120, -160 105, -140 100 Z"
              fill="url(#hand-grad)" stroke="#fda4af" stroke-width="2.5"/>

        <!-- Right Supporting Hand -->
        <path d="M 140 100 C 120 70, 70 65, 30 85 C 20 90, 0 100, 0 100 C 25 110, 60 115, 90 120 C 120 125, 150 145, 165 170 L 195 140 C 180 120, 160 105, 140 100 Z"
              fill="url(#hand-grad)" stroke="#fda4af" stroke-width="2.5"/>

        <!-- Unity Base Arc -->
        <path d="M -120 170 C -60 190, 60 190, 120 170" fill="none" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#fda4af" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'digital-forensics',
    titleEn: 'Digital Forensics Seminar',
    titleAr: 'ندوة الأدلة الجنائية الرقمية',
    topicLabel: 'DIGITAL INVESTIGATION & EVIDENCE INTEGRITY',
    bgStart: '#050c17',
    bgEnd: '#0a1d31',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#071424"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="forensics-glow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#00f5d4" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#0077b6" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#050c17" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="lens-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f5d4"/>
          <stop offset="100%" stop-color="#0077b6"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#00f5d4" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="305" r="440" fill="url(#forensics-glow)"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#00f5d4" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Inspection Coordinates & Reticles -->
      <g stroke="#00f5d4" stroke-opacity="0.1" stroke-width="1.5">
        <circle cx="1086" cy="305" r="275" fill="none" stroke-dasharray="6,8"/>
        <circle cx="1086" cy="305" r="235" fill="none" stroke-dasharray="14,14"/>
      </g>

      <!-- Crosshairs -->
      <g opacity="0.35" stroke="#00b4d8" stroke-width="2" fill="none">
        <circle cx="440" cy="305" r="45"/>
        <line x1="380" y1="305" x2="500" y2="305"/>
        <line x1="440" y1="245" x2="440" y2="365"/>

        <circle cx="1732" cy="305" r="45"/>
        <line x1="1672" y1="305" x2="1792" y2="305"/>
        <line x1="1732" y1="245" x2="1732" y2="365"/>
      </g>

      <!-- Center Biometric Fingerprint & Magnifier Reticle -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <g stroke="#00f5d4" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85">
          <path d="M 0 10 C 0 -15, -15 -25, -25 -25 C -35 -25, -45 -10, -45 15 C -45 40, -35 60, -25 75"/>
          <path d="M 0 35 C -5 20, -15 0, -20 -15 C -25 -25, -20 -40, -5 -45 C 15 -50, 30 -35, 30 -15 C 30 20, 20 50, 0 75"/>
          <path d="M -15 -65 C 10 -75, 45 -65, 55 -30 C 60 0, 50 40, 25 85"/>
          <path d="M -40 -65 C -65 -45, -75 -15, -75 20 C -75 60, -55 90, -25 110"/>
          <path d="M 5 -90 C 40 -90, 75 -65, 85 -20 C 90 25, 75 75, 40 120"/>
          <path d="M -60 -80 C -95 -50, -100 -5, -100 35 C -100 85, -70 125, -35 140"/>
        </g>

        <!-- Precision Forensic Inspection Lens -->
        <g transform="translate(-15, -20)">
          <circle cx="0" cy="0" r="120" fill="#00f5d4" fill-opacity="0.08" stroke="url(#lens-rim)" stroke-width="6"/>
          <path d="M -80 -60 C -40 -105, 40 -105, 80 -60" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>

          <line x1="-120" y1="0" x2="-80" y2="0" stroke="#00f5d4" stroke-width="2.5"/>
          <line x1="80" y1="0" x2="120" y2="0" stroke="#00f5d4" stroke-width="2.5"/>
          <line x1="0" y1="-120" x2="0" y2="-80" stroke="#00f5d4" stroke-width="2.5"/>
          <line x1="0" y1="80" x2="0" y2="120" stroke="#00f5d4" stroke-width="2.5"/>

          <rect x="-35" y="-35" width="70" height="70" rx="6" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="6,4"/>
          <circle cx="0" cy="0" r="4" fill="#00f5d4"/>

          <path d="M 85 85 L 165 165" stroke="url(#lens-rim)" stroke-width="16" stroke-linecap="round"/>
          <path d="M 115 115 L 175 175" stroke="#00f5d4" stroke-width="6" stroke-linecap="round"/>
        </g>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#64dfdf" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
  {
    key: 'entrepreneurship',
    titleEn: 'Entrepreneurship Forum',
    titleAr: 'ملتقى ريادة الأعمال',
    topicLabel: 'VENTURE CREATION & SCALABLE INNOVATION',
    bgStart: '#17082c',
    bgEnd: '#300f52',
    renderSvg: (c) => `
      <defs>
        <linearGradient id="bg-${c.key}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.bgStart}"/>
          <stop offset="50%" stop-color="#220b3c"/>
          <stop offset="100%" stop-color="${c.bgEnd}"/>
        </linearGradient>
        <radialGradient id="rocket-glow" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stop-color="#f97316" stop-opacity="0.32"/>
          <stop offset="65%" stop-color="#7c3aed" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#17082c" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="rocket-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="flame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#ef4444"/>
        </linearGradient>
        <filter id="shadow-${c.key}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#f97316" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg-${c.key})"/>
      <circle cx="1086" cy="305" r="440" fill="url(#rocket-glow)"/>

      <!-- Corner Framing Brackets -->
      <g stroke="#f97316" stroke-opacity="0.3" stroke-width="2" fill="none">
        <path d="M 60 100 L 60 60 L 100 60"/>
        <path d="M 2112 100 L 2112 60 L 2072 60"/>
        <path d="M 60 624 L 60 664 L 100 664"/>
        <path d="M 2112 624 L 2112 664 L 2072 664"/>
      </g>

      <!-- Trajectory Arcs -->
      <g stroke="#c084fc" stroke-opacity="0.15" stroke-width="1.5">
        <path d="M 400 520 Q 800 170, 1400 120" fill="none" stroke-dasharray="8,8"/>
        <path d="M 600 570 Q 1086 220, 1600 90" fill="none" stroke-dasharray="12,12"/>
      </g>
      <g fill="#fde047" opacity="0.6">
        <polygon points="1350,120 1353,130 1363,133 1353,136 1350,146 1347,136 1337,133 1347,130"/>
        <polygon points="850,190 852,197 859,199 852,201 850,208 848,201 841,199 848,197"/>
      </g>

      <!-- Center Startup Rocket & Growth Pillars -->
      <g transform="translate(1086, 305)" filter="url(#shadow-${c.key})">
        <!-- 3D Bar-Chart Growth Pillars -->
        <g transform="translate(-160, 40)" opacity="0.75">
          <rect x="0" y="30" width="35" height="70" rx="6" fill="#7c3aed" stroke="#a855f7" stroke-width="2"/>
          <rect x="45" y="-10" width="35" height="110" rx="6" fill="#9333ea" stroke="#c084fc" stroke-width="2"/>
          <rect x="90" y="-55" width="35" height="155" rx="6" fill="#a855f7" stroke="#e9d5ff" stroke-width="2"/>
        </g>

        <!-- Diagonal Startup Rocket (Rotated -42 deg) -->
        <g transform="translate(20, -10) rotate(-42)">
          <path d="M -18 80 C -30 130, 0 170, 0 170 C 0 170, 30 130, 18 80 Z" fill="url(#flame-grad)"/>
          <path d="M -10 80 C -18 115, 0 140, 0 140 C 0 140, 18 115, 10 80 Z" fill="#ffffff"/>

          <path d="M -26 40 L -60 75 L -26 80 Z" fill="#ea580c" stroke="#f97316" stroke-width="2"/>
          <path d="M 26 40 L 60 75 L 26 80 Z" fill="#ea580c" stroke="#f97316" stroke-width="2"/>
          <path d="M 0 35 L -4 75 L 4 75 Z" fill="#c2410c"/>

          <path d="M 0 -95 C -40 -35, -30 40, -26 80 L 26 80 C 30 40, 40 -35, 0 -95 Z"
                fill="url(#rocket-body)" stroke="#ffffff" stroke-width="3"/>

          <circle cx="0" cy="-20" r="15" fill="#0284c7" stroke="#ffffff" stroke-width="3.5"/>
          <circle cx="-4" cy="-24" r="4" fill="#ffffff" opacity="0.8"/>
          <path d="M 0 -95 C -15 -72, -18 -55, -20 -45 L 20 -45 C 18 -55, 15 -72, 0 -95 Z" fill="#ef4444"/>
        </g>
      </g>

      <!-- Titles -->
      <g transform="translate(1086, 600)" text-anchor="middle">
        <text y="0" fill="#ffffff" font-family="'Cairo', 'Segoe UI', Tahoma, sans-serif" font-size="34" font-weight="800" letter-spacing="1.5">${c.titleAr}</text>
        <text y="38" fill="#fdba74" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="700" letter-spacing="4">${c.titleEn.toUpperCase()}</text>
      </g>
    `,
  },
];

async function main() {
  console.log(`Starting generation of ${COVERS.length} academic vector covers at ${WIDTH}x${HEIGHT}...`);
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
        ${cover.renderSvg(cover)}
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
    console.log(`✓ Generated ${path.basename(targetPath)} (${stat.size.toLocaleString()} bytes)`);
  }

  await browser.close();
  console.log('All 8 covers successfully rendered and saved!');
}

main().catch((err) => {
  console.error('Failed to generate covers:', err);
  process.exit(1);
});
