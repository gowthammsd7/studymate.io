import { Check } from "lucide-react";

const features = [
  {
    title: "AI Quiz Generator",
    desc: "Turn any text into multiple-choice questions with instant scoring.",
  },
  {
    title: "Smart Flashcards",
    desc: "Auto-create decks and review with spaced repetition flow.",
  },
  {
    title: "Study Planner",
    desc: "Organize tasks, estimate time, and focus with a Pomodoro timer.",
  },
  {
    title: "One-click Summaries",
    desc: "Extract key sentences and TL;DRs from your notes.",
  },
];

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything you need to study smarter
        </h2>
        <p className="mt-3 text-muted-foreground">
          Beautiful, fast, and built for deep work.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="glass">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-violet-600/10 text-violet-700">
                <Check className="size-4" />
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
