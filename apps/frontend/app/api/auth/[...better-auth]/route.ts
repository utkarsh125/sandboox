import { auth } from "@/lib/auth"; // your betterAuth() instance
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
