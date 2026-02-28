import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

    //better-auth uses this cookie name by default so keep that in mind
    const sessionToken = req.cookies.get('better-auth.session_token');

    const { pathname } = req.nextUrl;

    //if trying to access dashboard without session
    if (pathname.startsWith('/dashboard') && !sessionToken) {
        return NextResponse.redirect(new URL('/login', req.url));


    };

    //if already logged in and trying to hit login/register
    //redirect the user to dashboard.

    if ((pathname === '/login' || pathname === '/signin') && sessionToken) {

        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path', '/login', '/signin']
};

