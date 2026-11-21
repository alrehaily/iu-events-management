# IU Events GP2 audit continuation

## Repository and evidence

- Worktree `C:/Users/Administrator/Desktop/iu-events-gp2-audit`
- Branch `fix/gp2-demo-readiness-i18n-20261120`
- Recovered checkpoint `18140f12cb8a8b2f59fc1e986470298c4436afe9`
- Verified auth checkpoint `51350f5cd538582f43d1ebbb24f3fa8aaddd24f5`, pushed to the audit branch.
- Verified frontend checkpoint `072ffd132b09198ff8900ebe4a1c13778e44c6c9`, pushed to the audit branch.
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
- Public/mobile and admin localization scenarios passed. The organizer scenario exposed the missing account/profile switcher, which was added for the focused retest. Translation completeness across all secondary screens is unverified.
- Browser free checkout, signed-in mobile booking, Mailpit confirmation, Arabic ticket link, expired sales, attendee privacy, check-in and ticket views were exercised. PHPUnit ran 1,366 tests and 3,958 assertions with no failures/errors, 2 skipped and 32 risky.

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

1. Check the organizer localization result in `$audit/gp2-focused-finish.log`. The deadline case passed. The one-page certificate evidence is in `$audit/pw-gp2-certificate-single-page`. The focused commands were:

   ```powershell
   node.exe node_modules/@playwright/test/cli.js test tests/gp2-workflows.spec.ts tests/gp2-localization.spec.ts --grep 'deadline|organizer forms' --workers=2 --reporter=list,json --output "$audit/pw-gp2-focused-finish"
   node.exe node_modules/@playwright/test/cli.js test tests/gp2-extended.spec.ts --grep 'certificate' --workers=1 --reporter=list,json --output "$audit/pw-gp2-certificate-single-page"
   ```

2. Finish bilingual inspection of remaining routes, dialogs, validation, empty states and date/time/report details. Run `tests/gp2-localization.spec.ts` with the local synthetic administrator variables from `$audit/superadmin-fixture.env`.
3. Rerun Arabic/English extraction, compile, both production builds and lint after the latest refinements. Verify a production HTTP listener and browser hydration where allowed. Compare lint with `$audit/lint-baseline-ebfec454.json`.
4. Repeat the complete matrix on the final code and run a curated committee rehearsal with stable local sample events. Record findings and leave the submitted PDF intact.

## Prompt for the next session

> Continue the IU Events GP2 audit in `C:/Users/Administrator/Desktop/iu-events-gp2-audit` on `fix/gp2-demo-readiness-i18n-20261120`. Read AGENTS.md, CLAUDE.md, GP2_G5_Final_Demo_Audit.md and GP2_NEXT_SESSION.md. Confirm HEAD and service ownership, then resume the remaining work above. Use only the isolated demo/test databases and synthetic accounts. Preserve existing work, keep artifacts and credentials local, and commit reviewed changes to the audit branch. Push only a fast-forward to the existing audit branch. Update both audit documents with executed evidence and check the Codex rate limits when available.
