import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, officeName, email, phone, password } = await req.json();

    await connectDB();

    const userExists = await User.findOne({ email });
    if (userExists)
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      officeName,
      email,
      phone,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    );
  }
}