# GP2 G5 Final Demo Audit — WIP Checkpoint

## 2026-11-21 continuation

- Working branch `fix/gp2-demo-readiness-i18n-20261120`. Both local HEAD and the remote audit branch were at `18140f12cb8a8b2f59fc1e986470298c4436afe9` on recovery. Comparison base `ebfec454af3e22b697f30b703e19afed8e747307`.
- Confirmed the previous PostgreSQL cluster directory and ownership of `iu_gp2_demo` and `iu_gp2_test` before reuse. Restarted PostgreSQL, Mailpit, Laravel and frontend SSR on loopback. Docker Desktop's Linux engine remained unavailable. The native Laravel server serves API routes at its root and the first retry using `/api/` failed during fixture setup with 404s.
- Preserved the pre-existing unstaged non-Arabic/English compiled catalogs, line-ending-only lockfile status and untracked PHPUnit config. The temporary XML points at a different database by default. It was excluded from the checkpoint and was not used against that default.
- Account usage was available at recovery. The Codex account endpoint reported 95% remaining in the five-hour window and 69% remaining for the week.

### Phase 1 focused Chromium retest

| ID | Result | Observed behavior |
|---|---|---|
| TC-10 | PASS | Attendee login returned 401 for incorrect credentials and 200 for valid credentials in both Arabic and English. The respective error messages and RTL/LTR directions were visible. My Bookings survived refresh and disappeared on logout. Organizer login and profile returned 200, the session survived refresh, and the navbar and reloaded page reflected logout. |
| TC-12 | PASS | Anonymous API requests returned 401. An attendee token received 403 for the events and admin APIs. The organizer received 200 for the events API and 403 for admin. Browser navigation redirected denied viewers and rendered the organizer dashboard for an authorized organizer. No checked page response or API returned 500. |

The test waits for hydration before filling the initial server-rendered form. A subsequent attempt revealed that organizer logout left the current user cached in the public navbar despite the logout response. Resetting the current-user query after successful logout fixed the stale session display. SSR startup now supports `NODE_HOST` to keep the audit listener on loopback.

Executed in `e2e` with `E2E_BASE_URL=http://127.0.0.1:5680`, `E2E_API_BASE_URL=http://127.0.0.1:8010/`, `MAILPIT_URL=http://127.0.0.1:8225` and `E2E_SAAS_MODE=false`.

```powershell
node.exe node_modules/@playwright/test/cli.js test tests/gp2-demo.spec.ts --grep 'TC-1[02]' --workers=1 --reporter=list,json --output "$audit/pw-auth-final-20261121"
```

Final focused run **2 passed, 0 failed, 0 skipped** in 28.6 seconds. Local evidence is in `%TEMP%\iu-gp2-audit-20261120\gp2-auth-final-20261121.log` and the corresponding JSON. Earlier attempts kept separate logs and their failure screenshots, videos and traces under `pw-auth-repro-20261121`, `pw-auth-expanded-20261121` and `pw-auth-retest-20261121`. The historical 13/15 and this 2/2 are separate runs. A fresh, complete matrix remains pending.

### Initial frontend comparison

The same installed tools were run from this worktree and a temporary `git archive` of the base frontend. ESLint found **1,419** findings at the base (889 errors, 530 warnings) and **1,410** at the start of the continuation (893 errors, 517 warnings). Comparing counts by file, rule and message identified 10 added and 19 removed findings. TypeScript reported **56** diagnostics at the base and **49** at the start of the continuation. The certificate QR import and Arabic token overrides introduced two diagnostics. Production builds, the six extended scenarios and the final matrix remain pending.

### Phase 2 frontend verification

Auth checkpoint `51350f5cd538582f43d1ebbb24f3fa8aaddd24f5` was pushed to the audit branch. The frontend now uses the existing QR dependency, typed Arabic interpolation and valid Gettext placeholders. Corrected type and API payload mismatches in event creation, category ordering, attendee tax fields, check-in list creation, questions, social settings and ticket previews. Restored the existing Hi.Events attribution component, respecting the commercial-license setting and keeping university branding.

