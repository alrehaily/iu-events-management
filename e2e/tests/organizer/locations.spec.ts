import type { Page } from '@playwright/test';
import { test, expect } from '../../fixtures';
import { createFreshOrganizer } from '../../api/factory';
import { uniqueName } from '../../utils/unique';

const gotoLocations = async (page: Page, organizerId: number): Promise<void> => {
  await page.goto(`/manage/organizer/${organizerId}/locations`);
  await page.waitForLoadState('networkidle');
};

const createLocationViaUi = async (page: Page, venueName: string): Promise<void> => {
  await page.getByRole('button', { name: 'Add Location' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Country')).toHaveValue(/Saudi Arabia/);
  await dialog.getByLabel('Venue Name').fill(venueName);
  await dialog.getByLabel('Address Line 1').fill('123 Test Street');
  await dialog.getByLabel('City').fill('Dublin');
  await dialog.getByLabel('Zip or Postal Code').fill('D01 F5P2');
  await dialog.getByRole('button', { name: 'Add Location' }).click();
};

test.describe('organizer locations', () => {
  test('an organizer places a pin, saves a venue and reopens the map in Arabic', async ({ authedPage, api }, testInfo) => {
    const organizer = await createFreshOrganizer(api);
    const venueName = uniqueName('Venue');

    await gotoLocations(authedPage, organizer.id);
    if (process.env.E2E_REAL_MAP_TILES !== 'true') {
      await authedPage.route('https://tile.openstreetmap.org/**', route => route.abort());
    }
    await authedPage.getByRole('button', {name: 'Add Location'}).first().click();
    const dialog = authedPage.getByRole('dialog');
    const map = dialog.getByTestId('venue-map');
    await expect(map).toBeVisible();
    if (process.env.E2E_REAL_MAP_TILES !== 'true') {
      await expect(dialog.getByText('The map could not load. You can enter the address and coordinates manually.')).toBeVisible();
    } else {
      await expect(map.locator('.leaflet-tile-loaded').first()).toBeVisible();
    }
    await expect(dialog.getByLabel('Country')).toHaveValue(/Saudi Arabia/);
    await dialog.getByRole('button', {name: 'Select map center'}).click();
    await expect(map.locator('.leaflet-overlay-pane path')).toBeVisible();
    await dialog.getByText('Advanced coordinates (optional)').click();
    await expect(dialog.getByLabel('Latitude', {exact: true})).toHaveValue(/24\.484/);
    await expect(dialog.getByLabel('Longitude', {exact: true})).toHaveValue(/39\.551/);
    const bounds = (await map.boundingBox())!;
    await map.click({position: {x: Math.round(bounds.width * 0.72), y: Math.round(bounds.height * 0.39)}});
    const lat = Number(await dialog.getByLabel('Latitude', {exact: true}).inputValue());
    const lng = Number(await dialog.getByLabel('Longitude', {exact: true}).inputValue());
    expect(lat).toBeGreaterThan(24.4848);
    expect(lng).toBeGreaterThan(39.5518);
    await expect(dialog.getByLabel('City', {exact: true})).toHaveValue('');
    await dialog.getByLabel('Venue Name').fill(venueName);
    await dialog.getByLabel('Address Line 1').fill('GP2 Campus Road');
    await dialog.getByLabel('City').fill('Madinah');
    await authedPage.screenshot({path: testInfo.outputPath('venue-map-en.png')});
    await dialog.getByRole('button', {name: 'Add Location'}).click();

    const row = authedPage.getByRole('row').filter({ hasText: venueName });
    await expect(row).toBeVisible();
    await expect(row.getByText('GP2 Campus Road', {exact: false})).toBeVisible();
    await row.getByRole('button').click();
    await authedPage.getByRole('menuitem', {name: 'Edit location'}).click();
    await expect(map.locator('.leaflet-overlay-pane path')).toBeVisible();
    await dialog.getByText('Advanced coordinates (optional)').click();
    expect(Number(await dialog.getByLabel('Latitude', {exact: true}).inputValue())).toBeCloseTo(lat, 5);
    expect(Number(await dialog.getByLabel('Longitude', {exact: true}).inputValue())).toBeCloseTo(lng, 5);
    await authedPage.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await authedPage.getByRole('combobox', {name: 'Language'}).click();
    await authedPage.getByRole('option', {name: 'العربية', exact: true}).click();
    await expect(authedPage.locator('html')).toHaveAttribute('dir', 'rtl');
    await row.getByRole('button').click();
    await authedPage.getByRole('menuitem', {name: /تعديل/}).click();
    await expect(map.locator('.leaflet-overlay-pane path')).toBeVisible();
    await authedPage.screenshot({path: testInfo.outputPath('venue-map-ar.png')});
  });

  test('an organizer renames a location', async ({ authedPage, api }) => {
    const organizer = await createFreshOrganizer(api);
    const venueName = uniqueName('Venue');
    const newName = uniqueName('Renamed Venue');

    await gotoLocations(authedPage, organizer.id);
    await createLocationViaUi(authedPage, venueName);

    const row = authedPage.getByRole('row').filter({ hasText: venueName });
    await row.getByRole('button').click();
    await authedPage.getByRole('menuitem', { name: 'Edit location' }).click();

    const dialog = authedPage.getByRole('dialog');
    await expect(dialog.getByLabel('Venue Name')).toHaveValue(venueName);
    await dialog.getByLabel('Display name').fill(newName);
    await dialog.getByRole('button', { name: 'Save Changes' }).click();

    await expect(authedPage.getByRole('row').filter({ hasText: newName })).toBeVisible();
  });

  test('an organizer deletes a location', async ({ authedPage, api }) => {
    const organizer = await createFreshOrganizer(api);
    const venueName = uniqueName('Venue');

    await gotoLocations(authedPage, organizer.id);
    await createLocationViaUi(authedPage, venueName);

    const row = authedPage.getByRole('row').filter({ hasText: venueName });
    await expect(row).toBeVisible();
    await row.getByRole('button').click();
    await authedPage.getByRole('menuitem', { name: 'Delete location' }).click();
    await authedPage.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(authedPage.getByRole('row').filter({ hasText: venueName })).toHaveCount(0);
    await expect(authedPage.getByText('No Saved Locations')).toBeVisible();
  });
});
