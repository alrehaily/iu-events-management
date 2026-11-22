# IU Events GP2 audit continuation

## One-click audit stack

- Double-click `Start All.cmd` from this audit worktree. For a terminal run without opening a browser, use `& '.\Start All.cmd' -NoBrowser`. The launcher validates the configured local stack, starts or reuses the existing isolated PostgreSQL cluster, waits for readiness, starts or reuses Mailpit and Laravel, and opens SSR after the API and frontend respond.
- The prepared runtime directory defaults to `%TEMP%\iu-gp2-audit-20261120`. For a different location, set `GP2_RUNTIME_DIR` to the directory containing the existing `pgdata` and `mailpit\mailpit.exe`. Set `GP2_POSTGRES_BIN` if PostgreSQL is installed outside its standard Windows path. Retain the existing cluster and private runtime files. Service logs are in `backend\storage\logs`.
- The launcher expects the local `iu_gp2_demo` configuration. Provisioning and schema work remain explicit. Use `iu_gp2_test` for PHPUnit. The separate terminal commands below are available for troubleshooting.

## Antigravity integration continuation

- Use the audit branch `fix/gp2-demo-readiness-i18n-20261120` and keep the original and Antigravity checkouts separate. The implementation was integrated from the reviewed source delta. Avoid merging the incoming launcher history, which contains a hard-coded local database credential. Coordinate replacement of that credential before any further sharing of the Antigravity branch.
- To run the Windows launcher, start the existing isolated PostgreSQL and Mailpit services using the commands below, then run `& '.\Start All.cmd' -NoBrowser` from the audit root. With no arguments it opens the browser when Laravel and SSR return HTTP 200. It requires existing backend configuration, Composer and Node dependencies. It creates a missing frontend environment exclusively and uses the configured loopback ports. Startup and repeated startup preserved both existing environments. Provisioning and schema updates remain separate operations.
- Keep browser runs sequential with `--workers=1` and run PHPUnit against the configured `iu_gp2_test` database. The final production retest uses `E2E_BASE_URL=http://127.0.0.1:5683` with the audit API still on port 8010. Logs are under `%TEMP%\iu-gp2-audit-20261120`, including `gp2-integration.log`, `gp2-integration-production.log`, `gp2-integration-production-retest.log`, `gp2-integration-controls.log`, and `phpunit-integration-final.log`.
- The booking regression in `e2e/tests/gp2-workflows.spec.ts` performs guest login and return, checks the single-ticket account summary, replays the same completion request, substitutes a failed response, and checks confirmation and My Bookings. The original exception did not appear in retained logs. Check the backend startup error log for any further post-commit mail, invoice, stats or webhook failures.
- Remaining manual verification includes the physical scanner, Excel reopening, tablet layout and committee rehearsal from the historical handoff below. Audit lower-traffic bilingual surfaces and integrations against the current branch before the demo.

## Current checkpoint