| Check | Result | Evidence |
|---|---|---|
| Arabic and English extraction | PASS | `npm.cmd run messages:extract -- --locale ar` and the same command for `en`. Both catalogs have 3,151 entries. Lingui reported 34 missing Arabic entries. English is the source locale. |
| Catalog compilation | PASS | `npm.cmd run messages:compile` exited 0. Generated non-demo locale files were excluded from the commit. |
| TypeScript | PASS | `node.exe node_modules/typescript/bin/tsc --noEmit --pretty false` exited 0 with zero diagnostics. |
| ESLint | FAIL | `node.exe node_modules/eslint/bin/eslint.js src --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --format json --output-file <local-report>` found 1,386 findings (894 errors, 492 warnings). Comparison with the base identified 11 added and 44 removed findings. Added findings include Lingui interpolation, explicit bilingual literals, technical literals and a hook dependency. |
| Production SSR build | PASS | `npm.cmd run build:ssr:client` and `npm.cmd run build:ssr:server` exited 0, producing the client manifest and server entry. Warnings include Sass deprecations, a browser externalization notice and large chunks. |
| Production SSR renderer | PASS | `node.exe "$audit/render-ssr-smoke.mjs"` invoked the compiled render entry for four concurrent requests. Arabic and English homepage and login variants returned 200 with the expected locale, direction and text. |
| Production HTTP listener | BLOCKED | The execution environment rejected both the direct Node startup and `npm.cmd run start -- --port 5681` with `blocked by policy`. The pre-existing port 5680 remains the development SSR listener. |
| Browser hydration | Partial | Focused development SSR auth passed. Production HTTP hydration and broad screen coverage remain pending. |

Evidence lives in the audit temp directory in `lingui-final-extract-*.log`, `lingui-final-compile.log`, `lint-build-20261121.json`, `build-client-final.log`, `build-server-final.log` and `production-render-smoke.log`. The first extended run executed all six scenarios (5 passed, 1 failed). The failure was the authenticated draft SSR request. The expanded retest uses explicit synthetic viewer cookies and validates Laravel's draft access for each viewer separately.

### Latest complete GP2 matrix

The first continuation run returned 14 passes and 1 failure. TC-13 followed the cross-organizer route, which redirected a one-organizer account to its dashboard. The browser helper now opens the organizer's event list. The second complete run executed **15 cases, 15 passed, 0 failed, 0 blocked, 0 not run** in approximately two minutes. This is evidence from the current audit and does not change the submitted PDF.

From `e2e`, using the isolated environment in GP2_NEXT_SESSION.md:

```powershell
$env:PLAYWRIGHT_JSON_OUTPUT_FILE = Join-Path $audit 'gp2-matrix-20261121.json'
node.exe node_modules/@playwright/test/cli.js test tests/gp2-demo.spec.ts --workers=2 --reporter=list,json --output "$audit/pw-gp2-matrix-20261121"
```

Every row below ran under that command. The list log and JSON map results to individual cases. The preceding TC-13 failure screenshot and trace are in `pw-gp2-matrix-initial-20261121`.

| Case | Result | Observed behavior |
|---|---|---|
| TC-01 | PASS | HTTP 200 with IU branding and homepage headline |
| TC-02 | PASS | Events and About navigation and return to Home |
| TC-03 | PASS | Published synthetic event visible, draft absent |
| TC-04 | PASS | Title search, no-results state and query reset |
| TC-05 | PASS | Workshop category retained its event and excluded a technology event |
| TC-06 | PASS | Public title, detail headings, time and category visible |
| TC-07 | PASS | About objectives, audiences and Explore Events link visible |
| TC-08 | PASS | Homepage, catalog and About fit a 390 × 844 viewport |
| TC-09 | PASS | Arabic/English switch without a document reload, correct direction and persistence on navigation and refresh |
| TC-10 | PASS | Bilingual attendee credentials, session and logout, plus English organizer session and logout |
| TC-11 | PASS | Browser signup and HTTP 422/409 for incomplete and duplicate registrations |
| TC-12 | PASS | Anonymous 401, attendee 403, organizer 200 on authorized events and 403 on admin, plus page guards |
| TC-13 | PASS | Create event through the organizer's event list, entered title visible |
| TC-14 | PASS | Updated title remained after reload |
| TC-15 | PASS | Published draft appeared publicly, then unpublish restored Draft and public API returned 404 |

### Localization, workflows and demo status

Frontend build checkpoint `072ffd132b09198ff8900ebe4a1c13778e44c6c9` was pushed. The subsequent checkpoint localizes the account dropdown, admin headings, attribution, certificate labels and locale-sensitive numeric and currency presentation. It adds the language selector to the shared account/profile header. The public/mobile bilingual scenario and administration scenario passed, including checks for page exceptions, hydration errors and local 5xx responses. The first organizer localization scenario passed its English headings but could not switch on Account Settings because the header lacked a language control. A focused retest was started after adding it. Whole-app translation coverage remains incomplete, especially secondary states, validation, report detail pages and configuration-specific screens.

