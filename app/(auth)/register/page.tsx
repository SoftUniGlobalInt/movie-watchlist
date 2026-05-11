import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import UserRegister from "@/src/components/UserRegister";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/profile");

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="mt-1 text-sm text-zinc-400">Start tracking movies today — it&apos;s free</p>
      </div>
      <UserRegister />
    </div>
  );
}
