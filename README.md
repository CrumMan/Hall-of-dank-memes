# Meme Hall of Fame

## What it is

**Meme Hall of Fame** is a small single-page web app for submitting memes, voting/ranking them, and showcasing a "top three" podium plus a full gallery. It's built with:

- **React 19** + **TypeScript**
- **Vite** for the dev server and build
- **Tailwind CSS** for styling
- **TanStack Router** for client-side routing (routes for login, the hall-of-fame gallery, adding a meme, and viewing a single meme's detail page)
- **dnd-kit** for drag-and-drop (reordering/sorting memes)
- **idb-keyval** (IndexedDB) for local, in-browser persistence — no backend server
- **oxlint** for linting

Key pieces in `src/`: a gallery and podium view (`Gallery.tsx`, `TopThreePodium.tsx`, `HallOfFameBanner.tsx`, `TrophyBadge.tsx`), a form and pending-submissions queue for adding new memes (`AddMemeForm.tsx`, `PendingSubmissions.tsx`), a sortable grid (`SortableMemeGrid.tsx`), and simple local auth/theme context providers (`AuthContext.tsx`, `ThemeContext.tsx`).

## How it came to be

This project was built at a hands-on workshop at **KCDC 2026**, where the goal was to learn how to build a website from scratch **using only Claude** — no hand-written boilerplate, no copy-pasting from other tutorials, just prompting Claude (via Claude Code) to scaffold, build, and iterate on a real app. The `PROMPTS.md` file in this repo tracks the prompts used along the way, and `NOTE.md` holds running notes jotted down during the session.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build
npm run lint       # run oxlint
```