- The six extended scenarios passed together in `gp2-extended-retest-20261121.json`. They covered menus, concurrent authenticated and anonymous draft isolation, attendance and eligibility, capacity and cancellation, duplicate registration and catalog retry.
- Checking the first certificate artifact exposed a blank PDF. The print portal made the certificate render, but it spanned two pages. A compact print layout passed the focused Chromium retest. pypdf extracted the recipient and verification code from the single page, and the Poppler rendering showed the branded certificate, QR code and footer together. Evidence is in `pw-gp2-certificate-single-page` and `gp2-certificate-single-page.png`.
- The inherited check-in and ticket run passed 5 cases, covering check-in, undo, totals and ticket/print views. Its free checkout case used a stale entry point. After updating the browser helper to open the registration dialog, free checkout and a signed-in mobile booking passed, including Mailpit confirmation and the Arabic ticket link in My Bookings. The registration deadline retest passed with HTTP 422, a closed-sales message and a disabled registration action.
- Privacy checks used synthetic records and verified 401 for anonymous certificate access, 403 for another attendee's certificate and cancellation, and an empty result when another attendee supplied the owner's email to the bookings endpoint.
- PHPUnit on `iu_gp2_test` exited 0 with **1,366 tests, 3,958 assertions**, 0 failures, 0 errors, 2 skipped, 32 risky, 1 deprecation and 22 PHPUnit notices. Command from `backend` was `php.exe -d memory_limit=1024M vendor/bin/phpunit --configuration "$audit/phpunit-isolated-20261121.xml" --colors=never`.
- TypeScript and Lingui compilation passed again after the account header change. Client and server bundles passed before that last header and print refinement. Rebuild after resuming and verify production HTTP hydration in an environment that permits the listener. The latest retained ESLint comparison is the phase 2 run.
- Evidence for these runs is in the audit temp directory under `gp2-localization-20261121`, `gp2-workflows-20261121`, `gp2-inherited-20261121`, `gp2-focused-finish`, `gp2-certificate-single-page` and `phpunit-20261121.log`. The Playwright commands use `--reporter=list,json` and the matching `pw-*` artifact directories. Check the continuation report for exact commands and any focused verification outstanding at save time.

The development stack can demonstrate the tested public, booking and organizer workflows. The existing private synthetic organizer fixture was verified to log in and own an organizer. A separate curated committee rehearsal remains pending. At the final usage check before saving, the account had 17% remaining in the five-hour window and 57% for the week. Further broad work was deferred under the requested checkpoint rule.

## Historical checkpoint of 2026-11-20

Date: 2026-11-20 (Asia/Riyadh)
Branch: `fix/gp2-demo-readiness-i18n-20261120`
Base: `origin/main` at `ebfec454af3e22b697f30b703e19afed8e747307`
Worktree: `C:\Users\Administrator\Desktop\iu-events-gp2-audit`
Checkpoint status: incomplete, local only. No push or merge was performed.

## Scope and evidence

The separate worktree was created from the fetched `origin/main`. The original `fix/graduation-project-final-audit` checkout was left alone. The available report `audit-input/GP2_Final_Report_G5.pdf` was read. Its test tables claim TC-01–TC-15 all passed, including Arabic/English switching. Those are report claims, not independent evidence.

Local evidence is in `%TEMP%\iu-gp2-audit-20261120\gp2-browser.log`, `gp2-browser.json`, `phpunit.log`, and `backend.out.log`. The first two include browser failure artifacts and may contain test data. They are intentionally not committed. The isolated PostgreSQL service uses loopback port 55432 and databases `iu_gp2_demo` and `iu_gp2_test`. The audit UI was observed at `http://127.0.0.1:5680/`, Laravel at `http://127.0.0.1:8010/`; the existing port 5678 remained separate and was not used as proof for the audit worktree. Local mail capture was configured for the audit environment. Do not reuse the local fixture database as production data.

Observed toolchain versions from lockfiles/runtime: React 19.2.6, Vite 5.4.20, TypeScript 5.9.3, Lingui 4.14.1, Laravel 13.27.0, JWT Auth 2.9.2, Playwright 1.61.1, PHPUnit 12.5.28; runtime Node 24.19.0, npm 11.17.0, PHP 8.4.24, PostgreSQL 18. Docker Desktop engine was unavailable. Dependency installation completed for frontend, e2e, and backend. Isolated database migrations completed.

## Work completed

