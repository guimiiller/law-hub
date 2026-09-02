import NextAuth, { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("1 - authorize iniciou");

        if (!credentials?.email || !credentials?.password) {
          console.log("ERRO - credenciais não chegaram");
          return null;
        }

        try {
          console.log("2 - conectando MongoDB");

          await connectDB();

          console.log("3 - MongoDB conectado");
          console.log("4 - procurando usuário:", credentials.email);

          const user = await User.findOne({
            email: credentials.email,
          });

          console.log("5 - busca terminou");

          if (!user) {
            console.log("ERRO - usuário não encontrado");
            return null;
          }

          console.log("6 - usuário encontrado:", user.email);
          console.log("7 - comparando senha");

          const isValid = await compare(credentials.password, user.password);

          console.log("8 - senha válida:", isValid);

          if (!isValid) {
            console.log("ERRO - senha incorreta");
            return null;
          }

          console.log("9 - LOGIN OK");

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("ERRO NO AUTHORIZE:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // 🔥 AQUI ESTÁ A PARTE MAIS IMPORTANTE
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export async function auth() {
  return await getServerSession(authOptions);
}
