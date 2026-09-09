import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { hasStoredSession } from "./data/auth";
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
  beforeLoad: () => {
    if (!hasStoredSession()) {
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

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