- Reworked locale selection so Lingui and `IULanguageContext` share state; wired locale persistence and document `lang`/`dir`, reactive date provider, and SSR request-specific locale handling.
- Changed SSR request/query context to avoid shared per-request Axios auth and query state. Added explicit locale headers and changed client startup to hydrate only when SSR markup exists.
- Updated high-traffic IU homepage, catalog, auth, dashboard, reporting, event, and certificate UI paths for Arabic/English; made event dates use event time zone and added catalog retry/error presentation. This is targeted coverage, not a verified translation of every application string.
- Fixed admin membership rendering that could produce a server error, and made missing organizer roles deny authorization safely rather than dereferencing null.
- Fixed event certificate eligibility persistence through the existing event settings field and exposed that field through event resources. Updated certificate actions and localized attendee-facing API messages.
- Fixed stale/incomplete PHPUnit mocks in order handler tests. Added GP2 Playwright cases and six additional browser scenarios.
- Preserved existing event-detail/auth behavior while correcting browser test selectors and unauthorized API expectations where observed.

## Defects fixed in this checkpoint

1. Locale selection could diverge across Lingui and the custom language context, and direction/persistence did not reliably follow it. Source fix is present; broad route-by-route coverage remains incomplete.
2. SSR and browser locale/request state could leak or mismatch across requests. Per-request context and hydration selection were changed; no complete hydration matrix was run.
3. Event homepage hardcoded Arabic direction/date formatting and showed fabricated fallback data. Locale and actual event data now drive those elements.
4. Catalog API failures could appear as an empty successful listing. The UI now exposes retry/error state.
5. Admin dashboard could throw on absent organizer membership; attendee access to organizer/admin code could throw on absent role. Null-safe handling and explicit authorization tests were added.
6. Certificate eligibility control was not persisted. It now updates the existing eligibility field and returns it in event resources.
7. Several order-handler test doubles did not model the orders-table query used by the handler. The mocks were updated; the final backend suite passed assertions.
8. Attendee login/register API messages and selected certificate labels were not consistently localized. Relevant messages and labels were added; whole-app completeness is unverified.

## GP2 test matrix

The initial Playwright run executed all 15 scenarios. 13 passed and 2 failed. The selector-only retry was invoked with a Windows command-line quoting error (`TC-12` was parsed as a command), so it did not constitute a valid retest. A backend test now asserts attendee admin/organizer access returns 403, but the failed browser cases were not both rerun successfully.

| ID | Scenario | Result | Observed evidence / disposition |
|---|---|---|---|
| TC-01 | Home page loading | PASS | Initial GP2 Playwright run. |
| TC-02 | Navigation | PASS | Initial GP2 Playwright run. |
| TC-03 | Events listing | PASS | Initial GP2 Playwright run. |
| TC-04 | Event search | PASS | Initial GP2 Playwright run. |
| TC-05 | Event filtering | PASS | Initial GP2 Playwright run. |
| TC-06 | Event details | PASS | Initial GP2 Playwright run. |
| TC-07 | About Us | PASS | Initial GP2 Playwright run. |
| TC-08 | Responsive layout | PASS | Initial GP2 Playwright run. |
| TC-09 | Arabic/English switching | PASS | In-place Arabic→English→Arabic, navigation and refresh observed; this does not establish complete application localization. |
| TC-10 | User login | FAIL | Playwright could not find the test's exact Email label because the rendered required-field label differed. Test selector was adjusted; valid browser retest did not complete. |
| TC-11 | User registration | PASS | Initial Playwright run; UI registration and invalid/duplicate API validation observed. |
| TC-12 | Role access control | FAIL | Admin dashboard returned HTTP 500 for attendee with no organizer membership. Test observed 500 where only 401/403 were allowed. Null-safe authorization fix landed and PHPUnit rerun passed; Playwright retest remains outstanding. |
| TC-13 | Create event | PASS | Organizer flow in initial Playwright run. |
| TC-14 | Edit event | PASS | Saved edit observed after reload in initial Playwright run. |
| TC-15 | Publish event | PASS | Published event appeared publicly in initial Playwright run. |

### Other test and check results

