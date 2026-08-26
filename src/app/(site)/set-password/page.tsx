"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { setPassword } from "./actions";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    if (!email || !token) {
      setError("This link is missing information — please use the link from your email.");
      return;
    }

    setSubmitting(true);
    const result = await setPassword({ email, token, password });
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (signInResult?.error) {
      router.push("/login");
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      <p className="text-brand-muted text-sm">Setting a password for {email || "your account"}.</p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span>New Password</span>
        <input name="password" type="password" minLength={8} required className="border border-brand-ink/15 px-3 py-2.5" />
      </label>
      {error && <p className="text-brand-red-dark text-sm">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting} className="mt-2">
        {submitting ? "Setting password…" : "Set Password & Sign In"}
      </Button>
    </form>
  );
}

export default function SetPasswordPage() {
  return (
    <>
      <PageHeader eyebrow="Portal" title="Set Your Password" />
      <Container className="py-16 sm:py-24">
        <Suspense>
          <SetPasswordForm />
        </Suspense>
      </Container>
    </>
  );
}
