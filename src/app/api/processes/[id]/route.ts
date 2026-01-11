import { connectDB } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Case from "@/models/Case";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const body = await req.json();

    const updated = await Case.findByIdAndUpdate(params.id, body, { new: true })
      .populate("clientId");

    if (!updated) {
      return NextResponse.json({ error: "Processo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar processo:", err);
    return NextResponse.json({ error: "Erro ao atualizar processo" }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await Case.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Process deleted with success" });
  } catch (error) {
    console.error("Error to delete process:", error);
    return NextResponse.json({ error: "Error to delete process" }, { status: 500 });
  }
}
