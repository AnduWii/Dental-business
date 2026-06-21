import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError =
    error === "auth"
      ? "That sign-in link was invalid or expired. Please try again."
      : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <AuthForm initialMode="signin" initialError={initialError} />
    </main>
  );
}
