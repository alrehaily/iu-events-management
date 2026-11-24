import type {Page, TestInfo} from '@playwright/test';
import {expect, test} from '../fixtures';
import {createCompletedOrder, createDraftEvent, createLiveEventWithProduct} from '../api/factory';
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

async function verifyScreens(page: Page, screens: readonly Screen[], locale: Locale, testInfo?: TestInfo) {
  for (const [path, english, arabic] of screens) {
    await test.step(`${locale} ${path}`, async () => {
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator('.ssr-loader')).toBeHidden();
      await expectLocale(page, locale);
      await expect(page.getByRole('heading', {name: locale === 'ar' ? arabic : english, exact: true}).first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      if (testInfo) await page.screenshot({path: testInfo.outputPath(`${locale}-${path.replace(/[^\w-]+/g, '-').slice(1) || 'home'}.png`)});
    });
  }
}

test('public and attendee screens keep their locale on mobile and preserve event titles', async ({page, api, account}, testInfo) => {
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
  await verifyScreens(page, screens, 'en', testInfo);
  await expect(page.getByRole('heading', {name: event.title, exact: true, level: 1})).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', {name: 'العربية', exact: true}).click();
  await expectLocale(page, 'ar');
  await verifyScreens(page, screens, 'ar', testInfo);
  await expect(page.getByRole('heading', {name: event.title, exact: true, level: 1})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});

test('organizer forms and management screens render in Arabic and English', async ({authedPage: page, api, account}, testInfo) => {
  test.setTimeout(220_000);
  const errors = watchRuntimeErrors(page);
  const draft = await createDraftEvent(api, account.organizerId, {title: uniqueName('GP2 Localized Event')});
  const organizer = `/manage/organizer/${account.organizerId}`;
  const event = `/manage/event/${draft.eventId}`;
  const screens: Screen[] = [
    [`${organizer}/dashboard`, /Dashboard/, /لوحة التحكم/],
    [`${organizer}/settings`, 'Organizer Settings', 'إعدادات المنظم'],
    [`${organizer}/reports`, 'Reports', 'التقارير'],
    [`${organizer}/locations`, 'Locations', /المواقع/],
    [`${event}/dashboard`, 'Event Dashboard', /لوحة تحكم الفعالية/],
    [`${event}/settings`, 'Event Settings', 'إعدادات الفعالية'],
    [`${event}/products`, 'Tickets & Products', 'التذاكر والمنتجات'],
    [`${event}/attendees`, 'Attendees', 'الحضور'],
    [`${event}/orders`, 'Orders', 'الطلبات'],
    [`${event}/check-in`, 'Check-In Lists', 'قوائم تسجيل الحضور'],
    [`${event}/reports`, 'Reports', 'التقارير'],
    [`${event}/capacity-assignments`, 'Capacity Management', 'إدارة السعة'],
    ['/manage/profile', 'Manage Profile', 'إدارة الملف الشخصي'],
    ['/account/settings', 'Account Settings', 'إعدادات الحساب'],
    ['/account/taxes-and-fees', 'Taxes and Fees', /الضرائب والرسوم/],
    ['/account/users', 'Users', /المستخدمون/],
    ['/account/danger-zone', 'Danger Zone', /منطقة الخطر/],
    ['/account/event-defaults', 'Event Defaults', /الإعدادات الافتراضية/],
  ];
  await verifyScreens(page, screens, 'en', testInfo);
  await switchManagementLocale(page, 'ar');
  await verifyScreens(page, screens, 'ar', testInfo);
  await page.goto(`${event}/settings`);
  await expect(page.locator('#event-details').getByLabel(/^الاسم/)).toHaveValue(draft.title);
  await switchManagementLocale(page, 'en');
  await expect(page.locator('#event-details').getByLabel(/^Name/)).toHaveValue(draft.title);

  const create = new EventCreatePage(page);
  await create.gotoDashboard(account.organizerId);
  await create.openCreateModal();
  await expect(page.getByRole('combobox', {name: 'Event Category'})).toBeVisible();
  await page.getByRole('button', {name: 'Close modal', exact: true}).click();
  await expect(page.getByRole('combobox', {name: 'Event Category'})).toBeHidden();
  await switchManagementLocale(page, 'ar');
  await page.getByRole('button', {name: 'إنشاء فعالية', exact: true}).first().click();
  await expect(page.getByLabel(/^اسم الفعالية/)).toBeVisible();
  await expect(page.getByRole('combobox', {name: 'تصنيف الفعالية'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'متابعة الإعداد'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('orders, waitlist, webhooks, messages, affiliates and promo controls use the active language', async ({
  authedPage: page, api, account, publicApi,
}, testInfo) => {
  test.setTimeout(180_000);
  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId, category: 'WORKSHOP'});
  await createCompletedOrder(publicApi, event);
  const eventPath = `/manage/event/${event.eventId}`;
  const errors = watchRuntimeErrors(page);
  const screenshot = (name: string) => page.screenshot({path: testInfo.outputPath(`${name}.png`)});
  const sorts = [
    ['Position ascending', 'الموضع تصاعديًا', 'position', 'asc'],
    ['Position descending', 'الموضع تنازليًا', 'position', 'desc'],
    ['Oldest first', 'الأقدم أولاً', 'created_at', 'asc'],
    ['Newest first', 'الأحدث أولاً', 'created_at', 'desc'],
    ['Status A-Z', 'الحالة من أ إلى ي', 'status', 'asc'],
    ['Status Z-A', 'الحالة من ي إلى أ', 'status', 'desc'],
  ] as const;
  for (const locale of ['en', 'ar'] as const) {
    const ar = locale === 'ar';
    await page.goto(`${eventPath}/orders`);
    if (ar) await switchManagementLocale(page, 'ar');
    await page.getByRole('button', {name: ar ? 'الأعمدة' : 'Columns', exact: true}).click();
    await screenshot(`${locale}-orders-columns`);
    await page.keyboard.press('Escape');
    await page.getByTestId('order-actions-trigger').click();
    await expect(page.getByRole('menuitem').first()).toBeVisible();
    await screenshot(`${locale}-orders-actions`);

    await page.goto(`${eventPath}/sold-out-waitlist`);
    const sort = page.getByRole('combobox', {name: ar ? 'الترتيب حسب' : 'Sort by'});
    for (const [english, arabic, field, direction] of sorts) {
      await sort.click();
      await page.getByRole('option', {name: ar ? arabic : english, exact: true}).click();
      await expect(sort).toHaveValue(ar ? arabic : english);
      await expect(page).toHaveURL(url => url.searchParams.get('sortBy') === field && url.searchParams.get('sortDirection') === direction);
      await page.waitForLoadState('networkidle');
    }
    await sort.click();
    await screenshot(`${locale}-waitlist-sorts`);
    await page.keyboard.press('Escape');

    for (const [path, button] of [
      ['webhooks', 'webhook-add-button'],
      ['messages', 'message-compose-button'],
      ['affiliates', 'affiliate-create-button'],
      ['promo-codes', 'promo-code-create-button'],
      ['products', 'product-create-button'],
    ]) {
      await page.goto(`${eventPath}/${path}`);
      const action = page.getByTestId(button).first();
      await expect(action).toBeVisible();
      if (path === 'messages') {
        await expect(action).toHaveText(ar ? 'إرسال أول رسالة' : 'Send First Message');
        await expect(page.getByTestId(button)).toHaveCount(1);
      }
      if (path === 'webhooks') {
        await expect(page.getByText(ar ? /ترسل خطافات الويب إشعارات فورية/ : /Webhooks instantly notify/)).toBeVisible();
      }
      await screenshot(`${locale}-${path}`);
      await action.click();
      await expect(page.getByRole('dialog').last()).toBeVisible();
      if (path === 'webhooks') {
        await page.getByTestId('webhook-event-types').click();
        await expect(page.getByTestId('webhook-event-types-option-order.created')).toBeVisible();
      }
      await screenshot(`${locale}-${path}-dialog`);
      await page.waitForLoadState('networkidle');
    }
  }
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

test('dashboard chrome stays green and scrolls after dismissing the date picker', async ({authedPage: page, account}) => {
  await page.setViewportSize({width: 1100, height: 640});
  const create = new EventCreatePage(page);
  await create.gotoDashboard(account.organizerId);
  const dashboard = page.locator('#organizer-manage-container');
  const topbar = dashboard.locator('[class*="_topBar_"]').first();
  const sidebar = dashboard.locator('[class*="_sidebar_"]').first();
  await expect(topbar).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(topbar).toHaveCSS('background-image', /linear-gradient.*rgb\(8, 75, 47\)/);
  await expect(sidebar).toHaveCSS('background-image', /linear-gradient.*rgb\(8, 75, 47\)/);

  await create.openCreateModal();
  const startDate = page.getByRole('button', {name: /^Start Date & Time/});
  const originalDate = await startDate.innerText();
  await startDate.click();
  const datePicker = page.getByRole('dialog').last();
  await expect(datePicker).toBeVisible();
  await expect(datePicker.locator('button[data-selected]').first()).toBeVisible();
  await datePicker.locator('td button:not([data-selected]):not([data-outside]):not([disabled])').last().click();
  await page.keyboard.press('Escape');
  await expect(datePicker).toBeHidden();
  await expect(startDate).not.toHaveText(originalDate);
  await page.getByRole('button', {name: 'Close modal', exact: true}).click();
  await page.getByRole('link', {name: 'Settings', exact: true}).click();
  const main = page.locator('#app-manage-main');
  await main.hover();
  await page.mouse.wheel(0, 520);
  await expect.poll(() => main.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollHeight - root.clientHeight;
  })).toBeLessThanOrEqual(1);
  await expect(topbar).toBeVisible();
});
