import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-10 top-[-20%] h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute right-0 top-[-10%] h-[400px] w-[400px] rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm dark:bg-white/10">Your AI study copilot</span>
          <h1 className="mt-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl md:text-6xl dark:from-white dark:to-slate-300">
            Master any subject with StudyMate.AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Generate quizzes from your notes, create flashcards, plan focused sessions, and get instant summaries — all in one beautiful, fast app.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="#tools" className="btn-gradient">Try the tools</a>
            <Button variant="outline" asChild>
              <a href="#features">Explore features</a>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left sm:grid-cols-4">
            {[
              { k: "Quizzes", v: "from any notes" },
              { k: "Flashcards", v: "auto generated" },
              { k: "Planner", v: "with Pomodoro" },
              { k: "Summaries", v: "key points" },
            ].map((s) => (
              <div key={s.k} className="glass">
                <div className="text-xs font-semibold text-muted-foreground">{s.k}</div>
                <div className="mt-1 text-sm font-bold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
