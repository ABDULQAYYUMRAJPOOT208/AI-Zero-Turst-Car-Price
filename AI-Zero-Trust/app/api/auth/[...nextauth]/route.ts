import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import speakeasy from "speakeasy";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("testZeroTrust");
const logsCollection = db.collection("authLogs");
interface ExtendedUser {
  id: string;
  email: string;
  role: string;
  token: string; // 🔐 Flask backend token
}

export const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "MFA Token", type: "text", optional: true },
      },
      async authorize(credentials: any) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          return null;
        }


        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        if (user.mfaEnabled && !credentials.token) {
          return null;
        }

        if (user.mfaEnabled) {
          const tokenValidates = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: "base32",
            token: credentials.token,
            window: 1,
          });
          if (!tokenValidates) {
            return null;
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  events: {
    async signIn({ user }) {
      await logsCollection.insertOne({
        event: "signIn",
        email: user.email,
        timestamp: new Date(),
      });
    },
    async signOut({ token }) {
      await logsCollection.insertOne({
        event: "signOut",
        email: token.email,
        timestamp: new Date(),
      });
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 30, // 30 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store user info
        token.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          token: '' // ✅ now valid
        } as ExtendedUser;
        
  
        // ✅ Get JWT token from Flask backend
        try {
          const response = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });
          const data = await response.json();
  
          if (response.ok && data.token) {
            (token.user as any).token = data.token;
            
          } else {
            console.error("Failed to get token from backend:", data);
          }
        } catch (err) {
          console.error("JWT callback error:", err);
        }
      }
  
      return token;
    },
  
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user as ExtendedUser;
      }
      return session;
    },
  
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/auth/verify-mfa")) {
        return `${baseUrl}/auth/verify-mfa`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  }
  
});

export { handler as GET, handler as POST };