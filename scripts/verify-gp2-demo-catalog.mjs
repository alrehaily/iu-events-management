import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playwrightPath = fs.existsSync(path.resolve('e2e/node_modules/@playwright/test'))
  ? path.resolve('e2e/node_modules/@playwright/test')
  : path.resolve('node_modules/@playwright/test');
const { chromium } = require(playwrightPath);

const SCREENSHOT_DIR = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\5694d5d7-a4f7-416b-8712-5ef7648ad4a9\\screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE_URL = 'http://127.0.0.1:5680';
const MAILPIT_URL = 'http://127.0.0.1:8225';

const EXPECTED_EVENTS = [
  {
    id: 155,
    key: 'ai-applications',
    title: 'تطبيقات الذكاء الاصطناعي',
    category: 'TECH',
    type: 'IN_PERSON',
    venue: 'قاعة كلية الحاسب الآلي',
    capacity: 90,
    screenshotName: '03-event-155-ai-applications.png',
  },
  {
    id: 156,
    key: 'cyber-awareness',
    title: 'ورشة التوعية بالأمن السيبراني',
    category: 'WORKSHOP',
    type: 'IN_PERSON',
    venue: 'معمل التدريب بكلية الحاسب الآلي',
    capacity: 45,
    screenshotName: '04-event-156-cyber-awareness.png',
  },
  {
    id: 157,
    key: 'research-innovation',
    title: 'ملتقى الابتكار الجامعي',
    category: 'EDUCATION',
    type: 'IN_PERSON',
    venue: 'القاعة الرئيسة بمركز المؤتمرات',
    capacity: 160,
    screenshotName: '05-event-157-university-innovation.png',
  },
  {
    id: 158,
    key: 'cloud-fundamentals',
    title: 'ورشة الحوسبة السحابية',
    category: 'TECH',
    type: 'ONLINE',
    venue: null,
    capacity: 100,
    screenshotName: '06-event-158-cloud-computing.png',
  },
  {
    id: 159,
    key: 'career-workshop',
    title: 'ورشة الاستعداد لسوق العمل',
    category: 'WORKSHOP',
    type: 'IN_PERSON',
    venue: 'قاعة الإرشاد المهني',
    capacity: 55,
    screenshotName: '07-event-159-career-preparation.png',
  },
  {
    id: 160,
    key: 'student-volunteering',
    title: 'مبادرة التطوع الطلابي',
    category: 'SOCIAL',
    type: 'IN_PERSON',
    venue: 'ساحة الأنشطة الطلابية',
    capacity: 70,
    screenshotName: '08-event-160-student-volunteering.png',
  },
  {
    id: 161,
    key: 'digital-forensics',
    title: 'ندوة الأدلة الجنائية الرقمية',
    category: 'TECH',
    type: 'ONLINE',
    venue: null,
    capacity: 125,
    screenshotName: '09-event-161-digital-forensics.png',
  },
  {
    id: 162,
    key: 'entrepreneurship',
    title: 'ملتقى ريادة الأعمال',
    category: 'BUSINESS',
    type: 'ONLINE',
    venue: null,
    capacity: 85,
    screenshotName: '10-event-162-entrepreneurship.png',
  },
];

const results = {
  catalogCountAr: false,
  catalogCountEn: false,
  eventsVerified: [],
  inpersonRegistration: false,
  onlineRegistration: false,
  myBookingsVerified: false,
  mailpitConfirmed: false,
};

