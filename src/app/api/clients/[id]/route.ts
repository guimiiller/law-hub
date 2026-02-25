import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Client from "@/models/Client";

import { auth } from "@/lib/authOptions";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();

  const updatedClient = await Client.findOneAndUpdate(
    {
      _id: params.id,
      userId: session.user.id, 
    },
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
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const deleted = await Client.findOneAndDelete({
    _id: params.id,
    userId: session.user.id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ message: "Cliente removido com sucesso" });
}