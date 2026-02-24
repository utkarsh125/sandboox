import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@sandboox/db";
import "server-only"; // what does this shit do? -> prevents this file from ever being bundled inthe frontend 

export const auth = betterAuth({

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,

    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }
    },

    //this allows the frontend at port 3000 to talk to this backend
    //so yeah in some ways it does bypass cors -> but only for this backend

    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ]
})