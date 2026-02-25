import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Document from "@/models/Document";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/authOptions";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const doc = await Document.findOne({
      _id: params.id,
      userId: session.user.id, 
    })
      .populate("clientId")
      .populate("processId");

    if (!doc) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documento" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const form = await req.formData();

    const title = form.get("title") as string;
    const type = form.get("type") as string;
    const description = form.get("description") as string;
    const tags = form.get("tags")?.toString().split(",") ?? [];

    const rawClientId = form.get("clientId")?.toString();
    const clientId = rawClientId && rawClientId !== "" ? rawClientId : null;

    const rawProcessId = form.get("processId")?.toString();
    const processId = rawProcessId && rawProcessId !== "" ? rawProcessId : null;

    const file = form.get("file") as File | null;

    const updateData: any = {
      title,
      type,
      description,
      tags,
      clientId,
      processId,
    };

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = path.join(process.cwd(), "public", "uploads", file.name);
      await writeFile(filePath, buffer);

      updateData.fileUrl = `/uploads/${file.name}`;
    }

    const updated = await Document.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id, 
      },
      updateData,
      { new: true }
    )
      .populate("clientId")
      .populate("processId");

    if (!updated) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar documento" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const deleted = await Document.findOneAndDelete({
      _id: params.id,
      userId: session.user.id, 
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar documento" },
      { status: 500 }
    );
  }
}