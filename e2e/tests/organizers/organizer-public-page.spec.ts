import { test, expect } from '../../fixtures';
import { OrganizerPublicPage } from '../../pages/organizer.page';
import { createFreshOrganizer, createLiveEventWithProduct } from '../../api/factory';
import { uniqueCode, uniqueEmail, uniqueName, uniqueShort } from '../../utils/unique';

test.describe('organizer public page', () => {
  test("a visitor sees the organizer's upcoming event and clicks through to it", async ({ page, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('E2E Public Org'));
    await api.updateOrganizerStatus(organizer.id, 'LIVE');
    const event = await createLiveEventWithProduct(api, { organizerId: organizer.id });

    const publicPage = new OrganizerPublicPage(page);
    await publicPage.goto(organizer.id, organizer.slug);

    await expect(page.getByRole('heading', { name: organizer.name })).toBeVisible();
    await publicPage.eventLink(event.title).click();

    await expect(page.getByRole('heading', { name: event.title })).toBeVisible();
  });

  test('saving a verified organizer profile publishes its draft', async ({ authedPage, api, publicApi }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('GP2 Profile Draft'));
    await api.updateOrganizerStatus(organizer.id, 'DRAFT');
    const publicPath = 'public/organizers/' + organizer.id;
    expect((await publicApi.get(publicPath)).status()).toBe(404);

    await authedPage.goto('/manage/organizer/' + organizer.id + '/settings');
    const name = authedPage.getByRole('textbox', {name: /^Organizer Name/});
    await expect(name).toHaveValue(organizer.name);
    const updatedName = uniqueName('GP2 Published Profile');
    await name.fill(updatedName);
    await authedPage.getByRole('button', {name: 'Save', exact: true}).first().click();
    await expect(authedPage.getByText('Successfully Updated Organizer')).toBeVisible();

    const published = await publicApi.get(publicPath);
    expect(published.status()).toBe(200);
    expect((await published.json()).data.name).toBe(updatedName);
  });

  test('an organizer copies the public page URL from the share dialog', async ({ authedPage, account }) => {
    await authedPage.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await authedPage.goto('/manage/organizer/' + account.organizerId + '/events');
    await authedPage.getByRole('button', {name: 'Share Organizer Page', exact: true}).click();
    const dialog = authedPage.getByRole('dialog');
    await dialog.getByRole('tab', {name: 'Copy Link'}).click();
    const organizerUrl = await dialog.getByLabel('Page URL').inputValue();
    expect(new URL(organizerUrl).pathname).toContain('/events/' + account.organizerId + '/');
    await dialog.getByRole('button', {name: 'Copy', exact: true}).click();
    await expect(dialog.getByRole('button', {name: 'Copied', exact: true})).toBeVisible();
    expect(await authedPage.evaluate(() => navigator.clipboard.readText())).toBe(organizerUrl);
  });

  test('the homepage designer shows its event card without a booking link', async ({ authedPage, api }) => {
    const organizer = await createFreshOrganizer(api, uniqueName('GP2 Preview'));
    const event = await createLiveEventWithProduct(api, { organizerId: organizer.id });
    await authedPage.goto(`/manage/organizer/${organizer.id}/organizer-homepage-designer`);
    const preview = authedPage.frameLocator('iframe[title="Organizer Homepage Preview"]');
    const card = preview.locator('article').filter({hasText: event.title});
    await expect(card).toBeVisible();
    await expect(card.locator('a, button, form')).toHaveCount(0);
    await expect(preview.locator('main')).toHaveAttribute('inert', '');
  });

  test('the event designer blocks links, registration and session actions in its preview', async ({ authedPage, api, account }) => {
    const event = await createLiveEventWithProduct(api, { organizerId: account.organizerId });
    const path = '/manage/event/' + event.eventId + '/homepage-designer';
    await authedPage.goto(path);
    const preview = authedPage.frameLocator('iframe[title="Event Preview"]');
    const content = preview.locator('.iu-event-details-page');
    await expect(content).toHaveAttribute('inert', '');
    const register = preview.locator('.iu-btn-register-main');
    await expect(register).toBeVisible();
    await register.click({force: true});
    await expect(preview.locator('[role="dialog"]')).toHaveCount(0);
    await expect(preview.locator('.iu-event-main-title')).toHaveText(event.title);
    await expect(authedPage).toHaveURL(path);
  });

  test('a visitor contacts the organizer and the message arrives by email', async ({ page, api, mailpit }) => {
    const organizerEmail = uniqueEmail('organizer');
    const organizer = await api.createOrganizer(uniqueName('E2E Contact Org'), { email: organizerEmail });
    await api.updateOrganizerStatus(organizer.id, 'LIVE');

    const senderName = uniqueShort('Visitor');
    const reference = uniqueCode('REF');

    const publicPage = new OrganizerPublicPage(page);
    await publicPage.goto(organizer.id, organizer.slug);
    await publicPage.contactButton.click();
    await publicPage.sendContactMessage({
      name: senderName,
      email: uniqueEmail('visitor'),
      message: `Accessibility question ${reference}`,
    });

    await expect(page.getByText('Your message has been sent successfully!')).toBeVisible();

    const summary = await mailpit.waitForMessage(organizerEmail, { subjectContains: 'New message from your organizer page' });
    expect(summary.Subject).toBe('New message from your organizer page');
    const message = await mailpit.getMessage(summary.ID);
    expect(`${message.Text}\n${message.HTML}`).toContain(reference);
  });
});
