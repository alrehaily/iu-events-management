import {expect, test} from '../fixtures';
import {createCompletedOrder, createDraftEvent, createLiveEventWithProduct} from '../api/factory';
import {uniqueEmail, uniqueName} from '../utils/unique';
import {randomUUID} from 'node:crypto';

const password = 'GP2-Extended-Fixture-123!';
const user = () => ({first_name: 'Demo', last_name: 'Attendee', email: uniqueEmail('gp2-extra'), password});

test('organizer and administrator menus switch language without navigation', async ({authedPage, account, superAdminPage}) => {
  for (const [page, path, english, arabic] of [
    [authedPage, `/manage/organizer/${account.organizerId}/dashboard`, 'Settings', 'الإعدادات'],
    [superAdminPage, '/admin', 'Accounts', 'الحسابات'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('link', {name: english, exact: true})).toBeVisible();
    const started = await page.evaluate(() => performance.timeOrigin);
    await page.getByPlaceholder('Language', {exact: true}).click();
    await page.getByRole('option', {name: 'العربية', exact: true}).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('link', {name: arabic, exact: true})).toBeVisible();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(started);
    await page.reload();
    await expect(page.getByRole('link', {name: arabic, exact: true})).toBeVisible();
    await page.locator('input[role="combobox"]').first().click();
    await page.getByRole('option', {name: 'English', exact: true}).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('link', {name: english, exact: true})).toBeVisible();
  }
});

test('a draft stays private and SSR preview requests use the viewer session', async ({page, api, account, publicApi, freshAccount}) => {
  const draft = await createDraftEvent(api, account.organizerId, {title: uniqueName('GP2 Private Draft')});
  const eventPath = `public/events/${draft.eventId}`;
  expect((await publicApi.get(eventPath)).status()).toBe(404);
  expect((await publicApi.get(eventPath, {headers: {Authorization: `Bearer ${account.token}`}})).status()).toBe(200);
  expect((await publicApi.get(eventPath, {headers: {Authorization: `Bearer ${freshAccount.token}`}})).status()).toBe(404);

  const preview = `/event/${draft.eventId}/${draft.slug}`;
  const [ownerResponse, otherResponse, publicResponse] = await Promise.all([
    page.request.get(preview, {headers: {Cookie: `token=${account.token}; locale=ar`}}),
    page.request.get(preview, {headers: {Cookie: `token=${freshAccount.token}; locale=en`}}),
    page.request.get(preview),
  ]);
  for (const response of [ownerResponse, otherResponse, publicResponse]) {
    expect(response.status()).toBeLessThan(500);
  }
  const ownerHtml = await ownerResponse.text();
  const otherHtml = await otherResponse.text();
  expect(ownerHtml).toContain('<html lang="ar" dir="rtl">');
  expect(ownerHtml).toContain(draft.title);
  expect(otherHtml).toContain('<html lang="en" dir="ltr">');
  expect(otherHtml).not.toContain(draft.title);
  expect(await publicResponse.text()).not.toContain(draft.title);
});

