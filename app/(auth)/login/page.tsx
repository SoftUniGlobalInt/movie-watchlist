import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import UserLogin from "@/src/components/UserLogin";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/profile");

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to your MovieList account</p>
      </div>
      <UserLogin />
    </div>
  );
}
