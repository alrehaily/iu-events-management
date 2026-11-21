import {expect, test} from '../fixtures';
import {uniqueName} from '../utils/unique';

test('new accounts, organizers and events use the Saudi defaults', async ({freshAccount}) => {
  const {api} = freshAccount;
  expect(await api.getAccount()).toMatchObject({currency_code: 'SAR', timezone: 'Asia/Riyadh'});
  const organizer = await api.createOrganizer(uniqueName('GP2 Faculty'), {currency: 'USD', timezone: 'UTC'});
  expect(organizer).toMatchObject({currency: 'SAR', timezone: 'Asia/Riyadh'});

  const date = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
  const event = await api.createEvent({
    title: uniqueName('GP2 Campus Workshop'), type: 'SINGLE', organizer_id: organizer.id,
    category: 'WORKSHOP', start_date: `${date}T18:00:00`, end_date: `${date}T20:00:00`, currency: 'USD',
  });
  expect(event).toMatchObject({currency: 'SAR', timezone: 'Asia/Riyadh'});
  const {start_date, end_date} = event as typeof event & {start_date: string; end_date: string};
  expect(new Date(start_date).toISOString()).toBe(`${date}T15:00:00.000Z`);
  expect(new Date(end_date).toISOString()).toBe(`${date}T17:00:00.000Z`);
});