test('a checked-in attendee can open and print a certificate and log out', async ({page, api, publicApi, account}, testInfo) => {
  test.setTimeout(100_000);
  const attendee = user();
  const created = await publicApi.post('public/attendee/register', {data: attendee});
  expect(created.status()).toBe(201);
  const {token} = await created.json();
  const headers = {Authorization: `Bearer ${token}`};
  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId, category: 'WORKSHOP'});
  await api.updateEventSettings(event.eventId, {is_certificate_eligible: true});
  const order = await createCompletedOrder(publicApi, event, {
    buyerEmail: attendee.email,
    buyerFirstName: attendee.first_name,
    buyerLastName: attendee.last_name,
  });
  const participant = order.attendees[0];
  const certificatePath = `public/attendees/${participant.publicId}/certificate`;
  const other = await publicApi.post('public/attendee/register', {data: user()});
  expect(other.status()).toBe(201);
  const otherHeaders = {Authorization: `Bearer ${(await other.json()).token}`};
  expect((await publicApi.get(certificatePath)).status()).toBe(401);
  expect((await publicApi.get(certificatePath, {headers: otherHeaders})).status()).toBe(403);
  const otherBookings = await publicApi.get('public/attendee/registrations', {
    headers: otherHeaders,
    params: {email: attendee.email},
  });
  expect(otherBookings.status()).toBe(200);
  expect((await otherBookings.json()).registrations).toEqual([]);
  const cancelPath = `public/attendee/registrations/${order.orderShortId}/cancel`;
  expect((await publicApi.post(cancelPath, {headers: otherHeaders})).status()).toBe(403);
  expect((await publicApi.get(certificatePath, {headers})).status()).toBe(422);
  const checkIn = await publicApi.post(`events/${event.eventId}/attendees/${participant.publicId}/check_in`, {
    headers: {Authorization: `Bearer ${account.token}`},
    data: {action: 'check_in'},
  });
  expect(checkIn.status()).toBe(200);
  const certificate = await publicApi.get(certificatePath, {headers});
  expect(certificate.status()).toBe(200);
  const data = await certificate.json();
  expect(data.eligible).toBe(true);
  expect(data.certificate_code).toMatch(/^IU-CERT-/);
  const verify = await publicApi.get(`public/certificates/verify/${data.certificate_code}`);
  expect(verify.status()).toBe(200);

  await page.goto('/auth/login');
  await expect(page.locator('.ssr-loader')).toBeHidden();
  await page.getByRole('textbox', {name: /^Email\b/}).fill(attendee.email);
  await page.getByLabel('Password', {exact: true}).fill(password);
  await page.getByRole('button', {name: 'Log In', exact: true}).click();
  const bookings = page.locator('header').getByRole('link', {name: 'My Bookings'});
  await bookings.click();
  await expect(page.getByText(event.title, {exact: true})).toBeVisible();
  await page.reload();
  await expect(page.getByText(event.title, {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Attendance Certificate', exact: true}).click();
  await expect(page.locator('#iu-certificate-printable')).toContainText(data.certificate_code);
  await page.evaluate(() => {
    window.print = () => document.body.setAttribute('data-certificate-print', 'requested');
  });
  await page.getByRole('button', {name: /print.*PDF/i}).click();
  await expect(page.locator('body')).toHaveAttribute('data-certificate-print', 'requested');
  await page.emulateMedia({media: 'print'});
  await expect(page.locator('#iu-certificate-printable')).toBeVisible();
  const certificatePdf = await page.pdf({printBackground: true, preferCSSPageSize: true, path: testInfo.outputPath('attendance-certificate.pdf')});
  expect(certificatePdf.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  expect(certificatePdf.length).toBeGreaterThan(8000);
  expect(certificatePdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(1);
  await page.emulateMedia({media: 'screen'});
  await testInfo.attach('Attendance certificate', {body: certificatePdf, contentType: 'application/pdf'});
  await page.getByRole('button', {name: 'Close', exact: true}).click();
  await page.locator('header').getByRole('button', {name: /log ?out/i}).click();
  await expect(page.locator('header').getByRole('link', {name: 'My Bookings'})).toHaveCount(0);
});

test('a free booking is constrained by capacity and can be cancelled by its owner', async ({api, publicApi, account}) => {
  const attendee = user();
  const created = await publicApi.post('public/attendee/register', {data: attendee});
  const {token} = await created.json();
  const headers = {Authorization: `Bearer ${token}`};
  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId, quantityAvailable: 1});
  const order = await createCompletedOrder(publicApi, event, {buyerEmail: attendee.email});
  const reserve = () => publicApi.post(`public/events/${event.eventId}/order`, {
    data: {products: [{product_id: event.productId, quantities: [{price_id: event.priceId, quantity: 1}]}]},
  });
  expect([409, 422]).toContain((await reserve()).status());

  const cancel = `public/attendee/registrations/${order.orderShortId}/cancel`;
  expect((await publicApi.post(cancel)).status()).toBe(401);
  expect((await publicApi.post(cancel, {headers})).status()).toBe(200);
  const bookings = await publicApi.get('public/attendee/registrations', {headers});
  expect((await bookings.json()).registrations).toEqual(expect.arrayContaining([
    expect.objectContaining({short_id: order.orderShortId, status: 'CANCELLED'}),
  ]));
});

test('sequential duplicate event registrations are rejected', async ({api, publicApi, account}) => {
  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId});
  const buyerEmail = uniqueEmail('gp2-duplicate');
  await createCompletedOrder(publicApi, event, {buyerEmail});
  await expect(createCompletedOrder(publicApi, event, {buyerEmail})).rejects.toThrow(/409|422/);
});

test('the catalog distinguishes API failure from an empty search and can retry', async ({page}) => {
  await page.route('**/public/events?**', route => route.fulfill({status: 503, json: {message: 'fixture outage'}}));
  await page.goto('/events');
  await expect(page.getByText('Unable to load events', {exact: true})).toBeVisible();
  await expect(page.getByText('No events found matching your search')).toHaveCount(0);
  await page.unroute('**/public/events?**');
  await page.getByRole('button', {name: 'Try again', exact: true}).click();
  await expect(page.getByText('Unable to load events', {exact: true})).toHaveCount(0);
});
test('local attendee signup cannot grant organizer access and organizer accounts stay isolated', async ({
  api, account, freshAccount, publicApi,
}) => {
  test.skip(process.env.E2E_GP2_ORGANIZER_CLI !== 'true', 'Requires the isolated GP2 fixture database');
  const privateEvent = await createDraftEvent(api, account.organizerId);
  const email = uniqueEmail('gp2-no-organizer');
  const password = `Gp2!${randomUUID()}`;
  const attendeeSignup = await publicApi.post('public/attendee/register', {
    data: {email, password, first_name: 'Demo', last_name: 'Attendee', role: 'SUPERADMIN', account_id: 1},
  });
  expect(attendeeSignup.status()).toBe(201);
  const attendee = await attendeeSignup.json();
  expect(attendee.user.role).toBe('ATTENDEE');
  const organizerRequest = await publicApi.post('auth/register', {
    data: {
      email, password, password_confirmation: password, first_name: 'Demo', last_name: 'Attendee',
      timezone: 'Asia/Riyadh', currency_code: 'SAR', locale: 'en',
    },
  });
  expect(organizerRequest.status()).toBe(403);

  const settingsPath = `events/${privateEvent.eventId}/settings`;
  const asUser = (token: string) => ({headers: {Authorization: `Bearer ${token}`}});
  const outsider = asUser(freshAccount.token);
  expect((await publicApi.get(settingsPath, outsider)).status()).toBe(403);
  expect((await publicApi.patch(settingsPath, {...outsider, data: {target_audience: 'Incorrect'}})).status()).toBe(403);
  expect((await publicApi.get(settingsPath, asUser(attendee.token))).status()).toBe(403);
  expect((await publicApi.get(`organizers/${account.organizerId}`, outsider)).status()).toBe(403);
  expect((await publicApi.get('admin/accounts', outsider)).status()).toBe(403);
  const saved = await publicApi.get(settingsPath, asUser(account.token));
  expect(saved.status()).toBe(200);
  expect((await saved.json()).data.target_audience).toBeUndefined();
});
