//user model (prisma + better-auth)
export type User = {
    id: string;
    name: string | null;
    email: string;
    emailVerified: string,
    image: string | null;
    createdAt: string; //ISO date string in API responses.
}

//session model
export type Session = {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string

}