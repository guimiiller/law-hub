import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Document from "@/models/Document";
import { writeFile } from "fs/promises";
import path from "path";


export async function GET() {
  try {
    await connectDB();
    const docs = await Document.find()
      .populate("clientId")
      .populate("processId")
      .sort({ createdAt: -1 });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documentos" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    await connectDB();

    const form = await req.formData();


    const file = form.get("file") as File | null;
    let fileUrl = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = path.join(process.cwd(), "public", "uploads", file.name);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/${file.name}`;
    }

 
    const title = form.get("title") as string;
    const type = form.get("type") as string;
    const description = form.get("description") as string;
    const tags = form.get("tags")?.toString().split(",") ?? [];

    const rawClientId = form.get("clientId")?.toString();
    const clientId = rawClientId && rawClientId !== "" ? rawClientId : null;

    const rawProcessId = form.get("processId")?.toString();
    const processId = rawProcessId && rawProcessId !== "" ? rawProcessId : null;

    const newDoc = await Document.create({
      title,
      type,
      description,
      tags,
      clientId,
      processId,
      fileUrl,
    });


    const populated = await Document.findById(newDoc._id)
      .populate("clientId")
      .populate("processId");

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    return NextResponse.json(
      { error: "Erro ao criar documento" },
      { status: 500 }
    );
  }
}
