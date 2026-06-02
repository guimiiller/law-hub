import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Settings from "@/models/Settings";

export async function GET(req: Request) {
  await connectDB();

  const userId = "ID_DO_USER"; // depois pega da sessão

  let settings = await Settings.findOne({ userId });

  if (!settings) {
    settings = await Settings.create({ userId });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  await connectDB();

  const body = await req.json();
  const userId = "ID_DO_USER";

  const updated = await Settings.findOneAndUpdate({ userId }, body, {
    new: true,
    upsert: true,
  });

  return NextResponse.json(updated);
}
