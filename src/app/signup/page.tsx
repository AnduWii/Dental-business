import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <AuthForm initialMode="signup" />
    </main>
  );
}