- Phase F ran the built app on port 5680. The production matrix passed 15/15 and the extended set passed 6/6. Three check-in cases and public mobile localization also passed. Organizer localization failed at the Arabic dashboard heading. Twelve additional cases had no recorded result at the cutoff. Full PHPUnit passed with the existing skipped and risky counts. Both bundles, TypeScript and Lingui passed. ESLint reported 1,338 findings against the 1,419 baseline. The five-hour window reached 8% remaining, so verification stopped after the production run reached that cutoff.
- Phase E removed obsolete designer and widget UI and added branded tickets, preview isolation and scroll restoration. Four organizer/ticket Chromium cases passed with `node.exe node_modules/@playwright/test/cli.js test tests/organizers/organizer-public-page.spec.ts tests/self-service/attendee-ticket-page.spec.ts --grep 'clicks through|designer|ticket' --workers=1 --reporter=list`.
- Phase D added Arabic catalog coverage, order confirmation and template localization, and UTF-8 BOM report downloads. Run `node.exe node_modules/@playwright/test/cli.js test tests/gp2-localized-output.spec.ts --workers=1 --reporter=list`. Both locale-cookie cases passed. Header-only Arabic CSV and desktop Excel reopening remain unverified.
- Phase C unified the shared Mantine controls and empty states. TC-08 and the free registration workflow passed. Rerun with `node.exe node_modules/@playwright/test/cli.js test tests/gp2-demo.spec.ts tests/gp2-workflows.spec.ts --grep 'TC-08|books a free event' --workers=1 --reporter=list`.
- Phase B applies Saudi defaults and fixed currency/timezone controls. The Saudi API regression, TC-13 and TC-14 passed, and TC-15 and organizer locale screen data timed out. Use `node.exe node_modules/@playwright/test/cli.js test tests/gp2-saudi-settings.spec.ts tests/gp2-demo.spec.ts tests/gp2-localization.spec.ts --grep 'Saudi defaults|TC-1[345]|organizer forms' --workers=1 --reporter=list`. Focused PHPUnit passed with `--filter 'OpenApi|UpdateEventHandler|Location'`.
- Phase A implements combined credential persistence and explicit localized organizer login feedback. The active upstream is `origin/fix/gp2-demo-readiness-i18n-20261120`. Run `git rev-parse HEAD @{upstream}` or compare `git rev-parse HEAD` with `git ls-remote --heads origin refs/heads/fix/gp2-demo-readiness-i18n-20261120` to retrieve the exact current hashes.
- The focused credential cases, TC-10/TC-12, TypeScript, Lingui and focused PHPUnit passed. Retest the organizer localization flow and remaining phases as outlined in the audit. Historical build and matrix results below need final reruns.
- Use the isolated service environment below. From `e2e`, run `node.exe node_modules/@playwright/test/cli.js test tests/gp2-organizer-credentials.spec.ts tests/gp2-localization.spec.ts tests/gp2-demo.spec.ts --grep 'changing |attendee credentials|organizer forms|TC-1[02]' --workers=2 --reporter=list`. From `backend`, run `php.exe -d memory_limit=1024M vendor/bin/phpunit --configuration "$audit/phpunit-isolated-20261121.xml" --filter 'Auth|UpdateMe|ConfirmEmailChange'`.

## Repository and historical evidence

- Worktree `C:/Users/Administrator/Desktop/iu-events-gp2-audit`
- Branch `fix/gp2-demo-readiness-i18n-20261120`
- Recovered checkpoint `18140f12cb8a8b2f59fc1e986470298c4436afe9`
- Verified auth checkpoint `51350f5cd538582f43d1ebbb24f3fa8aaddd24f5`, pushed to the audit branch.
- Verified frontend checkpoint `072ffd132b09198ff8900ebe4a1c13778e44c6c9`, pushed to the audit branch.
- Latest implementation checkpoint `a109c81c9176bbbaee73b4c5fa0820432aa768ff`, pushed to the audit branch.
- Run `git rev-parse HEAD` to identify the commit containing this report. The audit log carries the dated verification history.
- Local logs and Chromium artifacts live in `%TEMP%\iu-gp2-audit-20261120`. Keep them outside Git.

## Latest verification

