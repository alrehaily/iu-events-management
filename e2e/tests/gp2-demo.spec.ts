import {expect, test} from '../fixtures';
import {createDraftEvent, createLiveEventWithProduct} from '../api/factory';
import {EventCreatePage} from '../pages/event-create.page';
import {EventSettingsPage} from '../pages/event-settings.page';
import {uniqueEmail, uniqueName} from '../utils/unique';

const earlierEvent = () => new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
const password = 'GP2-Fixture-Only-123!';
const attendee = () => ({
  first_name: 'Demo',
  last_name: 'Participant',
  email: uniqueEmail('gp2-attendee'),
  password,
});

test('TC-01 loads the IU home page', async ({page}) => {
  expect((await page.goto('/'))?.status()).toBe(200);
  await expect(page.getByRole('heading', {name: 'Event Management Platform'})).toBeVisible();
  await expect(page.locator('header img').first()).toBeVisible();
});

test('TC-02 follows the public navigation links', async ({page}) => {
  await page.goto('/');
  const nav = page.locator('header nav');
  await nav.getByRole('link', {name: 'Events', exact: true}).click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', {name: /All Available Events/})).toBeVisible();
  await nav.getByRole('link', {name: 'About Us', exact: true}).click();
  await expect(page).toHaveURL(/\/about$/);
  await nav.getByRole('link', {name: 'Home', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Event Management Platform'})).toBeVisible();
});

test('TC-03 lists published events and omits drafts', async ({page, api, account}) => {
  const live = await createLiveEventWithProduct(api, {organizerId: account.organizerId, startDate: earlierEvent()});
  const draft = await createDraftEvent(api, account.organizerId);
  await page.goto('/events');
  await expect(page.getByRole('heading', {name: live.title})).toBeVisible();
  await expect(page.getByRole('heading', {name: draft.title})).toHaveCount(0);
});

test('TC-04 searches by event title and clears the query', async ({page, api, account}) => {
  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId});
  await page.goto('/events');
  const search = page.getByRole('textbox', {name: /Search for an event/});
  await search.fill(event.title);
  await expect(page.getByRole('heading', {name: event.title})).toBeVisible();
  await search.fill(uniqueName('No matching event'));
  await expect(page.getByText('No events found matching your search')).toBeVisible();
  await page.getByRole('button', {name: /clear search/i}).click();
  await expect(search).toHaveValue('');
});

test('TC-05 filters events by category', async ({page, api, account}) => {
  const workshop = await createLiveEventWithProduct(api, {organizerId: account.organizerId, category: 'WORKSHOP', startDate: earlierEvent()});
  const tech = await createLiveEventWithProduct(api, {organizerId: account.organizerId, category: 'TECH', startDate: earlierEvent()});
  await page.goto('/events');
  await expect(page.getByRole('heading', {name: tech.title})).toBeVisible();
  await page.getByRole('button', {name: 'Category', exact: true}).click();
  await page.getByText('Workshops & Training', {exact: true}).first().click();
  await expect(page.getByRole('heading', {name: workshop.title})).toBeVisible();
  await expect(page.getByRole('heading', {name: tech.title})).toHaveCount(0);
});

test('TC-06 opens a real event and displays its details', async ({page, api, account}) => {
  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId, category: 'WORKSHOP'});
  await page.goto('/events');
  await page.getByRole('textbox', {name: /Search for an event/}).fill(event.title);
  await page.getByRole('heading', {name: event.title}).click();
  await expect(page.getByRole('heading', {name: event.title})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'About the event'})).toBeVisible();
  await expect(page.getByText('Event time', {exact: true})).toBeVisible();
  await expect(page.getByText('Workshops & Training', {exact: true})).toBeVisible();
});

test('TC-07 displays the platform purpose and intended users', async ({page}) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', {name: 'About the Event Platform'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Who is this Platform For?'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Explore Events'})).toBeVisible();
});

test('TC-08 fits the public pages to a mobile viewport', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  for (const path of ['/', '/events', '/about']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});

