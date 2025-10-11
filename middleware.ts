import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
    
    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/v1') ||
        pathname.includes('.') // files with extensions
    ) {
        return NextResponse.next();
    }
    
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
	if (isPublic) return NextResponse.next();

	const token = req.cookies.get("device_token")?.value;
	if (!token) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - v1 (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|v1|_next/static|_next/image|favicon.ico).*)',
	],
};


