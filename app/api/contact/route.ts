import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
  try {
    const { userId, name, phone, email } = await req.json();

    await connectDB();

    await Contact.create({ userId, name, phone, email });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}