import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Deadline from "@/models/Deadline";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 
  try {
    await connectDB();
    const data = await req.json();

    if (!data.processId || data.processId === "") {
      delete data.processId;
    }

    const updatedDeadline = await Deadline.findByIdAndUpdate(id, data, { new: true });

    if (!updatedDeadline) {
      return NextResponse.json({ error: "Prazo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedDeadline);
  } catch (err) {
    console.error("Erro ao atualizar prazo:", err);
    return NextResponse.json({ error: "Erro ao atualizar prazo" }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const deleted = await Deadline.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Prazo não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ message: "Prazo removido com sucesso" });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao remover prazo" }, { status: 500 });
  }
}
