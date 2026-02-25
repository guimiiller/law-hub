import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Client from "@/models/Client";


import { auth } from "@/lib/authOptions";

export async function GET() {
  await connectDB();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const clients = await Client.find({
    userId: session.user.id,
  }).sort({ createdAt: -1 });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  await connectDB();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();

  const client = await Client.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    notes: data.notes || "",
    userId: session.user.id, 
  });

  return NextResponse.json(client);
}