- PHPUnit: final retained run `1365 tests, 3954 assertions`, zero errors and zero failures, 32 risky, 2 skipped, 1 deprecation, 22 PHPUnit notices. Exit was successful. The two skipped cases were reported as Imagick-dependent. Risky tests largely report no assertions; details are in the PHPUnit log.
- Earlier PHPUnit run: 5 errors and 2 failures, later cleared by correcting stale/incomplete Mockery order-table expectations. Retained notes identify the errors as order-handler tests whose mocks did not implement `DB::table('orders')`. The exact seven test names/messages are not available in the retained final log, so they are not reconstructed here. An earlier 128 MB run also stopped on memory exhaustion; the later run used 1024 MB.
- Lingui extraction for Arabic/English completed and reported 3151 Arabic catalog entries, including 34 empty/missing entries (many are identity English source strings). Catalog compilation was run, but a final post-change compile result was not retained. Generated files for other locales are excluded from this checkpoint.
- Frontend ESLint baseline before changes: 1419 issues (889 errors, 530 warnings), dominated by pre-existing unlocalized-string and unused-code findings. A final lint run was not completed.
- TypeScript checking failed on existing and intermediate errors, including Mantine date values, event form helpers and several types. Some touched-file errors were corrected, but final `tsc --noEmit` was not completed successfully.
- Production SSR builds, the broad inherited Playwright suite, the six new extended Playwright scenarios, full booking/cancellation/capacity/deadline/QR/check-in/certificate flows, and end-to-end auth retests: NOT RUN or not completed. No full mobile-device matrix was completed.
- Live UI/API startup and PostgreSQL connection/migrations were observed. Authentication workflows were partially exercised through Playwright; end-to-end authentication is not fully verified.

## Unresolved defects and risks

- **High — localization completeness:** Arabic and English catalog/dashboard coverage is not exhaustive. Some untouched application routes or third-party labels may remain English/Arabic. Reproduce by visiting every public, organizer, and admin route in both locales and inspecting dialogs, validation, empty states and errors.
- **High — TC-10:** login browser retest is absent. Run the focused login case with valid and invalid credentials and verify session persistence/logout.
- **High — TC-12:** browser retest after role fix is absent. Verify attendee and organizer attempts against both page routes and APIs; confirm expected 401/403, never 500.
- **High — type/build health:** final TypeScript check and production builds are not cleanly demonstrated. Run extraction/compile, `tsc --noEmit`, lint and client/server builds; address errors introduced by this branch and separate pre-existing baseline errors.
- **High — booking/security flows:** payment is outside the report scope. Booking confirmation, duplicate prevention, capacity, deadline, cancellation, QR and private-data access are not fully verified.
- **Medium — attendance/certificates:** eligibility persistence was fixed and a unit test added, but check-in eligibility, real download/verification and certificate UI flow were not completed end to end. Do not claim full support until verified.
- **Medium — SSR/hydration:** architecture was changed to isolate request state and avoid unnecessary hydration, but authenticated SSR, route transitions, concurrent users and console/network errors need retest.
- **Medium — report accuracy:** the PDF's 15/15 PASS claim is not substantiated by this run; TC-10 and TC-12 failed initially. Recommend correcting the report to mark them failed/pending until successful evidence exists. State scope exclusions and attendance/certificate limitations based on implementation evidence.
- **Medium — reproducibility:** the audit database contains disposable test fixtures. Startup helper scripts and fixture credentials are in the local temp directory and intentionally excluded from Git. Recreate them privately before a committee demo; never copy them into a shared report.

## Recommended resume sequence

1. Confirm the branch and local-only checkpoint commit. Keep the original checkout untouched.
2. Start only the existing audit worktree services on ports 5680/8010 and isolated PostgreSQL 55432; verify ownership before restarting anything.
3. Run the focused TC-10 and TC-12 tests with correctly quoted Windows arguments. Inspect screenshot/trace from the initial 2 failures if needed.
4. Finish Lingui compile, TypeScript, lint, SSR client/server builds and record exact command outputs.
5. Run the six extended GP2 scenarios and relevant inherited Playwright coverage without treating unexecuted cases as passes.
6. Verify booking, privacy, check-in and certificate workflows; document unsupported/partial behaviors honestly.
7. Complete route-by-route Arabic/English checks, update this matrix and exact counts, then commit and push to the existing audit branch as authorized in the continuation.

## Counts at checkpoint

For the 15 GP2 cases: **13 passed, 2 failed, 0 blocked, 0 not run** (the two failures remain failures until a successful retest; fixes do not retroactively change outcomes).
Additional browser scenarios: **not run/incomplete**.
PHPUnit: **1365 passed without assertion failure, 0 failed, 2 skipped, 32 risky**; risky and skipped are separately reported by PHPUnit.
Confirmed source defects fixed: **8 grouped findings** listed above.
Known unresolved findings: **7 grouped areas** listed above. This is a WIP inventory, not a production-readiness certification.
