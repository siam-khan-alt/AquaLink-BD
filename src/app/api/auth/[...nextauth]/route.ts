import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/shared/lib/db";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // password login
    CredentialsProvider({
      id: "credentials",
      name: "Phone",
      credentials: {
        phone: { label: "ফোন নাম্বার", type: "text" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("ফোন এবং পাসওয়ার্ড দুটোই দিন");
        }
        await connectDB();
        const user = await User.findOne({ phone: credentials.phone }).select("+password");
        if (!user || !user.password) {
          throw new Error("এই নাম্বারে কোনো অ্যাকাউন্ট পাওয়া যায়নি");
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("পাসওয়ার্ড সঠিক নয়");
        }
        return {
          id: user._id.toString(),
          name: user.name ?? "অজানা চাষি",
          email: user.email ?? "",
          role: user.role,
        };
      },
    }),

    // otp login
    CredentialsProvider({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        phone: { label: "ফোন নাম্বার", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          throw new Error("ফোন নাম্বার প্রয়োজন");
        }
        await connectDB();
        const user = await User.findOne({ phone: credentials.phone });

        if (!user) {
          throw new Error("এই নাম্বারে কোনো অ্যাকাউন্ট নেই, আগে রেজিস্ট্রেশন করুন");
        }

        return {
          id: user._id.toString(),
          name: user.name ?? "অজানা চাষি",
          email: user.email ?? "",
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        if (!user.email) throw new Error("গুগল অ্যাকাউন্ট থেকে ইমেইল পাওয়া যায়নি");
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name ?? user.email.split("@")[0],
            email: user.email,
            image: user.image ?? "",
            role: "farmer",
            isVerified: true,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "farmer" | "expert" | "business" | "admin";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };