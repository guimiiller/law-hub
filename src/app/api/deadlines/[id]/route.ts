import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Deadline from "@/models/Deadline";
import { auth } from "@/lib/authOptions";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params; // ✅ padrão correto

    const data = await req.json();

    if (!data.processId || data.processId === "") {
      delete data.processId;
    }

    const updated = await Deadline.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id,
      },
      data,
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Prazo não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar prazo:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar prazo" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params; // ✅ padrão correto

    const deleted = await Deadline.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Prazo não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Prazo removido com sucesso",
    });
  } catch (err) {
    console.error("Erro ao remover prazo:", err); // ✅ faltava log
    return NextResponse.json(
      { error: "Erro ao remover prazo" },
      { status: 500 },
    );
  }
}
