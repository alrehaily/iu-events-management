import { SupportedLocales } from '../locales.ts';

export const localeFormats: Record<SupportedLocales, {
    fullDateTime: string;
    shortDateTime: string;
    shortDate: string;
    chartDate: string;
    dayMonthTime: string;
    monthShort: string;
    dayOfMonth: string;
    dayName: string;
    timeOnly: string;
    timezone: string;
    dateTimePicker: string;
}> = {
    'en': {
        fullDateTime: 'ddd, MMM D, YYYY h:mm A',
        shortDateTime: 'MMM D, YYYY h:mma',
        shortDate: 'MMM D, YYYY',
        chartDate: 'MMM D',
        dayMonthTime: 'MMM D, h:mm A',
        monthShort: 'MMM',
        dayOfMonth: 'D',
        dayName: 'dddd, MMMM D',
        timeOnly: 'h:mm A',
        timezone: 'z',
        dateTimePicker: 'MMM DD, YYYY [at] h:mm A'
    },
    'ar': {
        fullDateTime: 'dddd، D MMMM YYYY h:mm A',
        shortDateTime: 'D MMM YYYY h:mm A',
        shortDate: 'YYYY/MM/DD',
        chartDate: 'D MMM',
        dayMonthTime: 'D MMM، h:mm A',
        monthShort: 'MMM',
        dayOfMonth: 'D',
        dayName: 'dddd، D MMMM',
        timeOnly: 'h:mm A',
        timezone: 'z',
        dateTimePicker: 'YYYY/MM/DD h:mm A'
    },
};
