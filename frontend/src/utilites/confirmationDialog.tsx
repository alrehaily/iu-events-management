import {modals} from "@mantine/modals";

interface ConfirmationDialogOptions {
    confirm?: string;
    cancel?: string;
    useCheckoutColors?: boolean;
}

const CONFIRMATION_DICTIONARY: Record<string, { ar: string; en: string }> = {
    "Are you sure you want to make this event draft? This will make the event invisible to the public": {
        ar: "هل أنت متأكد من تحويل هذه الفعالية إلى مسودة؟ سيجعل هذا الفعالية مخفية عن الجمهور.",
        en: "Are you sure you want to make this event draft? This will make the event invisible to the public",
    },
    "Are you sure you want to make this organizer draft? This will make the organizer page invisible to the public": {
        ar: "هل أنت متأكد من تحويل هذا المنظم إلى مسودة؟ سيجعل هذا صفحة المنظم مخفية عن الجمهور.",
        en: "Are you sure you want to make this organizer draft? This will make the organizer page invisible to the public",
    },
    "Are you sure you want to make this organizer public? This will make the organizer page visible to the public": {
        ar: "هل أنت متأكد من نشر هذا المنظم؟ سيجعل هذا صفحة المنظم مرئية للجمهور.",
        en: "Are you sure you want to make this organizer public? This will make the organizer page visible to the public",
    },
    "Are you sure you want to delete this event? This action cannot be undone.": {
        ar: "هل أنت متأكد من رغبتك في حذف هذه الفعالية؟ لا يمكن التراجع عن هذا الإجراء.",
        en: "Are you sure you want to delete this event? This action cannot be undone.",
    },
    "Are you sure you want to cancel this registration and tickets?": {
        ar: "هل أنت متأكد من رغبتك في إلغاء هذا التسجيل والتذكرة؟",
        en: "Are you sure you want to cancel this registration and tickets?",
    },
    "Are you sure you want to delete this image?": {
        ar: "هل أنت متأكد من رغبتك في حذف هذه الصورة؟",
        en: "Are you sure you want to delete this image?",
    },
    "Are you sure you want to delete this question? This cannot be undone.": {
        ar: "هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.",
        en: "Are you sure you want to delete this question? This cannot be undone.",
    },
    "Delete this product? This cannot be undone.": {
        ar: "هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
        en: "Delete this product? This cannot be undone.",
    },
    "Delete this category? Any products in it will also be deleted. This cannot be undone.": {
        ar: "هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع المنتجات الموجودة به أيضاً.",
        en: "Delete this category? Any products in it will also be deleted. This cannot be undone.",
    },
    "Are you sure you want to delete this tax or fee? It will no longer be applied to new orders.": {
        ar: "هل أنت متأكد من حذف هذه الضريبة أو الرسم؟ لن يتم تطبيقها على الطلبات الجديدة.",
        en: "Are you sure you want to delete this tax or fee? It will no longer be applied to new orders.",
    },
    "Are you sure you want to delete this date? This action cannot be undone.": {
        ar: "هل أنت متأكد من حذف هذا التاريخ؟ لا يمكن التراجع عن هذا الإجراء.",
        en: "Are you sure you want to delete this date? This action cannot be undone.",
    },
};

export const confirmationDialog = (
    message: string,
    onConfirm: () => void,
    options?: ConfirmationDialogOptions,
) => {
    let currentLocale: 'ar' | 'en' = 'ar';
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('locale') || document.documentElement.lang;
        if (stored?.startsWith('en')) {
            currentLocale = 'en';
        }
    }

    const isArabic = currentLocale === 'ar';

    let finalMessage = message;
    if (CONFIRMATION_DICTIONARY[message]) {
        finalMessage = CONFIRMATION_DICTIONARY[message][currentLocale];
    }

    const labels = {
        confirm: options?.confirm || (isArabic ? 'تأكيد' : 'Confirm'),
        cancel: options?.cancel || (isArabic ? 'إلغاء' : 'Cancel'),
    };

    const checkoutStyles = options?.useCheckoutColors ? {
        header: {
            backgroundColor: 'var(--checkout-surface, #FFFFFF)',
        },
        title: {
            color: 'var(--checkout-text-primary, #1a1a1a)',
        },
        content: {
            backgroundColor: 'var(--checkout-surface, #FFFFFF)',
        },
        body: {
            color: 'var(--checkout-text-primary, #1a1a1a)',
        },
    } : undefined;

    modals.openConfirmModal({
        title: finalMessage,
        labels,
        styles: checkoutStyles,
        onConfirm: () => onConfirm(),
    });
}