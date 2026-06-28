# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebApp v0.2 — a Laravel 13 + Inertia 3 + React 19 all-in-one platform that combines:
- **Digital business card** (public site rendered from active `SiteTemplate` via Puck editor)
- **Booking system** (FullCalendar v7 CRUD with JSON endpoints)
- **Live chat** (Laravel Reverb WebSockets between public visitors and admins)

Documented in Spanish at `resources/docs/0.1/` (LaRecipe 2.2, served at `/docs/0.1/overview`). Default admin: `admin@admin.com` / `Admin2026$`.

## Common Commands

All commands run from the project root.

```bash
# Setup
composer install
npm install
php artisan migrate:fresh --seed
php artisan storage:link
npm run build

# Dev (PHP server + queue + logs + vite in one terminal)
composer run dev

# Frontend only
npm run dev          # vite dev server
npm run build        # production build
npm run build:ssr    # build + SSR bundle

# Lint / format / types
vendor/bin/pint --dirty --format agent    # PHP formatter (run after editing PHP)
npm run lint                              # eslint --fix
npm run lint:check                        # eslint check only
npm run format                            # prettier --write resources/
npm run format:check                      # prettier --check
npm run types:check                       # tsc --noEmit
composer types:check                      # phpstan analyse

# Tests (Pest 4)
php artisan test --compact
php artisan test --compact --filter=testName
php artisan make:test --pest SomeFeatureTest
composer test                              # lint:check + types:check + artisan test

# CI bundle
composer ci:check                          # runs lint, format, types, tests

# Production
pm2 start ecosystem.config.cjs             # starts Laravel Reverb on :3001
pm2 save
```

If the user does not see a frontend change, ask them to run `npm run build` / `npm run dev` / `composer run dev` — assets are Vite-bundled and need to be rebuilt after edits.

## Architecture

### Backend (`app/`)
- **`app/Http/Controllers/Admin/`** — protected admin panel controllers (Dashboard, Event, Chat, SiteTemplate, SiteMenu, SiteSetting, Role, User, ChatWidgetSetting). Routes are gated by Spatie Permission middleware (`permission:manage-users`, `permission:manage-roles`, `permission:manage-templates`, `permission:manage-settings`) and `role:admin` for chat widget config.
- **`app/Http/Controllers/Site/HomeController.php`** — single-action `__invoke` controller for `/`. Resolves which `SiteTemplate` to render (`?template=` query param → `SiteSetting::active_template_slug` → latest active). Enriches media URLs via `App\Support\TemplateMediaUrl::enrichSections` then Inertia-renders `site/landing`.
- **`app/Http/Controllers/Widget/`** — public widget endpoints for the chat floating button. `/widget/auth/*` and `/widget/chat/*` throttled at `30,1`. Visitors log in without password (email + phone) via `Widget\AuthController`.
- **`app/Http/Controllers/Settings/`** — Fortify-backed profile + security pages.
- **`app/Http/Middleware/`** — `HandleAppearance`, `HandleInertiaRequests`.
- **`app/Models/`** — `User` (HasRoles + HasMedia avatar + Fortify Passkeys + 2FA), `SiteTemplate`, `SiteTemplateBlock`, `SiteSetting` (singleton via `SiteSetting::instance()`), `SiteMenuItem` (self-referential for sub-menus), `MediaHolder` (Spatie MediaLibrary), `Event` (FullCalendar), `Chat` / `ChatMessage` (HasMedia attachments), `ChatWidgetSetting`.
- **`app/Events/ChatMessageSent`** — `ShouldBroadcastNow` private channel `chat.{chatId}`. Channel auth in `routes/channels.php` allows the chat owner OR any user with `admin` role.
- **`app/Actions/Fortify/`** — Fortify actions (registration, password reset, 2FA, passkeys).
- **`app/Services/MinimaxImageService.php`** — wrapper for AI image generation (`logo concepts` workflow).
- **`app/Support/TemplateMediaUrl.php`** — rewrites media IDs in template JSON to public URLs before sending to frontend.
- **`app/Console/Commands/`** — `RegisterLogoConceptsCommand` (`media:register-logo-concepts`), `UserPromoteCommand`.

### Routes (`routes/`)
- **`web.php`** — public `/`, authenticated `admin/*` group, `/widget/*` group, plus a `routes/settings.php` require for Fortify routes. There is also a `/canvas` route at the bottom that returns the `canvas` view with no-cache headers (used for the design canvas artifact).
- **`channels.php`** — broadcast channel auth (private chat channels).
- **`settings.php`** — Fortify route definitions.

