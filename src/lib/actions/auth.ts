"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { setSessionCookie, clearSessionCookie } from "@/src/lib/auth";

export type ActionState = {
  error?: string;
};

export async function registerUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Invalid email address." };
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashed = await bcrypt.hash(password, 10);
  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashed, role: "user" })
    .returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  await setSessionCookie({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  });

  redirect("/profile");
}

export async function loginUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/profile");
}

export async function logoutUser(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
