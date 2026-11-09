import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function same(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let mismatch = a.length === b.length ? 0 : 1;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return mismatch === 0;
}

export function proxy(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !password) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice("Basic ".length));
    } catch {
      decoded = "";
    }
    const split = decoded.indexOf(":");
    const givenUser = split === -1 ? decoded : decoded.slice(0, split);
    const givenPassword = split === -1 ? "" : decoded.slice(split + 1);
    if (same(givenUser, user) && same(givenPassword, password)) return NextResponse.next();
  }

  return new NextResponse("Sign in to the Don't Panic board.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Don\'t Panic", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
