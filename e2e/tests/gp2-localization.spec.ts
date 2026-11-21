import type {Page} from '@playwright/test';
import {expect, test} from '../fixtures';
import {createDraftEvent, createLiveEventWithProduct} from '../api/factory';
import {EventCreatePage} from '../pages/event-create.page';
import {uniqueName} from '../utils/unique';

type Locale = 'en' | 'ar';
type Screen = readonly [path: string, english: string | RegExp, arabic: string | RegExp];

const localeSettings = {
  en: {language: 'English', direction: 'ltr'},
  ar: {language: 'العربية', direction: 'rtl'},
} as const;

function watchRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydrat|server rendered html/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  page.on('response', response => {
    if (response.status() >= 500 && ['127.0.0.1', 'localhost'].includes(new URL(response.url()).hostname)) {
      errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });
  return errors;
}

async function expectLocale(page: Page, locale: Locale) {
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('dir', localeSettings[locale].direction);
}

async function switchManagementLocale(page: Page, locale: Locale) {
  const navigationStart = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole('combobox', {name: /^(Language|اللغة)$/}).click();
  await page.getByRole('option', {name: localeSettings[locale].language, exact: true}).click();
  await expectLocale(page, locale);
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(navigationStart);
}

async function verifyScreens(page: Page, screens: readonly Screen[], locale: Locale) {
  for (const [path, english, arabic] of screens) {
    await test.step(`${locale} ${path}`, async () => {
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator('.ssr-loader')).toBeHidden();
      await expectLocale(page, locale);
      await expect(page.getByRole('heading', {name: locale === 'ar' ? arabic : english, exact: true}).first()).toBeVisible();
    });
  }
}

test('public and attendee screens keep their locale on mobile and preserve event titles', async ({page, api, account}) => {
  test.setTimeout(100_000);
  await page.setViewportSize({width: 390, height: 844});
  const errors = watchRuntimeErrors(page);
  const event = await createLiveEventWithProduct(api, {
    organizerId: account.organizerId,
    title: uniqueName('ملتقى GP2'),
    category: 'WORKSHOP',
  });
  const screens: Screen[] = [
    ['/', 'Event Management Platform', 'منصة إدارة الفعاليات'],
    ['/events', /All Available Events/, /كل الفعاليات المتاحة/],
    ['/about', 'About the Event Platform', 'عن منصة إدارة الفعاليات'],
    ['/auth/login', 'Log in to your account', 'تسجيل الدخول إلى حسابك'],
    ['/register', 'Create a New Attendee Account', 'إنشاء حساب مستفيد جديد'],
    [`/event/${event.eventId}/${event.slug}`, 'About the event', 'عن الفعالية'],
  ];
  await verifyScreens(page, screens, 'en');
  await expect(page.getByRole('heading', {name: event.title, exact: true, level: 1})).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', {name: 'العربية', exact: true}).click();
  await expectLocale(page, 'ar');
  await verifyScreens(page, screens, 'ar');
  await expect(page.getByRole('heading', {name: event.title, exact: true, level: 1})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});

test('organizer forms and management screens render in Arabic and English', async ({authedPage: page, api, account}) => {
  test.setTimeout(140_000);
  const errors = watchRuntimeErrors(page);
  const draft = await createDraftEvent(api, account.organizerId, {title: uniqueName('GP2 Localized Event')});
  const organizer = `/manage/organizer/${account.organizerId}`;
  const event = `/manage/event/${draft.eventId}`;
  const screens: Screen[] = [
    [`${organizer}/dashboard`, /Dashboard/, /لوحة التحكم/],
    [`${organizer}/settings`, 'Organizer Settings', 'إعدادات المنظم'],
    [`${organizer}/reports`, 'Reports', 'التقارير'],
    [`${event}/settings`, 'Event Settings', 'إعدادات الفعالية'],
    [`${event}/products`, 'Tickets & Products', 'التذاكر والمنتجات'],
    [`${event}/attendees`, 'Attendees', 'الحضور'],
    [`${event}/orders`, 'Orders', 'الطلبات'],
    [`${event}/check-in`, 'Check-In Lists', 'قوائم تسجيل الحضور'],
    [`${event}/reports`, 'Reports', 'التقارير'],
    ['/manage/profile', 'Manage Profile', 'إدارة الملف الشخصي'],
    ['/account/settings', 'Account Settings', 'إعدادات الحساب'],
  ];
  await verifyScreens(page, screens, 'en');
  await switchManagementLocale(page, 'ar');
  await verifyScreens(page, screens, 'ar');
  await page.goto(`${event}/settings`);
  await expect(page.locator('#event-details').getByLabel(/^الاسم/)).toHaveValue(draft.title);
  await switchManagementLocale(page, 'en');
  await expect(page.locator('#event-details').getByLabel(/^Name/)).toHaveValue(draft.title);

  const create = new EventCreatePage(page);
  await create.gotoDashboard(account.organizerId);
  await create.openCreateModal();
  await expect(page.getByRole('combobox', {name: 'Event Category'})).toBeVisible();
  await page.keyboard.press('Escape');
  await switchManagementLocale(page, 'ar');
  await page.getByRole('button', {name: 'إنشاء فعالية', exact: true}).first().click();
  await expect(page.getByLabel(/^اسم الفعالية/)).toBeVisible();
  await expect(page.getByRole('combobox', {name: 'تصنيف الفعالية'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'متابعة الإعداد'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('administration navigation and route headings render in both locales', async ({superAdminPage: page}) => {
  test.setTimeout(140_000);
  const errors = watchRuntimeErrors(page);
  const screens: Screen[] = [
    ['/admin', 'Admin Dashboard', 'لوحة تحكم المسؤول'],
    ['/admin/accounts', 'Accounts', 'الحسابات'],
    ['/admin/users', 'Users', 'المستخدمون'],
    ['/admin/events', 'Events', 'الفعاليات'],
    ['/admin/orders', 'Orders', 'الطلبات'],
    ['/admin/messages', 'Outgoing Messages', 'الرسائل الصادرة'],
    ['/admin/spam-events', 'Flagged Events', 'الفعاليات المبلّغ عنها'],
    ['/admin/announcements', 'Announcements', 'الإعلانات'],
    ['/admin/attribution', 'Attribution Analytics', 'تحليلات الإحالة'],
    ['/admin/deletion-requests', 'Deletion Requests', 'طلبات الحذف'],
    ['/admin/failed-jobs', 'Failed Jobs', 'المهام المتعثرة'],
    ['/admin/configurations', 'Configurations', 'الإعدادات'],
  ];
  await verifyScreens(page, screens, 'en');
  await switchManagementLocale(page, 'ar');
  await verifyScreens(page, screens, 'ar');
  const start = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole('link', {name: 'الحسابات', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'الحسابات', exact: true})).toBeVisible();
  await expectLocale(page, 'ar');
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(start);
  expect(errors).toEqual([]);
});
