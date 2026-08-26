"use client";

import { useState, type FormEvent } from "react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TransitionLink } from "@/components/motion/TransitionLink";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setSubmitting(false);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Email</span>
          <input name="email" type="email" required className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span>Password</span>
          <input name="password" type="password" required className="border border-brand-ink/15 px-3 py-2.5" />
        </label>
        {error && <p className="text-brand-red-dark text-sm">{error}</p>}
        <Button type="submit" size="lg" disabled={submitting} className="mt-2">
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-ink/10" />
        <span className="text-brand-muted text-xs uppercase">or</span>
        <div className="h-px flex-1 bg-brand-ink/10" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        Continue with Google
      </Button>

      <p className="text-brand-muted mt-8 text-center text-sm">
        New here?{" "}
        <TransitionLink href="/register" className="text-brand-red-dark underline">
          Create a parent account
        </TransitionLink>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageHeader eyebrow="Portal" title="Sign In" />
      <Container className="py-16 sm:py-24">
        <Suspense>
          <LoginForm />
        </Suspense>
      </Container>
    </>
  );
}
