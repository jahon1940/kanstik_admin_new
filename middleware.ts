import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
    "/login",
    "/_next",
    "/favicon.ico",
    "/favicon.png",
    "/images",
    "/fonts",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
];

export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
	if (isPublic) return NextResponse.next();

	const token = req.cookies.get("device_token")?.value;
	if (!token) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("redirect", pathname);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/:path*"],
};


