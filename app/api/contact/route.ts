import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
  try {
    const { userId, name, phone, email } = await req.json();

    if (!userId || !name || !phone || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const contact = await Contact.create({ userId, name, phone, email });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error("CONTACT CREATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save contact" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    await connectDB();

    const contacts = await Contact.find({ userId }).sort({ _id: -1 });

    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error("CONTACT FETCH ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load contacts" },
      { status: 500 }
    );
  }
}