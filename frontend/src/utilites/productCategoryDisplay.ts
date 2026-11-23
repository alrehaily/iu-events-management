import {t} from "@lingui/macro";
import {ProductCategory} from "../types.ts";

export const productCategoryDisplay = (category: ProductCategory) => {
    const defaults = [
        {name: 'Tickets', arabic: 'التذاكر', message: 'There are no tickets available for this event', arabicMessage: 'لا توجد تذاكر متاحة لهذه الفعالية', label: t`Tickets`, empty: t`There are no tickets available for this event`},
        {name: 'Classes', arabic: 'الحصص', message: 'There are no classes available for this event', arabicMessage: 'لا توجد حصص متاحة لهذه الفعالية', label: t`Classes`, empty: t`There are no classes available for this event`},
        {name: 'Registration', arabic: 'التسجيل', message: 'Registration is not open for this event', arabicMessage: 'التسجيل غير متاح لهذه الفعالية', label: t`Registration`, empty: t`Registration is not open for this event`},
        {name: 'Passes', arabic: 'تصاريح الحضور', message: 'There are no passes available for this event', arabicMessage: 'لا توجد تصاريح حضور متاحة لهذه الفعالية', label: t`Passes`, empty: t`There are no passes available for this event`},
    ];
    const automatic = !category.description && defaults.find(option => (
        (category.name === option.name && category.no_products_message === option.message)
        || (category.name === option.arabic && category.no_products_message === option.arabicMessage)
    ));

    return automatic ? {name: automatic.label, empty: automatic.empty} : {
        name: category.name,
        empty: category.no_products_message,
    };
};