test('TC-09 switches Arabic and English in place and keeps the locale on reload', {tag: '@smoke'}, async ({page}) => {
  await page.context().clearCookies({name: 'locale'});
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text());
  });

  await page.goto('/');
  const document = page.locator('html');
  await expect(document).toHaveAttribute('lang', 'ar');
  await expect(document).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', {name: 'منصة إدارة الفعاليات', exact: true})).toBeVisible();
  const navigationStart = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole('button', {name: 'English', exact: true}).click();
  await expect(document).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', {name: 'Event Management Platform'})).toBeVisible();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(navigationStart);
  await page.reload();
  await expect(page.getByRole('heading', {name: 'Event Management Platform'})).toBeVisible();
  await page.locator('header nav').getByRole('link', {name: 'Events', exact: true}).click();
  await expect(page.getByRole('heading', {name: /All Available Events/})).toBeVisible();
  const catalogNavigationStart = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole('button', {name: 'العربية', exact: true}).click();
  await expect(document).toHaveAttribute('lang', 'ar');
  await expect(document).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', {name: /كل الفعاليات المتاحة/})).toBeVisible();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(catalogNavigationStart);
  await page.reload();
  await expect(page.getByRole('heading', {name: /كل الفعاليات المتاحة/})).toBeVisible();
  expect(errors).toEqual([]);
});

