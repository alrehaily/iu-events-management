import {randomUUID} from 'node:crypto';
import {expect, test} from '../fixtures';
import {createLiveEventWithProduct} from '../api/factory';
import {CheckoutPage} from '../pages/checkout.page';
import {uniqueEmail, uniqueName} from '../utils/unique';

test('an attendee books a free event, receives confirmation and finds its localized ticket link', async ({page, account, api, publicApi, mailpit}) => {
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
  await page.goto('/auth/login');
  await expect(page.locator('.ssr-loader')).toBeHidden();
  await page.getByRole('textbox', {name: /^Email\b/}).fill(buyer.email);
  await page.getByLabel('Password', {exact: true}).fill(password);
  await page.getByRole('button', {name: 'Log In', exact: true}).click();
  await expect(page.locator('header').getByRole('link', {name: 'My Bookings'})).toBeVisible();

  const checkout = new CheckoutPage(page);
  await checkout.gotoPublicEvent(event.eventId, event.slug);
  await checkout.setFirstProductQuantity(1);
  await checkout.continueToCheckout();
  await checkout.fillOrderDetails(buyer);
  await checkout.fillFirstAttendee(buyer);
  await checkout.completeFreeOrder();
  await expect(page.getByText(`You're going to ${event.title}`)).toBeVisible();
  await mailpit.waitForMessage(buyer.email, {subjectContains: event.title});

  await page.goto('/my-registrations');
  await expect(page.getByText(event.title, {exact: true})).toBeVisible();
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
