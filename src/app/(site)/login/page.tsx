"use client";

import { useState, type FormEvent } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MEDIA } from "@/content/media";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { mergeGuestCartIntoServer } from "@/lib/cart-merge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminMode, setAdminMode] = useState(false);
  const [password, setPassword] = useState("");
  const callbackUrl = adminMode ? "/admin" : searchParams.get("callbackUrl") || "/portal";

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "oauth" ? "Google sign-in didn't complete — please try again." : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Request OTP code (allows creating user if they don't exist yet)
  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const supabase = createSupabaseBrowser();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Allow automatic sign-up via OTP
      },
    });

    setSubmitting(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage(`A verification link/code has been sent to ${email}. Check your inbox!`);
    setStep("verify");
  }

  // Step 2: Verify the OTP token entered by the user
  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createSupabaseBrowser();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      setSubmitting(false);
      setError("Invalid or expired verification code.");
      return;
    }

    await mergeGuestCartIntoServer();
    router.push(callbackUrl);
    router.refresh();
  }

  // Admin: email + password (the seeded admin account), then straight to /admin
  async function handleAdminSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createSupabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setSubmitting(false);
      setError("Invalid admin email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createSupabaseBrowser();
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
      },
    });
    if (oauthError || !data.url) {
      setError("Couldn't start Google sign-in — please try again.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-sm">
      {error && <p className="text-brand-red-dark text-sm mb-4">{error}</p>}
      {message && <p className="text-brand-success-dark text-sm mb-4">{message}</p>}

      {adminMode ? (
        <form onSubmit={handleAdminSignIn} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Admin Email</span>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-brand-ink/15 px-3 py-2.5"
              placeholder="admin@example.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-brand-ink/15 px-3 py-2.5"
            />
          </label>
          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? "Signing in…" : "Sign In to Admin Panel"}
          </Button>
        </form>
      ) : (
        <>
      {step === "request" ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-brand-ink/15 px-3 py-2.5"
              placeholder="you@example.com"
            />
          </label>
          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? "Sending Code…" : "Send OTP Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Enter Verification Code / Token</span>
            <input
              name="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="border border-brand-ink/15 px-3 py-2.5 text-center text-lg font-mono tracking-wider"
              placeholder="Enter code from email"
            />
          </label>
          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? "Verifying…" : "Verify & Sign In"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("request")}
            className="text-brand-muted text-xs text-center underline mt-1"
          >
            Use a different email or resend code
          </button>
        </form>
      )}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-ink/10" />
        <span className="text-brand-muted text-xs uppercase">or</span>
        <div className="h-px flex-1 bg-brand-ink/10" />
      </div>

      <Button variant="secondary" size="lg" className="w-full" onClick={() => void handleGoogle()}>
        Continue with Google
      </Button>
        </>
      )}

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="mt-3 w-full"
        onClick={() => setAdminMode((v) => !v)}
      >
        {adminMode ? "Admin sign in: ON (opens admin panel)" : "Admin Sign In"}
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
      <PageHeader eyebrow="Portal" title="Sign In" backgroundImage={MEDIA.fivePlayerCelebration} />
      <Container className="py-16 sm:py-24">
        <Suspense>
          <LoginForm />
        </Suspense>
      </Container>
    </>
  );
}