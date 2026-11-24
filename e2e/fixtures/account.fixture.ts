import type { APIRequestContext } from '@playwright/test';
import type { ApiClient } from '../api/api-client';
import { confirmEmailWithCode, login, registerAccount } from '../api/api-client';
import type { MailpitClient } from '../utils/mailpit';
import { uniqueEmail } from '../utils/unique';
import { IS_SAAS_MODE } from '../utils/env';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';

export interface AccountIdentity {
  email: string;
  password: string;
  token: string;
  userId: number;
}

export interface AccountContext extends AccountIdentity {
  organizerId: number;
  api: ApiClient;
}

const PASSWORD = 'Password123!';

export async function bootstrapAccount(anon: APIRequestContext, mailpit: MailpitClient): Promise<AccountIdentity> {
  const email = uniqueEmail();

  if (process.env.E2E_GP2_ORGANIZER_CLI === 'true') {
    const provision = spawnSync('php', [
      'artisan', 'gp2:provision-organizer', email, '--first-name=E2E', '--last-name=Organizer',
      '--locale=en', '--password-stdin', '--no-interaction',
    ], {
      cwd: resolve(import.meta.dirname, '../../backend'),
      input: `${PASSWORD}\n`,
      encoding: 'utf8',
      windowsHide: true,
      timeout: 20_000,
    });
    if (provision.status !== 0) {
      throw new Error(provision.error?.message ?? (provision.stderr || provision.stdout || 'Organizer provisioning failed'));
    }
  } else await registerAccount(anon, {
    first_name: 'E2E',
    last_name: 'Organizer',
    email,
    password: PASSWORD,
    password_confirmation: PASSWORD,
    timezone: 'UTC',
    currency_code: 'USD',
    locale: 'en',
  });

  const { token, user } = await login(anon, email, PASSWORD);

  if (IS_SAAS_MODE && !user.is_email_verified) {
    const code = await mailpit.waitForVerificationCode(email);
    await confirmEmailWithCode(anon, token, user.id, code);
  }

  return { email, password: PASSWORD, token, userId: user.id };
}
