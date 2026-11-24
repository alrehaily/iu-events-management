import {randomUUID} from 'node:crypto';
import {expect, test} from '../fixtures';
import {createLiveEventWithProduct} from '../api/factory';
import {CheckoutPage} from '../pages/checkout.page';
import {uniqueEmail, uniqueName} from '../utils/unique';

test('a guest signs in, recovers a completed free booking and finds its localized ticket link', async ({page, account, api, publicApi, mailpit}, testInfo) => {
  test.setTimeout(110_000);
  await page.setViewportSize({width: 390, height: 844});
  const buyer = {firstName: 'GP2', lastName: 'Participant', email: uniqueEmail('gp2-mobile')};
  const password = `Gp2!${randomUUID()}`;
  const registration = await publicApi.post('public/attendee/register', {
    data: {first_name: buyer.firstName, last_name: buyer.lastName, email: buyer.email, password},
  });
  expect(registration.status()).toBe(201);
  const event = await createLiveEventWithProduct(api, {
    organizerId: account.organizerId,
    category: 'WORKSHOP',
    title: uniqueName('GP2 Booking'),
  });
  const checkout = new CheckoutPage(page);
  await checkout.gotoPublicEvent(event.eventId, event.slug);
  const eventUrl = page.url();
  await checkout.setFirstProductQuantity(1);
  await page.getByTestId('checkout-continue-button').click();
  await expect(page).toHaveURL(/\/auth\/login\?redirect=/);
  await expect(page.locator('.ssr-loader')).toBeHidden();
  await page.getByRole('textbox', {name: /^Email\b/}).fill(buyer.email);
  await page.getByLabel('Password', {exact: true}).fill(password);
  await page.getByRole('button', {name: 'Log In', exact: true}).click();
  await expect(page.locator('header').getByRole('link', {name: 'My Bookings'})).toBeVisible();

  await expect(page).toHaveURL(eventUrl);
  await checkout.gotoPublicEvent(event.eventId, event.slug);
  await checkout.setFirstProductQuantity(1);
  await checkout.continueToCheckout();
  await expect(page.getByRole('button', {name: 'Complete Order'})).toBeEnabled();
  await expect(page.getByText('Your Details', {exact: true})).toHaveCount(0);
  await expect(page.getByText(buyer.email, {exact: true})).toHaveCount(0);
  await expect(page.getByRole('textbox', {name: 'First Name'})).toHaveCount(0);
  await expect(page.getByRole('button', {name: /Order Summary.*SAR/})).toBeVisible();
  await page.screenshot({path: testInfo.outputPath('checkout-en.png')});
  let completedResponses = 0;
  await page.route('**/public/events/*/order/*', async route => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }
    expect(route.request().postDataJSON().use_attendee_profile).toBe(true);
    const completed = await route.fetch();
    expect(completed.status()).toBe(200);
    const payload = (await completed.json()).data;
    expect(payload.email).toBe(buyer.email);
    expect(payload.first_name).toBe(buyer.firstName);
    const replay = await route.fetch();
    expect(replay.status()).toBe(200);
    expect((await replay.json()).data.short_id).toBe(payload.short_id);
    ++completedResponses;
    await route.fulfill({response: completed, status: 500, json: {message: 'Simulated response failure after commit'}});
  });
  await checkout.completeFreeOrder();
  expect(completedResponses).toBe(1);
  await expect(page.getByText(`You're going to ${event.title}`)).toBeVisible();
  await page.screenshot({path: testInfo.outputPath('confirmation-en.png')});
  await mailpit.waitForMessage(buyer.email, {subjectContains: event.title});

  await page.goto('/my-registrations');
  await expect(page.getByText(event.title, {exact: true})).toHaveCount(1);
  await page.getByRole('button', {name: 'العربية', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByText(event.title, {exact: true})).toBeVisible();
  await expect(page.getByRole('link', {name: /عرض التذكرة/})).toBeVisible();
});

test('an expired registration deadline prevents inventory reservation', async ({page, account, api, publicApi}) => {
  const event = await createLiveEventWithProduct(api, {
    organizerId: account.organizerId,
    saleEndDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  });
  const response = await publicApi.post(`public/events/${event.eventId}/order`, {
    data: {products: [{product_id: event.productId, quantities: [{price_id: event.priceId, quantity: 1}]}]},
  });
  expect(response.status()).toBe(422);
  expect(JSON.stringify(await response.json())).toContain(`Sales for ${event.productTitle} have ended`);
  const checkout = new CheckoutPage(page);
  await checkout.gotoPublicEvent(event.eventId, event.slug);
  await expect(page.getByRole('dialog').getByText('Sales ended', {exact: true})).toBeVisible();
  await expect(page.getByTestId('checkout-continue-button')).toBeDisabled();
});

test('a single-ticket attendee completes an incomplete profile and returns to Arabic checkout', async ({page, account, api, publicApi}, testInfo) => {
  const attendee = {
    first_name: 'A'.repeat(45),
    last_name: 'Participant',
    email: uniqueEmail('gp2-profile'),
    password: `Gp2!${randomUUID()}`,
  };
  const response = await publicApi.post('public/attendee/register', {data: attendee});
  expect(response.status()).toBe(201);
  const session = await response.json();
  await page.addInitScript(({token, user}) => {
    if (!localStorage.getItem('iu_attendee_token')) {
      localStorage.setItem('iu_attendee_token', token);
      localStorage.setItem('iu_attendee_user', JSON.stringify(user));
    }
  }, session);

  const event = await createLiveEventWithProduct(api, {organizerId: account.organizerId});
  const checkout = new CheckoutPage(page);
  await checkout.gotoPublicEvent(event.eventId, event.slug);
  await checkout.setFirstProductQuantity(1);
  await checkout.continueToCheckout();
  await expect(page.getByRole('button', {name: 'Complete Order'})).toHaveCount(0);
  const checkoutPath = new URL(page.url()).pathname;
  await page.getByRole('link', {name: 'Update profile'}).click();
  await expect(page).toHaveURL(/\/attendee\/profile/);
  await page.getByLabel('First Name').fill('Demo');
  await page.getByRole('button', {name: 'العربية', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', {name: /تحديث الملف الشخصي/}).click();
  await expect(page).toHaveURL(url => url.pathname === checkoutPath);
  const completeOrder = page.getByRole('button', {name: 'إتمام الطلب'});
  await expect(completeOrder).toBeEnabled();
  await expect(page.getByText('بياناتك', {exact: true})).toHaveCount(0);
  await expect(page.getByRole('button', {name: /ملخص الطلب.*ر\.س/})).toBeVisible();
  await page.screenshot({path: testInfo.outputPath('checkout-ar.png')});
  await completeOrder.click();
  await expect(page).toHaveURL(/\/summary/);
  await expect(page.getByText('Demo Participant', {exact: true}).first()).toBeVisible();
  await page.screenshot({path: testInfo.outputPath('confirmation-ar.png')});
});
