import { connectDB } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Case from "@/models/Case";
import { auth } from "@/lib/authOptions";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const updated = await Case.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id, 
      },
      body,
      { new: true }
    ).populate("clientId");

    if (!updated) {
      return NextResponse.json(
        { error: "Processo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Erro ao atualizar processo:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar processo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const deleted = await Case.findOneAndDelete({
      _id: params.id,
      userId: session.user.id, 
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Processo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Process deleted with success",
    });
  } catch (error) {
    console.error("Error to delete process:", error);
    return NextResponse.json(
      { error: "Error to delete process" },
      { status: 500 }
    );
  }
}