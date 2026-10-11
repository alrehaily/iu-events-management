export const isMidtermDemoEnabled = true;

export const DEMO_DISABLED_TITLE = "Page Not Found";
export const DEMO_DISABLED_TITLE_AR = "الصفحة غير موجودة";
export const DEMO_DISABLED_DESCRIPTION = "The page or resource you are looking for does not exist or has not been created yet.";
export const DEMO_DISABLED_DESCRIPTION_AR = "عذراً، الصفحة أو الميزة التي تحاول الوصول إليها غير موجودة أو لم تكتمل بعد.";

export const isDemoPathDisabled = (pathname: string): boolean => {
    if (!isMidtermDemoEnabled || !pathname) {
        return false;
    }

    const clean = pathname.replace(/\/+$/, '') || '/';

    const disabledPrefixes = [
        '/my-registrations',
        '/my-tickets',
        '/checkout',
        '/widget',
        '/check-in',
        '/certificates/verify',
    ];

    if (disabledPrefixes.some(prefix => clean === prefix || clean.startsWith(prefix + '/'))) {
        return true;
    }

    if (clean.startsWith('/order/') && clean.endsWith('/print')) {
        return true;
    }

    if (clean.startsWith('/product/') && (clean.endsWith('/print') || !clean.includes('/manage/'))) {
        return true;
    }

    if (clean.includes('/register') && clean.startsWith('/event/')) {
        return true;
    }

    const eventDisabledSubpaths = [
        'reports',
        'report',
        'attendees',
        'questions',
        'orders',
        'promo-codes',
        'affiliates',
        'check-in',
        'messages',
        'widget',
        'sold-out-waitlist',
        'capacity-assignments',
        'webhooks',
    ];

    const eventMatch = clean.match(/^\/manage\/event\/[^/]+\/([^/]+)/);
    if (eventMatch && eventDisabledSubpaths.includes(eventMatch[1])) {
        return true;
    }

    const organizerDisabledSubpaths = [
        'reports',
        'report',
        'payments',
        'settings',
        'webhooks',
    ];

    const organizerMatch = clean.match(/^\/manage\/organizer(?:\/[^/]+)?\/([^/]+)/);
    if (organizerMatch && organizerDisabledSubpaths.includes(organizerMatch[1])) {
        return true;
    }

    const adminDisabledSubpaths = [
        'accounts',
        'users',
        'orders',
        'messages',
        'spam-events',
        'announcements',
        'attribution',
        'deletion-requests',
        'failed-jobs',
        'configurations',
    ];

    const adminMatch = clean.match(/^\/admin\/([^/]+)/);
    if (adminMatch && adminDisabledSubpaths.includes(adminMatch[1])) {
        return true;
    }

    const accountDisabledSubpaths = [
        'taxes-and-fees',
        'danger-zone',
    ];

    const accountMatch = clean.match(/^\/account\/([^/]+)/);
    if (accountMatch && accountDisabledSubpaths.includes(accountMatch[1])) {
        return true;
    }

    return false;
};
