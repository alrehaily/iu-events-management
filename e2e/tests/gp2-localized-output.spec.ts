import {expect, test} from '../fixtures';
import {createCompletedOrder, createLiveEventWithProduct} from '../api/factory';
import {API_BASE_URL} from '../utils/env';
import {uniqueEmail, uniqueName} from '../utils/unique';

for (const locale of ['ar', 'en'] as const) {
  test(`order confirmation email and report export use ${locale}`, async ({freshAccount, playwright, mailpit}) => {
    const headers = {'Accept-Language': locale, Accept: 'application/json'};
    const buyer = await playwright.request.newContext({baseURL: API_BASE_URL, extraHTTPHeaders: headers});
    const organizer = await playwright.request.newContext({
      baseURL: API_BASE_URL, extraHTTPHeaders: {...headers, Cookie: `locale=${locale}`, Authorization: `Bearer ${freshAccount.token}`},
    });
    try {
      const email = uniqueEmail('localized-order');
      const event = await createLiveEventWithProduct(freshAccount.api, {
        organizerId: freshAccount.organizerId, title: uniqueName('GP2 Seminar'),
      });
      const order = await createCompletedOrder(buyer, event, {buyerEmail: email});
      const subject = locale === 'ar' ? 'تم تأكيد حجزك' : 'Your Order is Confirmed!';
      const mail = await mailpit.waitForMessage(email, {subjectContains: subject});
      const message = await mailpit.getMessage(mail.ID);
      expect(message.HTML).toContain(locale === 'ar' ? 'dir="rtl"' : 'dir="ltr"');
      expect(message.Text).toContain(event.title);
      expect(message.Text).toContain(locale === 'ar' ? 'رقم الطلب' : 'Order Number');
      expect(message.Text).toContain(locale === 'ar' ? 'مجاني' : 'Free');
      expect(await mailpit.getLinks(mail.ID)).toEqual(expect.arrayContaining([
        expect.stringContaining(`/checkout/${event.eventId}/${order.orderShortId}/summary`),
      ]));

      const response = await organizer.get(`organizers/${freshAccount.organizerId}/reports/revenue_summary/export`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-language']).toBe(locale);
      const csv = await response.body();
      expect([...csv.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
      expect(csv.toString('utf8').split(/\r?\n/)[0]).toContain(locale === 'ar' ? 'إجمالي المبيعات' : 'Gross Sales');
    } finally {
      await buyer.dispose();
      await organizer.dispose();
    }
  });
}
