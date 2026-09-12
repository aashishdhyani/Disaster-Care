import { NextResponse } from "next/server";
import axios from "axios";
import * as nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import SOS from "@/models/SOS";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
  try {
    const { userId, lat, lng } = await req.json();

    if (!userId || !lat || !lng) {
      return NextResponse.json({ success: false, error: "Invalid data" });
    }

    await connectDB();

    await SOS.create({
      userId,
      lat,
      lng,
      time: new Date().toISOString(),
    });

    const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

    const contacts = await Contact.find({ userId });

    console.log("USER:", userId);
    console.log("CONTACTS:", contacts);

    if (!contacts.length) {
      return NextResponse.json({
        success: false,
        error: "No contacts found",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const smsPromises = contacts.map((c) =>
      axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "q",
          message: `🚨 SOS ALERT!\nLocation: ${locationLink}`,
          language: "english",
          numbers: c.phone,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY!,
          },
        }
      )
    );

    const emailPromises = contacts.map((c) =>
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: c.email,
        subject: "🚨 SOS Alert",
        text: `Emergency! Location: ${locationLink}`,
      })
    );

    await Promise.allSettled([...smsPromises, ...emailPromises]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SOS ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}