import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Client from "@/models/Client";


export async function GET() {
  await connectDB();

  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  await connectDB();

  try {
    const data = await req.json();


    const clientData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes || "", 
      userId: data.userId, 
    };

    const client = await Client.create(clientData);
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
