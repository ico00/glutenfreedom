import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Korisničke credentials (u produkciji bi trebalo biti u bazi podataka)
// Za sada koristimo environment varijable
const users = [
  {
    id: "1",
    email: process.env.ADMIN_EMAIL || "admin@glutenfreedom.hr",
    password: process.env.ADMIN_PASSWORD_HASH || "", // Hash će se generirati
  },
];

// Funkcija za provjeru credentials
async function verifyCredentials(email: string, password: string) {
  // Ako nema postavljenog password hasha, koristimo jednostavnu provjeru
  // U produkciji OBAVEZNO koristiti bcrypt hash
  const user = users.find((u) => u.email === email);
  
  if (!user) {
    return null;
  }
  
  // Ako postoji hash u env varijabli, provjeri ga
  if (user.password && user.password.startsWith("$2")) {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }
  } else {
    // Fallback: ako nema hasha, provjeri direktno (samo za development!)
    // U produkciji OBAVEZNO koristiti hash
    if (password !== process.env.ADMIN_PASSWORD) {
      return null;
    }
  }
  
  return {
    id: user.id,
    email: user.email,
  };
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await verifyCredentials(email, password);
          
          if (user) {
            return user;
          }
        }
        
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dana
  },
  secret: process.env.AUTH_SECRET,
});

