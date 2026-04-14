import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard", "/my-resume/:resumeId/edit"]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
  unstable_allowDynamic: [
    "**/node_modules/@clerk/shared/dist/**",
    "**/node_modules/@clerk/nextjs/dist/**",
    "**/node_modules/@clerk/clerk-react/dist/**",
  ],
};
