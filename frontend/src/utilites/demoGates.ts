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

export const isDemoNavigationDisabled = (targetLink: string | undefined, currentPath: string): boolean => {
    if (!isMidtermDemoEnabled || !targetLink || targetLink === '#' || targetLink === '') {
        return false;
    }

    const cleanLink = targetLink.split('#')[0].split('?')[0];
    if (!cleanLink) {
        return false;
    }

    if (cleanLink.startsWith('/')) {
        return isDemoPathDisabled(cleanLink);
    }

    const base = currentPath.replace(/\/+$/, '');

    const eventMatch = base.match(/^(\/manage\/event\/[^/]+)/);
    if (eventMatch) {
        return isDemoPathDisabled(`${eventMatch[1]}/${cleanLink}`);
    }

    const organizerMatch = base.match(/^(\/manage\/organizer(?:\/[^/]+)?)/);
    if (organizerMatch) {
        return isDemoPathDisabled(`${organizerMatch[1]}/${cleanLink}`);
    }

    if (base.startsWith('/admin')) {
        return isDemoPathDisabled(`/admin/${cleanLink}`);
    }

    if (base.startsWith('/account')) {
        return isDemoPathDisabled(`/account/${cleanLink}`);
    }

    return isDemoPathDisabled(`${base}/${cleanLink}`);
};

let isInterceptorInstalled = false;

export const setupGlobalDemoClickInterceptor = (): void => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || isInterceptorInstalled) {
        return;
    }

    isInterceptorInstalled = true;

    document.addEventListener('click', (event) => {
        if (!isMidtermDemoEnabled) {
            return;
        }

        const target = event.target as HTMLElement | null;
        if (!target) {
            return;
        }

        const anchor = target.closest('a');
        if (!anchor) {
            return;
        }

        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) {
            return;
        }

        try {
            const url = new URL(anchor.href, window.location.href);
            if (url.origin === window.location.origin && isDemoPathDisabled(url.pathname)) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                const originalTransition = anchor.style.transition;
                const originalTransform = anchor.style.transform;
                anchor.style.transition = 'transform 0.12s ease, opacity 0.12s ease';
                anchor.style.transform = 'scale(0.96)';
                setTimeout(() => {
                    anchor.style.transform = originalTransform;
                    setTimeout(() => {
                        anchor.style.transition = originalTransition;
                    }, 150);
                }, 180);
            }
        } catch {
            // ignore malformed URLs
        }
    }, true);
};
