"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatSenCompact } from "@/lib/money";
import { parseRinggitToSen } from "@/lib/money";
import { MEDIA } from "@/content/media";
import { lookupPlayer, createFeeBill, type PlayerPaymentSummary } from "./actions";

export default function PayPage() {
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState<PlayerPaymentSummary | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  const [amountMode, setAmountMode] = useState<"full" | "custom">("full");
  const [customAmount, setCustomAmount] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function runLookup(value: string) {
    setLookupError(null);
    setLooking(true);
    const result = await lookupPlayer(value);
    setLooking(false);

    if (!result.ok) {
      setLookupError(result.error);
      return;
    }
    setPlayer(result.player);
    setPayerEmail(result.player.guardianEmail);
  }

  // A logged-in parent's portal links here with ?query=<memberCode> — run
  // the lookup immediately instead of making them retype it.
  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get("query");
    if (prefill) {
      setQuery(prefill);
      runLookup(prefill);
    }
  }, []);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runLookup(query);
  }

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!player) return;
    setPayError(null);

    const amountSen =
      amountMode === "full" ? player.outstandingSen : parseRinggitToSen(customAmount);

    if (amountSen === null || amountSen < 1_000) {
      setPayError("Enter a valid amount of at least RM10.");
      return;
    }
    if (amountSen > player.outstandingSen) {
      setPayError(`Amount can't exceed the outstanding balance of ${formatSenCompact(player.outstandingSen)}.`);
      return;
    }

    setPaying(true);
    const result = await createFeeBill({ playerId: player.playerId, amountSen, payerName, payerEmail });
    setPaying(false);
    if (result && "error" in result) setPayError(result.error);
  }

  return (
    <>
      <PageHeader
        eyebrow="Fees"
        title="Pay Fees"
        description="Enter your player's member code or your registered email to get started."
        backgroundImage={MEDIA.footballPitch}
      />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg">
          {!player ? (
            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span>Member Code or Email</span>
                <input
                  name="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                  placeholder="SFA-2026-0042 or parent@email.com"
                  className="border border-brand-ink/15 px-3 py-2.5"
                />
              </label>
              {lookupError && <p className="text-brand-red-dark text-sm">{lookupError}</p>}
              <Button type="submit" size="lg" disabled={looking}>
                {looking ? "Searching…" : "Find Player"}
              </Button>
            </form>
          ) : (
            <div>
              <div className="border border-brand-ink/10 p-6">
                <p className="text-brand-muted text-xs tracking-wide uppercase">{player.memberCode}</p>
                <h2 className="font-display text-2xl">{player.name}</h2>
                <p className="text-brand-muted mt-1 text-sm">
                  {player.programme} &middot; {player.ageGroup}
                </p>
                <div className="mt-4 flex justify-between border-t border-brand-ink/10 pt-4 text-sm">
                  <span className="text-brand-muted">Outstanding Balance</span>
                  <span className="font-display text-brand-red text-lg">
                    {formatSenCompact(player.outstandingSen)}
                  </span>
                </div>
              </div>

              {player.outstandingSen <= 0 ? (
                <p className="text-brand-success-dark mt-6 text-center text-sm font-semibold">
                  This account is fully paid up — nothing due right now.
                </p>
              ) : (
                <form onSubmit={handlePay} className="mt-6 flex flex-col gap-4">
                  <div className="flex gap-3">
                    {(["full", "custom"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAmountMode(mode)}
                        className={`flex-1 border px-4 py-3 text-sm transition-colors ${
                          amountMode === mode ? "border-brand-ink bg-brand-ink text-brand-white" : "border-brand-ink/20"
                        }`}
                      >
                        {mode === "full" ? `Pay Full (${formatSenCompact(player.outstandingSen)})` : "Custom Amount"}
                      </button>
                    ))}
                  </div>

                  {amountMode === "custom" && (
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span>Amount (RM, min 10)</span>
                      <input
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="100"
                        className="border border-brand-ink/15 px-3 py-2.5"
                      />
                    </label>
                  )}

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span>Your Name</span>
                    <input
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      required
                      className="border border-brand-ink/15 px-3 py-2.5"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span>Your Email</span>
                    <input
                      type="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      required
                      className="border border-brand-ink/15 px-3 py-2.5"
                    />
                  </label>

                  {payError && <p className="text-brand-red-dark text-sm">{payError}</p>}

                  <Button type="submit" size="lg" disabled={paying} className="mt-2">
                    {paying ? "Redirecting to Billplz…" : "Pay with Billplz"}
                  </Button>
                  <button type="button" onClick={() => setPlayer(null)} className="text-brand-muted text-sm underline">
                    Search a different player
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
