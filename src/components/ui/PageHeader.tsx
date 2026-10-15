import type { ReactNode } from "react";
import Image from "next/image";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** Optional banner photo — pages that don't pass this keep the plain dark band. */
  backgroundImage?: string;
};

/** Compact title band used at the top of every interior (non-home) page — plain dark by default, or a photo banner when backgroundImage is given. */
export function PageHeader({ eyebrow, title, description, backgroundImage }: PageHeaderProps) {
  return (
    <section className="bg-brand-ink relative overflow-hidden pt-16 pb-14 sm:pt-24 sm:pb-20">
      {backgroundImage && (
        <>
          <Image src={backgroundImage} alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="from-brand-ink via-brand-ink/75 to-brand-ink/45 absolute inset-0 bg-gradient-to-t" />
        </>
      )}
      <Container className="relative">
        <p className="font-display text-brand-red-light mb-4 text-sm tracking-[0.3em]">{eyebrow}</p>
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
