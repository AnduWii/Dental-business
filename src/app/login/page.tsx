import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const initialError =
    searchParams?.error === "auth"
      ? "That sign-in link was invalid or expired. Please try again."
      : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <AuthForm initialMode="signin" initialError={initialError} />
    </main>
  );
}