test('TC-10 verifies bilingual login, session persistence and logout', async ({page, publicApi, account}) => {
  const user = attendee();
  expect((await publicApi.post('public/attendee/register', {data: user})).status()).toBe(201);
  await page.goto('/auth/login');
  await expect(page.locator('.ssr-loader')).toBeHidden();
  const attendeeLogin = (button: string) => Promise.all([
    page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/public/attendee/login')
      && response.request().method() === 'POST'),
    page.getByRole('button', {name: button, exact: true}).click(),
  ]).then(([response]) => response);
  const navigation = page.locator('header');
  const bookings = navigation.getByRole('link', {name: 'My Bookings', exact: true});
  const arabicBookings = navigation.getByRole('link', {name: 'تسجيلاتي', exact: true});

  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.getByRole('textbox', {name: /^Email\b/}).fill(user.email);
  await page.getByLabel('Password', {exact: true}).fill(password + '-wrong');
  expect((await attendeeLogin('Log In')).status()).toBe(401);
  await expect(page.getByText('Incorrect email or password.', {exact: true})).toBeVisible();
  await page.getByLabel('Password', {exact: true}).fill(password);
  expect((await attendeeLogin('Log In')).status()).toBe(200);
  await expect(bookings).toBeVisible();
  await page.reload();
  await expect(bookings).toBeVisible();
  await page.getByRole('button', {name: 'Log Out', exact: true}).click();
  await expect(bookings).toHaveCount(0);
  await navigation.getByRole('link', {name: 'Log In', exact: true}).click();
  await page.getByRole('combobox', {name: 'Language', exact: true}).click();
  await page.getByRole('option', {name: 'العربية', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('textbox', {name: /^البريد الإلكتروني/}).fill(user.email);
  await page.getByLabel('كلمة المرور', {exact: true}).fill(password + '-wrong');
  expect((await attendeeLogin('تسجيل الدخول')).status()).toBe(401);
  await expect(page.getByText('البريد الإلكتروني أو كلمة المرور غير صحيحة.', {exact: true})).toBeVisible();
  await page.getByLabel('كلمة المرور', {exact: true}).fill(password);
  expect((await attendeeLogin('تسجيل الدخول')).status()).toBe(200);
  await expect(arabicBookings).toBeVisible();
  await page.reload();
  await expect(arabicBookings).toBeVisible();
  await page.getByRole('button', {name: 'تسجيل خروج', exact: true}).click();
  await expect(arabicBookings).toHaveCount(0);
  await page.getByRole('button', {name: 'English', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.goto('/manage/login');
  await expect(page.locator('.ssr-loader')).toBeHidden();
  await page.getByRole('textbox', {name: /^Institutional Email/}).fill(account.email);
  await page.getByLabel('Password', {exact: true}).fill(account.password);
  const organizerLogin = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/auth/login') && response.request().method() === 'POST');
  await page.getByRole('button', {name: 'Log In as Organizer'}).click();
  expect((await organizerLogin).status()).toBe(200);
  await expect(page).toHaveURL(/\/manage\/(?:events|organizer\/\d+)/);
  const organizerProfile = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/users/me'));
  await page.reload();
  expect((await organizerProfile).status()).toBe(200);
  await expect(page).toHaveURL(/\/manage\/(?:events|organizer\/\d+)/);
  await page.goto('/');
  const dashboard = navigation.getByRole('link', {name: 'Organizer Dashboard', exact: true});
  await expect(dashboard).toBeVisible();
  await page.getByRole('button', {name: 'Log Out', exact: true}).click();
  await expect(dashboard).toHaveCount(0);
  await page.reload();
  await expect(navigation.getByRole('link', {name: 'Log In', exact: true})).toBeVisible();
});

test('TC-11 creates an attendee and validates missing and duplicate information', async ({page, publicApi}) => {
  const user = attendee();
  expect((await publicApi.post('public/attendee/register', {data: {email: user.email}})).status()).toBe(422);
  await page.goto('/register');
  await page.getByLabel('First Name').fill(user.first_name);
  await page.getByLabel('Last Name').fill(user.last_name);
  await page.getByLabel(/^Email/).fill(user.email);
  await page.getByLabel(/^Password /).fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  const registration = page.waitForResponse(response => response.url().endsWith('/public/attendee/register'));
  await page.getByRole('button', {name: 'Create Account & Explore Events'}).click();
  expect((await registration).status()).toBe(201);
  await expect(page.locator('header').getByRole('link', {name: 'My Bookings'})).toBeVisible();
  expect((await publicApi.post('public/attendee/register', {data: user})).status()).toBe(409);
});

test('TC-12 enforces attendee, organizer and anonymous route access', async ({page, authedPage, publicApi, baseURL, account}) => {
  const organizerPath = `/manage/organizer/${account.organizerId}/dashboard`;
  const visit = async (browserPage: typeof page, path: string) => {
    const response = await browserPage.goto(path);
    expect(response?.status(), path).toBeLessThan(500);
  };
  const adminRoute = /\/admin\/?$/;
  const organizerRoute = /\/manage\/organizer\/\d+\/dashboard\/?$/;
  for (const path of ['admin/dashboard', 'events']) {
    expect((await publicApi.get(path)).status(), path).toBe(401);
  }
  await visit(page, '/admin');
  await expect(page).not.toHaveURL(adminRoute);
  await visit(page, organizerPath);
  await expect(page).not.toHaveURL(organizerRoute);

  const registration = await publicApi.post('public/attendee/register', {data: attendee()});
  expect(registration.status()).toBe(201);
  const {token} = await registration.json();
  await page.context().addCookies([{name: 'token', value: token, url: baseURL!}]);
  const headers = {Authorization: `Bearer ${token}`};
  expect((await publicApi.get('admin/dashboard', {headers})).status()).toBe(403);
  expect((await publicApi.get('events', {headers})).status()).toBe(403);
  await visit(page, '/admin');
  await expect(page).not.toHaveURL(adminRoute);
  await visit(page, organizerPath);
  await expect(page).not.toHaveURL(organizerRoute);

  const organizerHeaders = {Authorization: `Bearer ${account.token}`};
  expect((await publicApi.get('admin/dashboard', {headers: organizerHeaders})).status()).toBe(403);
  expect((await publicApi.get('events', {headers: organizerHeaders})).status()).toBe(200);
  await visit(authedPage, '/admin');
  await expect(authedPage).not.toHaveURL(adminRoute);
  await visit(authedPage, organizerPath);
  await expect(authedPage.getByRole('link', {name: 'Settings', exact: true})).toBeVisible();
  await expect(authedPage).toHaveURL(organizerRoute);
});

test('TC-13 creates an event through the organizer UI', async ({authedPage}) => {
  const title = uniqueName('GP2 Created');
  const events = new EventCreatePage(authedPage);
  await events.gotoDashboard();
  await events.openCreateModal();
  await events.createSingleEvent({title, category: 'Workshops & Training'});
  await expect(authedPage.getByText(title).first()).toBeVisible();
});

test('TC-14 edits an event and retains the new name on reload', async ({authedPage, api, account}) => {
  const draft = await createDraftEvent(api, account.organizerId);
  const title = uniqueName('GP2 Edited');
  const settings = new EventSettingsPage(authedPage);
  await settings.goto(draft.eventId);
  await settings.detailsNameInput.fill(title);
  await settings.saveSection('event-details');
  await expect(authedPage.getByText(title).first()).toBeVisible();
  await authedPage.reload();
  await expect(settings.detailsNameInput).toHaveValue(title);
});

test('TC-15 publishes a draft and exposes it in the public catalog', async ({authedPage, page, api, account}) => {
  const draft = await createDraftEvent(api, account.organizerId);
  await authedPage.goto(`/manage/event/${draft.eventId}/dashboard`);
  const status = authedPage.getByTestId('event-status-toggle');
  await expect(status).toContainText('Draft');
  await status.click();
  await authedPage.getByTestId('publish-event-confirm-button').click();
  await expect(authedPage.getByText('Your event is live!')).toBeVisible();
  await authedPage.getByRole('button', {name: 'Done', exact: true}).click();
  await expect(status).toContainText('Live');
  await page.goto('/events');
  await page.getByRole('textbox', {name: /Search for an event/}).fill(draft.title);
  await expect(page.getByRole('heading', {name: draft.title})).toBeVisible();
});
