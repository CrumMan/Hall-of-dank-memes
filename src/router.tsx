import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { supabase } from "./lib/supabaseClient";
import { RootLayout } from "./routes/RootLayout";
import { HallOfFameRoute } from "./routes/HallOfFameRoute";
import { AddMemeRoute } from "./routes/AddMemeRoute";
import { MemeDetailRoute } from "./routes/MemeDetailRoute";
import { LoginRoute } from "./routes/LoginRoute";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const hallOfFameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HallOfFameRoute,
});

const addMemeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add",
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AddMemeRoute,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginRoute,
});

const memeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meme/$id",
  component: () => {
    const { id } = memeDetailRoute.useParams();
    return <MemeDetailRoute id={id} />;
  },
});

const routeTree = rootRoute.addChildren([hallOfFameRoute, addMemeRoute, loginRoute, memeDetailRoute]);

// import.meta.env.BASE_URL always matches whatever `base` vite.config.ts
// built with, so this stays correct on both GitHub Pages (subpath) and
// Render (domain root) without hardcoding either one here.
export const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
