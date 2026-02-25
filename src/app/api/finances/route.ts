import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Finance from "@/models/Finance";
import { auth } from "@/lib/authOptions";

export async function GET() {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const finances = await Finance.find({
      userId: session.user.id, 
    }).sort({ createdAt: -1 });

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

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();

    const newFinance = await Finance.create({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json(newFinance, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar registro financeiro:", error);
    return NextResponse.json(
      { error: "Erro ao criar registro financeiro" },
      { status: 500 }
    );
  }
}