- The fresh GP2 matrix passed all 15 cases. Initial continuation run was 14/15. The TC-13 helper now uses the organizer's event list. TC-15 includes unpublishing and checking public removal.
- Organizer logout now resets the navbar's current-user query. TC-10 covered both attendee languages, bad credentials, successful login, refresh and logout, with organizer login and logout in English.
- TC-12 checked the actual admin and organizer routes and APIs for anonymous, attendee and organizer sessions.
- Initial type check returned 49 diagnostics. The base returned 56. Initial lint returned 1,410 findings, including 10 additions compared with the 1,419-finding base.
- TypeScript subsequently passed with zero diagnostics. Arabic/English extraction and compilation passed, with 34 Arabic entries reported missing. Both production bundles built and the compiled renderer passed four Arabic/English structural render checks. Production HTTP startup on port 5681 was blocked by the execution environment.
- Latest lint reported 1,386 findings (894 errors, 492 warnings). The comparison with the base found 11 additions and 44 removals.
- Extended retest was 6/6, including concurrent draft SSR. A focused retest after the print fix passed. The one-page certificate was extracted and visually inspected.
- Public/mobile and admin localization scenarios passed. After the account/profile switcher was added, the organizer localization retest reached the Arabic create-event step and failed on a 140-second timeout waiting for a button named `إنشاء فعالية`. The snapshot shows a link with that name and the Arabic form fields. Translation completeness across secondary screens is unverified.
- Browser free checkout, signed-in mobile booking, Mailpit confirmation, Arabic ticket link, expired sales, attendee privacy, check-in and ticket views were exercised. PHPUnit ran 1,366 tests and 3,958 assertions with no failures/errors, 2 skipped and 32 risky.
- Implementation stopped at the requested usage threshold. The follow-up checkpoint recorded the completed retest from its existing log and artifacts.

## Restart the isolated Windows stack

Before reuse, verify the expected listeners are free or belong to this worktree, and verify that `backend/.env` targets `127.0.0.1:55432/iu_gp2_demo`. Keep fixtures and environment files local. The existing PostgreSQL cluster owns `iu_gp2_demo` and `iu_gp2_test` under the local audit database role. Use the test database for PHPUnit.

```powershell
$audit = Join-Path $env:TEMP 'iu-gp2-audit-20261120'
$pg = 'C:/Program Files/PostgreSQL/18/bin'
& "$pg/pg_ctl.exe" status -D "$audit/pgdata"
# If stopped
& "$pg/pg_ctl.exe" start -D "$audit/pgdata" -l "$audit/postgres.log" -o '-h 127.0.0.1 -p 55432' -w
& "$audit/mailpit/mailpit.exe" --listen 127.0.0.1:8225 --smtp 127.0.0.1:1125
```

In a separate terminal in `backend`, run `php.exe artisan serve --host=127.0.0.1 --port=8010`. In another terminal in `frontend`, run:

```powershell
$env:NODE_ENV = 'development'
$env:NODE_HOST = '127.0.0.1'
node.exe --import ./instrument.mjs server.js --port 5680
```

The local frontend environment uses `VITE_API_URL_CLIENT=http://127.0.0.1:8010`, `VITE_API_URL_SERVER=http://127.0.0.1:8010` and `VITE_FRONTEND_URL=http://127.0.0.1:5680`. Verify HTTP 200 at the UI root, `http://127.0.0.1:8010/public/events` and the Mailpit UI.

Run Chromium from `e2e`:

```powershell
$audit = Join-Path $env:TEMP 'iu-gp2-audit-20261120'
$env:E2E_BASE_URL = 'http://127.0.0.1:5680'
$env:E2E_API_BASE_URL = 'http://127.0.0.1:8010/'
$env:E2E_SAAS_MODE = 'false'
$env:MAILPIT_URL = 'http://127.0.0.1:8225'
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = Join-Path $audit 'gp2-matrix.json'
node.exe node_modules/@playwright/test/cli.js test tests/gp2-demo.spec.ts --workers=1 --reporter=list,json --output "$audit/pw-matrix"
```

## Demo sequence on the development stack

1. Visit `http://127.0.0.1:5680`, switch Arabic/English and follow Events and About. Search by a synthetic event's title and filter by Workshops & Training.
2. Register a fresh synthetic attendee in a separate browser context. Open a free event and select Register now, then complete booking. Open My Bookings and show the ticket link. Use Mailpit at port 8225 for the confirmation.
3. Sign in at `/manage/login` using the local synthetic organizer from `$audit/demo-fixture.env`. Open the organizer's Events list. Create a future workshop, edit it, publish it, check public visibility in the attendee window, then unpublish from the organizer dashboard.
4. Use the focused certificate scenario for check-in and PDF evidence. Use TC-12 for role enforcement. Test at desktop width and at 390 × 844.

