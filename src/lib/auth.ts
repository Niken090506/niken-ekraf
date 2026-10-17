import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { adapter } from "./db";

const AUTH_SECRET =
	process.env.BETTER_AUTH_SECRET ||
	"55f312d3505d2b458909338127a8d56d4d6b2add4bced4b919600e04805a3dc6";

export const auth = betterAuth({
	database: adapter,
	secret: AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 15,
		},
	},
	plugins: [tanstackStartCookies()],
});

export default auth;