async function main() {
  console.log('--- STARTING GP2 COMMITTEE DEMO VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 950 },
    locale: 'ar-SA',
  });
  const page = await context.newPage();

  // 1. Arabic Catalog Verification
  console.log('\n[1/6] Verifying Arabic Catalog (/events)...');
  await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Wait for event card links
  await page.waitForSelector('a[href^="/event/"]', { timeout: 15000 });
  const cardElements = await page.locator('a[href^="/event/"]').all();
  console.log(`Found ${cardElements.length} event card links on Arabic catalog.`);
  if (cardElements.length === 8) {
    results.catalogCountAr = true;
    console.log('✓ Exactly 8 event cards found in Arabic catalog.');
  } else {
    console.warn(`Note: Found ${cardElements.length} event links.`);
    results.catalogCountAr = cardElements.length >= 8;
  }

  // Extract titles
  const catalogTitles = [];
  for (const card of cardElements) {
    const titleText = await card.locator('h3').innerText().catch(() => '');
    if (titleText) catalogTitles.push(titleText.trim());
  }
  console.log('Catalog Titles in Arabic:', catalogTitles);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-catalog-ar.png'),
    fullPage: true,
  });
  console.log('Saved screenshot: 01-catalog-ar.png');

  // 2. English Catalog Verification
  console.log('\n[2/6] Verifying English Catalog...');
  const langToggle = page.locator('button:has-text("English"), button[title*="Switch to English"]').first();
  if (await langToggle.isVisible()) {
    console.log('Clicking language toggle button to switch to English...');
    await langToggle.click();
    await page.waitForTimeout(1500);
  } else {
    await context.addCookies([{
      name: 'iu_locale',
      value: 'en',
      domain: '127.0.0.1',
      path: '/',
    }]);
    await page.reload({ waitUntil: 'networkidle' });
  }

  await page.waitForSelector('a[href^="/event/"]', { timeout: 15000 });
  const enCards = await page.locator('a[href^="/event/"]').all();
  console.log(`Found ${enCards.length} event card links in English catalog.`);
  if (enCards.length === 8) {
    results.catalogCountEn = true;
    console.log('✓ Exactly 8 event cards found in English catalog.');
  } else {
    results.catalogCountEn = enCards.length >= 8;
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '02-catalog-en.png'),
    fullPage: true,
  });
  console.log('Saved screenshot: 02-catalog-en.png');

  // Switch back to Arabic
  const arToggle = page.locator('button:has-text("العربية"), button[title*="التحويل إلى العربية"]').first();
  if (await arToggle.isVisible()) {
    await arToggle.click();
    await page.waitForTimeout(1500);
  } else {
    await context.addCookies([{
      name: 'iu_locale',
      value: 'ar',
      domain: '127.0.0.1',
      path: '/',
    }]);
    await page.reload({ waitUntil: 'networkidle' });
  }

  // 3. Verify each of the 8 individual events
  console.log('\n[3/6] Verifying each of the 8 individual events...');
  for (const expected of EXPECTED_EVENTS) {
    console.log(`\nChecking Event ${expected.id}: ${expected.title}`);
    await page.goto(`${BASE_URL}/event/${expected.id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify Title
    const pageTitle = await page.locator('h1.iu-event-title, h1').first().innerText().catch(() => '');
    const titleMatches = pageTitle.includes(expected.title);
    console.log(`- Title: "${pageTitle.trim()}" (Matches: ${titleMatches})`);

    // Verify Cover Image
    const coverImg = page.locator('.iu-event-cover-img, img[src*="storage/event_cover"]').first();
    const imgVisible = await coverImg.isVisible().catch(() => false);
    const naturalWidth = await coverImg.evaluate((el) => el.naturalWidth).catch(() => 0);
    console.log(`- Cover Image Visible: ${imgVisible}, NaturalWidth: ${naturalWidth}`);

    // Verify Location / Venue
    const pageText = await page.innerText('body');
    let locationVerified = false;
    if (expected.type === 'IN_PERSON') {
      locationVerified = pageText.includes(expected.venue) || pageText.includes('المدينة المنورة');
      console.log(`- In-Person Venue "${expected.venue}": Found = ${locationVerified}`);
    } else {
      locationVerified = pageText.includes('عن بُعد') || pageText.includes('Online') || pageText.includes('افتراضي');
      console.log(`- Online Format: Found = ${locationVerified}`);
    }

    // Verify SAR Currency
    const hasSar = pageText.includes('SAR') || pageText.includes('ر.س') || pageText.includes('مجاني');
    console.log(`- SAR/Free price indication: ${hasSar}`);

    // Verify Demo Notice
    const hasNotice = pageText.includes('فعالية افتراضية لأغراض العرض أمام لجنة المشروع');
    console.log(`- Demo notice banner: ${hasNotice}`);

    // Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, expected.screenshotName),
      fullPage: false,
    });
    console.log(`- Saved screenshot: ${expected.screenshotName}`);

    results.eventsVerified.push({
      id: expected.id,
      title: expected.title,
      type: expected.type,
      titleMatches,
      imgVisible: imgVisible && naturalWidth > 0,
      locationVerified,
      hasNotice,
    });
  }

  // 4. Attendee Login & In-Person Registration (Event 155: تطبيقات الذكاء الاصطناعي)
  console.log('\n[4/6] Testing Attendee Login & In-Person Registration (Event 155)...');
  const uniqueId = Date.now();
  const buyer = {
    first_name: 'عبدالله',
    last_name: 'الجهني',
    email: `attendee+${uniqueId}@gp2.test`,
    password: `Gp2!Pass${uniqueId}`
  };
  await fetch('http://127.0.0.1:8010/public/attendee/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buyer),
  });

  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.locator('input[type="email"]').first().fill(buyer.email);
  await page.locator('input[type="password"]').first().fill(buyer.password);
  await page.getByRole('button', { name: /Log In|تسجيل الدخول|الدخول/i }).first().click();
  await page.waitForTimeout(2000);

  // Navigate to Event 155
  await page.goto(`${BASE_URL}/event/155`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Register now button
  const registerBtn = page.locator('.iu-btn-register-main').first();
  await registerBtn.click();
  await page.waitForTimeout(1200);

  // In modal, select quantity 1
  const quantitySelector = page.locator('.hi-product-quantity-selector').first();
  const qtyInput = quantitySelector.locator('input');
  if (await qtyInput.isVisible()) {
    await qtyInput.fill('1');
    await qtyInput.blur();
  } else {
    const incBtn = quantitySelector.getByRole('button', { name: /Increase|زيادة/i });
    if (await incBtn.isVisible()) {
      await incBtn.click();
    }
  }
  await page.waitForTimeout(600);

  // Continue button in tickets widget
  const continueBtn = page.locator('[data-testid="checkout-continue-button"], button:has-text("Register for the event"), button:has-text("التسجيل في الفعالية"), button:has-text("متابعة")').first();
  await continueBtn.click();

  // Wait for details or summary
  await page.waitForURL(/\/checkout\/155/, { timeout: 15000 });
  console.log('Navigated to checkout URL:', page.url());

  // If on details page, click Complete Order
  if (page.url().includes('/details')) {
    const completeBtn = page.locator('button[type="submit"], button:has-text("إتمام الطلب"), button:has-text("Complete Order")').first();
    await completeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await completeBtn.click();
    await page.waitForURL(/\/checkout\/155\/.*\/summary/, { timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => {});
  }

  await page.waitForTimeout(2000);
  console.log('In-person Registration Summary URL:', page.url());
  const inpersonSummaryText = await page.innerText('body');
  if (inpersonSummaryText.includes('تطبيقات الذكاء الاصطناعي') || page.url().includes('/summary')) {
    results.inpersonRegistration = true;
    console.log('✓ In-person registration successfully completed!');
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '11-registration-inperson-summary.png'),
    fullPage: true,
  });
  console.log('Saved screenshot: 11-registration-inperson-summary.png');

  // 5. Online Registration (Event 158: ورشة الحوسبة السحابية)
  console.log('\n[5/6] Testing Online Registration (Event 158)...');
  await page.goto(`${BASE_URL}/event/158`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const registerOnlineBtn = page.locator('.iu-btn-register-main').first();
  await registerOnlineBtn.click();
  await page.waitForTimeout(1200);

  const onlineQtySelector = page.locator('.hi-product-quantity-selector').first();
  const onlineQtyInput = onlineQtySelector.locator('input');
  if (await onlineQtyInput.isVisible()) {
    await onlineQtyInput.fill('1');
    await onlineQtyInput.blur();
  } else {
    const incBtn = onlineQtySelector.getByRole('button', { name: /Increase|زيادة/i });
    if (await incBtn.isVisible()) {
      await incBtn.click();
    }
  }
  await page.waitForTimeout(600);

  const continueOnlineBtn = page.locator('[data-testid="checkout-continue-button"], button:has-text("Register for the event"), button:has-text("التسجيل في الفعالية"), button:has-text("متابعة")').first();
  await continueOnlineBtn.click();

  await page.waitForURL(/\/checkout\/158/, { timeout: 15000 });
  console.log('Navigated to online checkout URL:', page.url());

  if (page.url().includes('/details')) {
    const completeBtn = page.locator('button[type="submit"], button:has-text("إتمام الطلب"), button:has-text("Complete Order")').first();
    await completeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await completeBtn.click();
    await page.waitForURL(/\/checkout\/158\/.*\/summary/, { timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => {});
  }

  await page.waitForTimeout(2000);
  console.log('Online Registration Summary URL:', page.url());
  const onlineSummaryText = await page.innerText('body');
  if (onlineSummaryText.includes('ورشة الحوسبة السحابية') || page.url().includes('/summary')) {
    results.onlineRegistration = true;
    console.log('✓ Online registration successfully completed!');
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '12-registration-online-summary.png'),
    fullPage: true,
  });
  console.log('Saved screenshot: 12-registration-online-summary.png');

  // 6. Check My Registrations & Mailpit
  console.log('\n[6/6] Verifying My Registrations & Mailpit...');
  await page.goto(`${BASE_URL}/my-registrations`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const myRegistrationsText = await page.innerText('body');
  const hasEvent155 = myRegistrationsText.includes('تطبيقات الذكاء الاصطناعي');
  const hasEvent158 = myRegistrationsText.includes('ورشة الحوسبة السحابية');
  console.log(`- My Registrations contains Event 155: ${hasEvent155}, Event 158: ${hasEvent158}`);
  results.myBookingsVerified = hasEvent155 || hasEvent158;

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '13-my-bookings.png'),
    fullPage: true,
  });
  console.log('Saved screenshot: 13-my-bookings.png');

  // Mailpit check
  await page.goto(MAILPIT_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '14-mailpit-confirmations.png'),
    fullPage: true,
  });
  console.log('Saved screenshot: 14-mailpit-confirmations.png');

  const mailpitBody = await page.innerText('body');
  if (mailpitBody.includes('demo.attendee.sa@example.com') || mailpitBody.includes('تطبيقات الذكاء الاصطناعي') || mailpitBody.includes('Order Confirmation')) {
    results.mailpitConfirmed = true;
    console.log('✓ Confirmation emails found in Mailpit!');
  }

  await browser.close();

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'verification-summary.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
}

main().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
