import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = isAuthenticated();
  return NextResponse.json({
    success: true,
    authenticated,
  });
}
