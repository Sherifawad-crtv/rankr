# Rankr front-end

Front-end for Rankr, an AI CV-ranking tool for SME recruiters. Runs entirely on mock data; every back-end call goes through `lib/api/`.

See `CLAUDE.md` for project rules and `docs/FRONTEND_PLAN.md` for the plan and decisions.

## Commands

```
npm run dev        # local dev
npm run build      # production build
npm run lint       # zero warnings
npm run typecheck  # generates route types, then tsc --noEmit
```

## Icons

Icons are from the [Solar Icon Set](https://www.figma.com/community/file/1166831539721848736) by 480 Design, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). They are copied into the source by `node scripts/generate-icons.mjs` (reads the dev-only `@iconify-json/solar` package), so nothing ships as a runtime dependency.

## Entry flow

The sign-up funnel (plans, create account, verify email, checkout, workspace setup) is hidden until it is ready. Set `SHOW_ENTRY_FLOW=true` to expose it.
