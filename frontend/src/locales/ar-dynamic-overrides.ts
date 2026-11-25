import type {Messages} from "@lingui/core";

export const arabicDynamicMessageOverrides: Messages = {
    'SeyN12': [['completedCount'], ' من ', ['totalCount'], ' خطوات مكتملة'],
    't1LIQW': ['عرض ', ['0'], ' من أصل ', ['totalRows'], ' سجلًا'],
    'RBuxIl': [['productCount'], ' أنواع من التذاكر مهيأة'],
    'cMW+gm': ['عرض جميع المنصات (', ['0'], ' إضافية تحتوي على بيانات)'],

    // Demo test: messages with placeholders
    "JSbtZf": ["إتمام الطلب · الخطوة ",["stepNumber"]," من ",["stepCount"]],
    "dLouFI": ["الانضمام إلى قائمة الانتظار: ",["productDisplayName"]],
    "iy+M+c": ["سنرسل لك بريدًا إلكترونيًا إذا توفر مقعد في ",["productDisplayName"],"."],
    "mfM/HJ": ["سنرسل لك بريدًا إلكترونيًا إذا توفر مقعد في ",["productDisplayName"]," بتاريخ ",["occurrenceDate"],"."],
    "fXf2r5": ["الأوقات بتوقيت ",["timezoneAbbr"]],
    "/RfJXt": ["مثال: ملتقى الابتكار الطلابي ",["0"]],
};