## Exact remaining work

1. Read the latest dated results in `GP2_G5_Final_Demo_Audit.md`. Check the exact local and remote hashes with `git rev-parse HEAD '@{upstream}'` and `git ls-remote --heads origin refs/heads/fix/gp2-demo-readiness-i18n-20261120`. Implementation checkpoint `612e1384b10cad3f4c251ea00bce21b7bf54d4e8` was verified on both local and remote before the final evidence commit.
2. Finish the route-by-route Arabic and English audit. Expand checks to portal dialogs, event and organizer email settings, waitlist, capacity, messages, account deletion and XLSX. Follow up on Arabic CSV requests where only an Accept-Language header is available and audit all inherited Laravel mail types. Checkout locales are stored on orders and attendees.
3. Finish the venue form and evaluate a map picker using an approved key-free tile provider or the existing optional geocoding integration. Finish manual address validation and test the Arabic country picker. Existing geocoding needs provider configuration, and map pin placement has not been implemented or tested.
4. Decide how to handle legacy foreign-currency event duplication before extending currency enforcement to that workflow. Keep original financial data. Verify the remaining Riyadh display paths and calendar files. Retire the unused standalone widget script and fixture together once the published app and deployment references have been audited.
5. Exercise scroll restoration on history Back and event navigation. Inspect a ticket PDF and scan its printed QR using physical hardware. Check both desktop and mobile free checkout and payment states, and check tablet layout. Reopen Arabic CSV and XLSX in Excel.
6. Rehearse the committee presentation and curate a clean isolated set of real-looking university sample events with appropriate images. Keep E2E data clearly marked. Run focused and final checks before pushing another checkpoint.

## Final verification commands

Use the service environment above. Production SSR can run at the same loopback frontend port after verifying and stopping the audit development listener. From `frontend`:

```powershell
npm.cmd run messages:extract -- --locale ar --locale en
npm.cmd run messages:compile
node.exe node_modules/typescript/bin/tsc --noEmit --pretty false
npm.cmd run build:ssr:client
npm.cmd run build:ssr:server
node.exe node_modules/eslint/bin/eslint.js src --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --format json --output-file "$audit/lint-final-20261122.json"
$env:NODE_ENV = 'production'
$env:NODE_HOST = '127.0.0.1'
node.exe --import ./instrument.mjs server.js --port 5680
```

From `backend`, use `php.exe -d memory_limit=1024M vendor/bin/phpunit --configuration "$audit/phpunit-isolated-20261121.xml" --colors=never`. Confirm the configuration points to `iu_gp2_test`. From `e2e`, load the local superadmin fixture privately if available and run:

```powershell
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = Join-Path $audit 'gp2-production-20261122.json'
node.exe node_modules/@playwright/test/cli.js test tests/gp2-demo.spec.ts tests/gp2-extended.spec.ts tests/gp2-localization.spec.ts tests/gp2-workflows.spec.ts tests/gp2-organizer-credentials.spec.ts tests/gp2-saudi-settings.spec.ts tests/gp2-localized-output.spec.ts tests/check-in/check-in-app.spec.ts tests/self-service/attendee-ticket-page.spec.ts --workers=1 --reporter=list,json --output "$audit/pw-production-20261122"
```

## Prompt for the next session

> Continue the IU Events GP2 final audit in `C:/Users/Administrator/Desktop/iu-events-gp2-audit` on `fix/gp2-demo-readiness-i18n-20261120`. Read AGENTS.md, CLAUDE.md, GP2_G5_Final_Demo_Audit.md and this handoff. Confirm local and remote HEAD, the owners of the loopback services, and the isolated database names. Use synthetic accounts only. Start with failures in the latest production verification, then complete the localization, venue, currency, checkout, QR/PDF and demo-data work above. Preserve the original checkout, local generated catalogs, lockfile, and temporary configuration. Save reviewed phase checkpoints to the audit branch with normal fast-forward pushes. Check the Codex five-hour and weekly remaining usage between phases.
