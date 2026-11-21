import {expect, test} from '../fixtures';
import {uniqueEmail} from '../utils/unique';
import {API_BASE_URL} from '../utils/env';
import {englishLocaleCookie} from '../utils/consent';

for (const change of ['email', 'password', 'both'] as const) {
  test(`organizer signs in after changing ${change}`, async ({freshAccount, page, playwright, mailpit}) => {
    const accountPage = await freshAccount.newAuthedPage();
    const api = await playwright.request.newContext({baseURL: API_BASE_URL, extraHTTPHeaders: {
      Accept: 'application/json', Authorization: `Bearer ${freshAccount.token}`,
    }});
    const email = change === 'password' ? freshAccount.email : uniqueEmail();
    const password = change === 'email' ? freshAccount.password : 'Changed-Demo-123!';

    try {
      const response = await api.put('users/me', {data: {
        ...(change !== 'password' && {email, first_name: 'GP2', last_name: 'Organizer', locale: 'en', timezone: 'Asia/Riyadh'}),
        ...(change !== 'email' && {current_password: freshAccount.password, password, password_confirmation: password}),
      }});
      expect(response.status()).toBe(200);
      if (change !== 'password') {
        expect((await response.json()).data.pending_email).toBe(email);
        const link = await mailpit.waitForLink(freshAccount.email, /confirm-email-change/, {subjectContains: 'Confirm email change'});
        await accountPage.goto(link.pathname, {waitUntil: 'networkidle'});
        await accountPage.getByRole('button', {name: 'Confirm Email Change'}).click();
        await expect(accountPage.getByLabel('Email', {exact: false}).first()).toHaveValue(email);
      }

      expect((await api.post('auth/logout')).ok()).toBeTruthy();
      await page.goto('/manage/login');
      await page.waitForLoadState('networkidle');
      await page.getByLabel(/Institutional Email/).fill(freshAccount.email);
      await page.getByLabel('Password', {exact: true}).fill(freshAccount.password);
      await page.getByRole('button', {name: 'Log In as Organizer'}).click();
      await expect(page.getByRole('alert')).toContainText('Incorrect email or password.');

      await page.getByLabel(/Institutional Email/).fill(email);
      await page.getByLabel('Password', {exact: true}).fill(password);
      await page.getByRole('button', {name: 'Log In as Organizer'}).click();
      await expect(page).toHaveURL(/\/manage\/(events|organizer\/\d+\/dashboard)/);
      await page.goto(`/manage/organizer/${freshAccount.organizerId}/events`);
      await expect(page.getByRole('heading', {name: 'Events', exact: true})).toBeVisible();
      await page.reload();
      await expect(page.getByRole('heading', {name: 'Events', exact: true})).toBeVisible();
    } finally {
      await api.dispose();
    }
  });
}

test('attendee credentials show an Arabic error at the organizer login', async ({page, publicApi}) => {
  const email = uniqueEmail();
  const password = 'Attendee-Demo-123!';
  const response = await publicApi.post('public/attendee/register', {data: {
    first_name: 'GP2', last_name: 'Attendee', email, password, password_confirmation: password,
  }});
  expect(response.status()).toBe(201);

  await page.context().addCookies([{...englishLocaleCookie(), value: 'ar'}]);
  await page.goto('/manage/login');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.getByLabel(/البريد الإلكتروني المؤسسي/).fill(email);
  await page.getByLabel('كلمة المرور', {exact: true}).fill(password);
  await page.getByRole('button', {name: 'تسجيل الدخول كمنظم'}).click();
  await expect(page.getByRole('alert')).toContainText('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
  await expect(page).toHaveURL(/\/manage\/login$/);
});
