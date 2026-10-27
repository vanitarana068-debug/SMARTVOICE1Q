// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Pre-bundle the libraries the pages use, so a dev-server restart (e.g. after editing .env)
    // doesn't re-bundle them mid-load and leave the browser with two copies of React.
    optimizeDeps: {
      include: [
        "@radix-ui/react-accordion",
        "@radix-ui/react-dialog",
        "@radix-ui/react-label",
        "@radix-ui/react-separator",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tooltip",
        "@supabase/supabase-js",
        "@tanstack/react-query",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "sonner",
        "tailwind-merge",
      ],
    },
  },
});
