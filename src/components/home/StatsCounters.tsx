import { Counter } from "@/components/motion/Counter";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Container } from "@/components/ui/Container";

const STATS = [
  { value: 2023, label: "Club founded", prefix: "", suffix: "" },
  { value: 2025, label: "SCL Champions — First Team", prefix: "", suffix: "" },
  { value: 5, label: "U18 players promoted to SCL", prefix: "", suffix: "" },
  { value: 18, label: "Age range we coach", prefix: "U6–U", suffix: "" },
] as const;

export function StatsCounters() {
  return (
    <section className="bg-brand-ink py-16 sm:py-20">
      <Container>
        <Stagger as="div" className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="text-center lg:text-left">
              <div className="font-display text-brand-white text-5xl sm:text-6xl">
                {stat.prefix ?? ""}
                <Counter value={stat.value} />
                {stat.suffix}
              </div>
              <p className="text-brand-white/60 mt-2 text-sm">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
