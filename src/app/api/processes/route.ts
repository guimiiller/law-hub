import { connectDB } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import Case from "@/models/Case";

export async function GET() {
  try {
    await connectDB();
    const cases = await Case.find().populate("clientId"); // <--- AQUI
    return NextResponse.json(cases, { status: 200 });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const data = await req.json();
    const created = await Case.create(data);

    const populated = await created.populate("clientId");

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Error to create case:", error);
    return NextResponse.json({ error: "Error to create case" }, { status: 500 });
  }
}
