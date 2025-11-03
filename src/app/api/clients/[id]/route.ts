import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Client from "@/models/Client";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const data = await req.json();

    const updatedClient = await Client.findByIdAndUpdate(
      params.id,
      {
        $set: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          notes: data.notes || "", 
        },
      },
      { new: true }
    );

    if (!updatedClient) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedClient);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const deleted = await Client.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ message: "Cliente removido com sucesso" });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao remover cliente" }, { status: 500 });
  }
}
