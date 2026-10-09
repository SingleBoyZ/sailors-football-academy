import { useCallback, useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { LeadForm } from "./components/LeadForm";
import { ResourceHighlights } from "./components/ResourceHighlights";
import { SuccessScreen } from "./components/SuccessScreen";
import { generateLeadPDF } from "./lib/generateLeadPDF";
import type { LeadFormData, SubmissionStatus } from "./types/lead";

const SIMULATED_NETWORK_DELAY_MS = 900;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [submittedName, setSubmittedName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const scrollToForm = useCallback(() => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSubmit = useCallback(async (data: LeadFormData) => {
    setSubmitError(null);
    setStatus("submitting");

    try {
      // Simulates the round-trip a real submission would take.
      // TODO: Send lead data to backend / Google Sheets integration (Phase 2).
      // TODO: Once a backend exists, also push `data` to a CRM export pipeline
      // (CSV/Excel) — LeadFormData is already structured flat enough for that.
      await wait(SIMULATED_NETWORK_DELAY_MS);

      await generateLeadPDF(data);

      setSubmittedName(data.fullName);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to generate lead submission PDF:", error);
      setSubmitError(
        "We couldn't generate your resources PDF. Please try submitting again.",
      );
      setStatus("idle");
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setSubmittedName("");
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onGetStarted={scrollToForm} />

      <main className="flex-1">
        {status === "success" ? (
          <SuccessScreen fullName={submittedName} onReset={handleReset} />
        ) : (
          <>
            <Hero onGetAccess={scrollToForm} />
            <ResourceHighlights />
            <LeadForm status={status} submitError={submitError} onSubmit={handleSubmit} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
