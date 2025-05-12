// app/api/verify-mfa/route.ts
import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";



export async function POST(req: NextRequest) {
  const { email, token } = await req.json();
  await connectDB();
  console.log("finding user with email: ", email);
  const user = await User.findOne({ email });
  console.log("User found: ", user);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.mfaSecret) {
    return NextResponse.json({ error: "MFA not enabled" }, { status: 400 });
  }

  console.log("Verifying token: ", token);
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
  });
  console.log("Token verified: ", verified);
  if (!verified) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  user.mfaEnabled = true;
  await user.save();

  return NextResponse.json({ success: true }, { status: 200 });
}
