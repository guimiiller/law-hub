import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Finance from "@/models/Finance";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    const data = await req.json();
    const updated = await Finance.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    await Finance.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
