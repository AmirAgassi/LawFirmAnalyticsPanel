import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    console.log('Middleware executing for path:', req.nextUrl.pathname);
    console.log('Token present:', !!token);
    console.log('Token contents:', token);

    // if trying to access login page while authenticated
    if (req.nextUrl.pathname === "/login" && token) {
      console.log('Redirecting authenticated user from login to dashboard');
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // allow the request to proceed
    console.log('Allowing request to proceed');
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log('Authorization check, token present:', !!token);
        // more permissive - allow the middleware function to handle the logic
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// specify which routes to protect
export const config = {
  matcher: ['/dashboard', '/login']
}; 