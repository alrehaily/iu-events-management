/**
 * Islamic University of Madinah (IU) Design Tokens
 * Central TypeScript Single Source of Truth for frontend colors, typography, radii, and shadows.
 * Extracted directly from UI-Event design specifications.
 */

export const IU_COLORS = {
    // Primary Greens
    green900: '#084b2f', // Deep Official IU Green
    green800: '#105f3c',
    green700: '#1b754b', // Primary UI Action Green
    green600: '#1d8a51',
    green500: '#168551', // Vibrant Accent Green
    green200: '#dff3e8', // Soft Green Tint
    green100: '#edf8f2',
    green50: '#f4fbf7',

    // Surfaces & Backgrounds
    bg: '#f4f6f8',
    bgAuth: '#f3f7f4',
    surface: '#ffffff',
    surfaceAlt: '#f8faf9',

    // Text & Typography
    text: '#0f172a',
    textMuted: '#555555',
    textSubtle: '#64748b',
    textInverse: '#ffffff',

    // Borders
    border: '#e5e7eb',
    borderLight: '#e9e9e9',
    borderInput: '#d8dde6',

    // Functional & Feedback
    success: '#1b754b',
    successSoft: '#dff3e8',
    warning: '#d97706',
    warningSoft: '#fef3c7',
    danger: '#dc2626',
    dangerSoft: '#fee2e2',
    info: '#0284c7',
    infoSoft: '#e0f2fe',

    // Shadows
    shadowColor: '#cfcfcf',
} as const;

export const IU_RADII = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    pill: '999px',
} as const;

export const IU_SHADOWS = {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 6px 16px rgba(22, 133, 81, 0.18)',
    lg: '0 12px 26px rgba(8, 75, 47, 0.12)',
    xl: '0 18px 36px rgba(8, 75, 47, 0.22)',
    card: '0 0 10px #cfcfcf',
    cardHover: '0 12px 26px rgba(8, 75, 47, 0.12)',
    focus: '0 0 0 3px rgba(22, 133, 81, 0.15)',
} as const;

export const IU_SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
} as const;

export const IU_TYPOGRAPHY = {
    fontFamily: "'Tajawal', 'Cairo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSizeXs: '12px',
    fontSizeSm: '14px',
    fontSizeMd: '16px',
    fontSizeLg: '18px',
    fontSizeXl: '22px',
    fontSize2xl: '28px',
    fontSize3xl: '36px',
} as const;

export const IU_GRADIENTS = {
    brand: 'linear-gradient(135deg, #084b2f 0%, #1b754b 100%)',
    hero: 'linear-gradient(110deg, #084b2f 0%, #1b754b 50%, #1d8a51 100%)',
} as const;

export const IU_HERO = {
    angle: '110deg',
    from: '#084b2f',
    mid: '#1b754b',
    to: '#1d8a51',
    height: '280px',
    gradient: 'linear-gradient(110deg, #084b2f 0%, #1b754b 50%, #1d8a51 100%)',
    titleColor: '#ffffff',
    metaColor: 'rgba(255, 255, 255, 0.85)',
} as const;

