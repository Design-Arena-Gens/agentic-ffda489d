import { clearSessionCookie } from "@/lib/session";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const res = NextResponse.redirect(new URL('/', req.url));
  clearSessionCookie(res);
  return res;
};
