import assert from 'node:assert/strict';
import {mkdir, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(new URL('../e2e/package.json', import.meta.url));
const {chromium, expect} = require('@playwright/test');
const frontendUrl = process.env.GP2_FRONTEND_URL ?? 'http://127.0.0.1:5680';
const backendUrl = process.env.GP2_BACKEND_URL ?? 'http://127.0.0.1:8010';
const screenshotDir = process.env.GP2_CATALOG_EVIDENCE_DIR ?? join(tmpdir(), 'iu-gp2-catalog');
const seeds = new URL('../backend/resources/demo/gp2-committee-events.json', import.meta.url);
const fixtures = JSON.parse(await readFile(seeds, 'utf8'));
let events = fixtures;

async function verifyCatalog() {
  await mkdir(screenshotDir, {recursive: true});
  assert.equal(fixtures.length, 8, 'The fixture manifest must define exactly eight events');
  const response = await fetch(new URL('/public/events', backendUrl));
  assert.equal(response.status, 200, 'Public catalog API');
  const {data, meta} = await response.json();
  assert.equal(meta.total, 8, 'Public catalog API must expose exactly eight events');
  // A fresh database assigns its own IDs, so match each fixture to its live event by title.
  events = fixtures.map(fixture => {
    const live = data.find(({title}) => title === fixture.title);
    assert.ok(live, 'Public catalog API is missing ' + fixture.title);
    return {...fixture, id: live.id};
  });

  const browser = await chromium.launch();
  try {
    for (const [locale, direction] of [['ar', 'rtl'], ['en', 'ltr']]) {
      const context = await browser.newContext({viewport: {width: 1280, height: 900}, reducedMotion: 'reduce'});
      await context.addCookies([{name: 'locale', value: locale, url: frontendUrl}]);
      const page = await context.newPage();
      await page.goto(new URL('/events', frontendUrl).href);
      await expect(page.locator('html')).toHaveAttribute('dir', direction);
      await expect(page.locator('a[href^="/event/"]:visible').filter({has: page.locator('h3')})).toHaveCount(8);
      for (const event of events) {
        const card = page.locator('a[href^="/event/' + event.id + '/"]:visible');
        await expect(card.getByRole('heading', {name: event.title, exact: true})).toBeVisible();
        const cover = card.getByRole('img', {name: event.title, exact: true});
        await cover.scrollIntoViewIfNeeded();
        await expect(cover).toHaveAttribute('src', new RegExp('/gp2-' + event.key + '-'));
        await expect.poll(() => cover.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
      }

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({path: resolve(screenshotDir, 'catalog-' + locale + '.png'), fullPage: true});

      for (const event of events) {
        const detail = await page.goto(new URL('/event/' + event.id, frontendUrl).href);
        assert.equal(detail?.status(), 200, 'Event detail ' + event.id);
        await expect(page.getByRole('heading', {level: 1, name: event.title, exact: true})).toBeVisible();
        const cover = page.getByRole('img', {name: event.title, exact: true}).first();
        await expect(cover).toHaveAttribute('src', new RegExp('/gp2-' + event.key + '-'));
        await expect.poll(() => cover.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
        const headings = [...event.description.matchAll(/<h3>([^<]+)<\/h3>/g)];
        assert.equal(headings.length, 5, 'Structured Arabic description ' + event.id);
        for (const [, heading] of headings) {
          await expect(page.getByRole('heading', {name: heading, exact: true})).toBeVisible();
        }
        await page.screenshot({path: resolve(screenshotDir, event.id + '-' + locale + '.png'), fullPage: true});
        console.log(locale + ' ' + event.id + ' ' + event.title + ' OK');
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

await verifyCatalog().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
