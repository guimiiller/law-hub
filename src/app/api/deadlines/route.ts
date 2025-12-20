import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Deadline from "@/models/Deadline";


export async function GET() {
  await connectDB();
  const deadlines = await Deadline.find().sort({ date: 1 }); 
  return NextResponse.json(deadlines);
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    
    if (!data.processId || data.processId === "") {
      delete data.processId;
    }

    const deadline = new Deadline(data);
    await deadline.save();

    return NextResponse.json(deadline);
  } catch (err) {
    console.error("Erro ao criar prazo:", err);
    return NextResponse.json({ error: "Erro ao criar prazo" }, { status: 500 });
  }
}