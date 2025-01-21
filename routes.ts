/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/auth/login"];

/**
 * An array of routes that are accessible to the protected
 * After Log in, we can go to these routes
 * @type {string[]}
 */

export const protectRoutes = ["chat/:id", "chat/"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
  "/auth/new-verification",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication puposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after loggin in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/chat";