### Frontend (`resources/js/`)
- **`app.tsx`** — Inertia bootstrap. `configureEcho({broadcaster: 'reverb'})` wires Laravel Echo with Reverb. `window.Echo = echo()` exposes it globally. Layout is auto-selected by page-name prefix: `site/*` → no layout, `auth/*` → `AuthLayout`, `settings/*` → nested `[AppLayout, SettingsLayout]`, else `AppLayout`.
- **`pages/admin.tsx`** — Dashboard (Reverb socket status card, 4 metric cards, hourly-message chart).
- **`pages/admin/<resource>/`** — agenda, chat-live, media, roles, site-menu, site-settings, site-templates, users, settings, auth.
- **`site/`** — public site components (alias `@site`). The `site/landing` Inertia page renders the active template's blocks via Puck.
- **`components/ui/`** — shadcn/ui primitives (Radix UI + Tailwind v4 + `class-variance-authority`).
- **`routes/`** and **`actions/`** — generated by **Laravel Wayfinder** from Laravel routes/controllers. Frontend imports come from `@/actions/` or `@/routes/` (configured in `vite.config.ts`).
- **`hooks/`** — `use-appearance` for light/dark mode initialization.
- **`layouts/`** — `app-layout`, `auth-layout`, `auth/*`, `settings/*`.

### Database
- SQLite at `database/database.sqlite` for dev. Migrations in `database/migrations/` (created via timestamps). `SiteSetting` is treated as a singleton row id=1.
- Factories in `database/factories/` (User, Chat, ChatMessage, Event, SiteTemplate).
- Seeders: `DatabaseSeeder` calls `RoleSeeder` then creates the default `admin@admin.com` user and assigns the `admin` role.

### Broadcast / Reverb
- Server config: `REVERB_SERVER_HOST=0.0.0.0`, `REVERB_SERVER_PORT=3001`, `REVERB_SERVER_PATH=/app`.
- Client config (Nginx-fronted): `REVERB_HOST=app.hostbol.lat`, `REVERB_PORT=443`, `REVERB_SCHEME=https`. Same `VITE_REVERB_*` values get baked into the JS bundle at build time.
- `ecosystem.config.cjs` runs `php artisan reverb:start` under pm2 in production.
- See `REVERB_SETUP.md` for the full pcntl + Nginx proxy configuration recipe.

### Styling
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (`resources/css/app.css`). Use `tw-animate-css` for animations.
- Component variants via `class-variance-authority` + `tailwind-merge` (see `resources/js/lib/utils.ts` style).
- Icons: `lucide-react`.

### Tests
- Pest 4 (`tests/Pest.php`, `tests/TestCase.php`). Tests live under `tests/Feature/` and `tests/Unit/`. Always run `php artisan test --compact` after changes; a change is not done until the relevant tests pass.

## Conventions

- Follow Laravel Boost conventions in `AGENTS.md` (project-specific override of Boost's defaults). Key points: PHP 8 constructor promotion, explicit return types, PHPDoc over inline comments, `php artisan make:` for scaffolding, Eloquent API resources for API responses, named routes via `route()`.
- Models use `Illuminate\Database\Eloquent\Attributes\Fillable` / `Attributes\Hidden` attributes (not `$fillable` / `$hidden` arrays).
- Reuse existing components and patterns before writing new ones — check sibling files for structure, naming, and idiom.
- After editing PHP, run `vendor/bin/pint --dirty --format agent`. Do not use `--test`.
- Use `database-query` / `database-schema` MCP tools instead of `php artisan tinker` for read-only inspection. Use `search-docs` MCP before making changes — it returns version-specific docs for installed packages.
- Do not change application dependencies without approval.
- Do not create documentation files unless explicitly requested.

## Notes

- `canvas-tarjeta-digital.{svg,png,pdf}` and `canvas-philosophy.md` are a brand-design canvas artifact at the repo root — public copies in `public/`. They are not part of the app runtime.
- `resources/docs/0.1/` is end-user documentation (LaRecipe) in Spanish; do not modify it casually.
- Wayfinder types live under `resources/js/wayfinder/` and route helpers under `resources/js/routes/`. Re-run `npm run build` after adding Laravel routes so the generated TS files refresh.

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.3
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/ai (AI) - v0
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/reverb (REVERB) - v1
- laravel/wayfinder (WAYFINDER) - v0
- larastan/larastan (LARASTAN) - v3
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/echo-react (ECHO_REACT) - v2
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- laravel-echo (ECHO) - v2
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

=== spatie/laravel-medialibrary rules ===

## Media Library

- `spatie/laravel-medialibrary` associates files with Eloquent models, with support for collections, conversions, and responsive images.
- Always activate the `medialibrary-development` skill when working with media uploads, conversions, collections, responsive images, or any code that uses the `HasMedia` interface or `InteractsWithMedia` trait.

</laravel-boost-guidelines>
