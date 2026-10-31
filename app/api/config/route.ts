import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || process.env.MP_PUBLIC_KEY || "";

  return NextResponse.json({
    success: true,
    publicKey: publicKey.trim(),
  });
}
