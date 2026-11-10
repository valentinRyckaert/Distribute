# Code conventions

These rules apply to every change in this repository. `bun run check` enforces the mechanical ones.

## Project layout

```
app/              expo-router routes only (one file = one screen or layout)
src/components/   reusable UI components, one component per file
src/lib/          Supabase client, data access (api.ts), types, pure helpers
src/theme/        design tokens from the Figma design system
supabase/         migrations, seed and local config
tests/            unit (tests/unit), integration (tests/integration)
.maestro/         end-to-end flows
```

- Nothing that is not a route lives in `app/` (expo-router would treat it as a screen).
- Import from `src/` with the `@/src/...` alias, never with `../../`.

## Naming

| Thing                        | Style                               | Example                        |
| ---------------------------- | ----------------------------------- | ------------------------------ |
| Component file and component | PascalCase                          | `ReportCard.tsx`, `ReportCard` |
| Hook                         | camelCase starting with `use`       | `useSession`                   |
| Function, variable           | camelCase, verb first for functions | `fetchReport`, `isAdmin`       |
| Constant                     | UPPER_SNAKE_CASE                    | `MAX_TITLE_LENGTH`             |
| Type, interface              | PascalCase, no `I` prefix           | `Report`                       |
| Database column              | kept as in the schema               | `REP_libelle`                  |

## TypeScript

- `strict` mode, no `any`. Narrow with types from `src/lib/types.ts`.
- Exported functions declare their return type.
- `bun run typecheck` passes with no errors.

## Formatting and linting

- Prettier formats the code (`bun run format`), config in `.prettierrc.json`: no semicolons, single quotes, 100 columns.
- `bun run lint` (eslint-config-expo) passes with no errors.

## Documentation

- Every exported function, component and hook has a JSDoc docstring: one sentence for what it does,
  plus `@param` / `@returns` when the name and types do not already say it.
- Comments explain _why_, never _what_. A known limitation is written `// shortcut: <limit>, <when to upgrade>`.

## Components and screens

- Screens never call Supabase directly: they go through `src/lib/api.ts`, which keeps queries in one place
  and makes screens testable with a mocked API.
- API functions throw on error. Screens catch and show a message the user understands, in French.
- Styles use `StyleSheet.create` and the tokens from `src/theme`, no hard-coded colors or sizes.
- All user-facing text is French, plain and without jargon. Every icon comes with a text label.
- Touch targets are at least 48 px tall (56 px for primary actions). Interactive elements set
  `accessibilityRole` and `accessibilityLabel` when the visible text is not enough.

## Security

- The publishable Supabase key is public by design: **Row Level Security protects the data**. Every
  table has RLS enabled and explicit policies; a feature is not done until its policies are.
- Roles come from `app_metadata` (only the server can write it), never from `user_metadata` or the client.
- Client-side checks (hiding an admin button) are for comfort only; the database enforces the rule.
- Privileged operations go through `security definer` SQL functions with `set search_path = ''` and an
  explicit permission check inside.
- Validate user input on both sides: length limits in the form, `check` constraints in the database.
- No secret (service role key, password) in the code or in the repository; `.env` stays ignored.
- Uploaded files go to a private storage bucket with per-user policies.

## Tests

- Unit and component tests: `tests/unit`, Jest + Testing Library, API mocked.
- Integration tests: `tests/integration`, run against the local Supabase (`bun db:start`), they check
  the RLS policies and SQL functions.
- End-to-end: Maestro flows in `.maestro/`.
- Coverage stays at or above 75 % (`bun run test:coverage`).

## Git

- [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, lowercase,
  imperative, no final period, 72 characters max. Types: `feat`, `fix`, `refactor`, `style`, `test`,
  `docs`, `chore`, `perf`, `ci`.
- One logical change per commit; the body explains _why_ when it is not obvious.
- Run `bun run check` before committing.
