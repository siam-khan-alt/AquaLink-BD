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

    // password login with email or phone
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        phone: { label: "ফোন নাম্বার", type: "text" },
        email: { label: "ইমেইল", type: "text" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          throw new Error("পাসওয়ার্ড প্রয়োজন");
        }

        if (!credentials?.phone && !credentials?.email) {
          throw new Error("ফোন বা ইমেইল প্রয়োজন");
        }

        await connectDB();

        // Build query conditions
        const queryConditions: { $or: { phone?: string; email?: string }[] } = {
          $or: [],
        };

        if (credentials.phone) {
          queryConditions.$or.push({ phone: credentials.phone });
        }
        if (credentials.email) {
          queryConditions.$or.push({ email: credentials.email });
        }

        // Find user by phone or email
        const user =
          queryConditions.$or.length > 0
            ? await User.findOne(queryConditions).select("+password")
            : null;

        if (!user || !user.password) {
          throw new Error("এই তথ্যে কোনো অ্যাকাউন্ট পাওয়া যায়নি");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
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
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        if (!user.email)
          throw new Error("গুগল অ্যাকাউন্ট থেকে ইমেইল পাওয়া যায়নি");
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
        session.user.role = token.role as "farmer" | "admin" | "doctor";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url;
      if (url) return url;
      return baseUrl;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
