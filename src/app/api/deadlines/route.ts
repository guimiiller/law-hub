import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Deadline from "@/models/Deadline";
import { auth } from "@/lib/authOptions";



export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const deadlines = await Deadline.find({
    userId: session.user.id,
  }).sort({ date: 1 });

  return NextResponse.json(deadlines);
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.processId || data.processId === "") {
      delete data.processId;
    }

    const deadline = new Deadline({
      ...data,
      userId: session.user.id,
    });

    await deadline.save();

    return NextResponse.json(deadline);
  } catch (err) {
    console.error("Erro ao criar prazo:", err);
    return NextResponse.json({ error: "Erro ao criar prazo" }, { status: 500 });
  }
}