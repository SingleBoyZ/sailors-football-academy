import type { ReactNode } from "react";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
};

/** Compact dark title band used at the top of every interior (non-home) page. */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="bg-brand-ink pt-16 pb-14 sm:pt-24 sm:pb-20">
      <Container>
        <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red">{eyebrow}</p>
        <SplitText
          as="h1"
          text={title}
          triggerOnMount
          className="font-display text-brand-white text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.92]"
        />
        {description && (
          <Reveal delay={0.3}>
            <p className="text-brand-white/70 mt-6 max-w-xl text-base sm:text-lg">{description}</p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
