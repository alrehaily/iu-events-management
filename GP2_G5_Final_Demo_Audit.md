# GP2 G5 Final Demo Audit — WIP Checkpoint

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
7. Complete route-by-route Arabic/English checks, update this matrix and exact counts, then prepare a separate final commit for review. Do not push until requested.

## Counts at checkpoint

For the 15 GP2 cases: **13 passed, 2 failed, 0 blocked, 0 not run** (the two failures remain failures until a successful retest; fixes do not retroactively change outcomes).
Additional browser scenarios: **not run/incomplete**.
PHPUnit: **1365 passed without assertion failure, 0 failed, 2 skipped, 32 risky**; risky and skipped are separately reported by PHPUnit.
Confirmed source defects fixed: **8 grouped findings** listed above.
Known unresolved findings: **7 grouped areas** listed above. This is a WIP inventory, not a production-readiness certification.
