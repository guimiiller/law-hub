import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Finance from "@/models/Finance";


export async function GET() {
  try {
    await connectDB();
    const finances = await Finance.find().sort({ createdAt: -1 });
    return NextResponse.json(finances);
  } catch (error) {
    console.error("Erro ao buscar finanças:", error);
    return NextResponse.json(
      { error: "Erro ao buscar registros financeiros" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const newFinance = await Finance.create(data);
    return NextResponse.json(newFinance, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar registro financeiro:", error);
    return NextResponse.json(
      { error: "Erro ao criar registro financeiro" },
      { status: 500 }
    );
  }
}
