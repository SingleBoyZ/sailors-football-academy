"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MEDIA } from "@/content/media";
import { mergeGuestCartIntoServer } from "@/lib/cart-merge";
import { registerParent } from "./actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const input = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const result = await registerParent(input);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (!result.confirmed) {
      // Email confirmation is enabled on the project — the account exists,
      // the user just needs to click the Supabase confirmation email first.
      setAwaitingConfirmation(true);
      setSubmitting(false);
      return;
    }

    await mergeGuestCartIntoServer();
    router.push("/portal");
    router.refresh();
  }

  if (awaitingConfirmation) {
    return (
      <>
        <PageHeader eyebrow="Portal" title="Check Your Inbox" backgroundImage={MEDIA.pathway2} />
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-sm text-center">
            <p className="text-brand-muted text-sm">
              Your account is created. We&apos;ve sent a confirmation link to your email address — click it,
              then sign in here.
            </p>
            <Button href="/login" className="mt-8">
              Go to Sign In
            </Button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Portal" title="Create a Parent Account" backgroundImage={MEDIA.pathway2} />
      <Container className="py-16 sm:py-24">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Full Name</span>
            <input name="name" required className="border border-brand-ink/15 px-3 py-2.5" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Email</span>
            <input name="email" type="email" required className="border border-brand-ink/15 px-3 py-2.5" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Phone</span>
            <input name="phone" placeholder="012-3456789" required className="border border-brand-ink/15 px-3 py-2.5" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Password</span>
            <input name="password" type="password" required minLength={8} className="border border-brand-ink/15 px-3 py-2.5" />
          </label>
          {error && <p className="text-brand-red-dark text-sm">{error}</p>}
          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>
        <p className="text-brand-muted mt-8 text-center text-sm">
          Already have an account?{" "}
          <TransitionLink href="/login" className="text-brand-red-dark underline">
            Sign in
          </TransitionLink>
        </p>
      </Container>
    </>
  );
}
