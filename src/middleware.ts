import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth((req: NextRequest) => {
  // Return NextResponse.next() to continue the request
  return NextResponse.next();
}, {
  callbacks: {
    authorized: ({ token }: { token: string | null }) => {
      // Return true if there's a token (user is authenticated)
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/auth/:path*"
  ]
}; 