# Contributing to SerialDash

`SPEC.md` is the source of truth for what this project does; `CLAUDE.md` describes how work on it is organized (one milestone at a time, requirement IDs cited in commits, ask when the spec is ambiguous). Read both before making non-trivial changes.

## Setup

```sh
npm install        # installs the whole monorepo (npm workspaces)
npm run gen         # generates app/src/protocol/generated/*.ts and docs/protocol/messages.md from /protocol/schema
```

Node ≥ 20 is required (see `engines` in `package.json`). The Arduino library (`lib/SerialDash/`, from M3) is built and tested separately with PlatformIO — see `pio test -e native -d lib/SerialDash` and `arduino-cli` once it exists.

## Commands

| Command                                | Effect                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `npm install`                          | Installs monorepo dependencies                                                         |
| `npm run gen`                          | Generates TS types and documentation from `/protocol/schema`                           |
| `npm run gen:check`                    | Regenerates and fails if the output differs from what's committed (CI alignment check) |
| `npm run dev`                          | Starts the webapp in dev mode                                                          |
| `npm run lint`                         | Lints app, tools, and docs (ESLint + Prettier)                                         |
| `npm run format`                       | Applies Prettier formatting                                                            |
| `npm test`                             | Validates `/protocol/test-vectors` against the schema, and runs the app's unit tests   |
| `npm run e2e`                          | End-to-end tests against the simulator (from M2)                                       |
| `npm run docs:dev`                     | Documentation site in dev mode                                                         |
| `npm run docs:build`                   | Builds the documentation site                                                          |
| `npm run docs:screenshots`             | Regenerates docs screenshots/GIFs (from M7)                                            |
| `pio test -e native -d lib/SerialDash` | Native tests for the Arduino library (from M3)                                         |
| `npm run lib:compile`                  | Compiles every library example for every supported board (from M3)                     |

This table is kept in sync with the one in `CLAUDE.md`.

## Workflow

1. Work happens one milestone at a time (`SPEC.md` §11) — don't start the next one before the current one's acceptance criteria are met.
2. Cite requirement IDs (e.g. `PRT-31`, `APP-CON-05`) in commits, tests (`describe('PRT-31 …')`), and comments where a choice isn't obvious.
3. If the spec is ambiguous or self-contradictory, stop and ask rather than inventing protocol behavior. Minor UI details can be a judgment call — explain the choice in the PR/commit.
4. Before calling anything done, check the Definition of Done (`SPEC.md` §9.5): requirements cited, automated tests green, user docs updated, `it`/`en` strings present, protocol changes carried through schema + test vectors + changelog, widget changes have a complete descriptor, and a changelog entry exists.

## Adding a widget

See [docs/contributing/adding-a-widget.md](docs/contributing/adding-a-widget.md).

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/): `feat(app): …`, `fix(lib): …`, `docs: …`, `test(protocol): …`.

## Conventions

- Code, identifiers, code comments, and commit messages: **English**.
- User-facing documentation language: per decision D2 (`SPEC.md` §10) — English reference plus an Italian user guide under `/it/`.
- TypeScript `strict`, no explicit `any`. TSDoc on exported APIs (DOC-40).
- C++: repository `clang-format`, Doxygen comments on every public symbol (DOC-10). No `String`, `malloc`, `new`, or `delay()` in the library (`SPEC.md` §6.1).
