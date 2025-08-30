import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ToolTabs() {
  const tabs = [
    { id: "quiz", label: "Quiz Generator" },
    { id: "flash", label: "Flashcards" },
    { id: "plan", label: "Study Planner" },
    { id: "summary", label: "Summarizer" },
    { id: "cloze", label: "Cloze Deletions" },
    { id: "outline", label: "Outliner" },
    { id: "simplify", label: "Simplifier" },
    { id: "socratic", label: "Socratic Tutor" },
  ] as const;
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("quiz");

  return (
    <section
      id="tools"
      className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Hands-on tools
        </h2>
        <p className="mt-3 text-muted-foreground">
          Paste notes or add tasks — everything runs locally.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              active === t.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {active === "quiz" && <QuizGenerator />}
        {active === "flash" && <FlashcardMaker />}
        {active === "plan" && <StudyPlanner />}
        {active === "summary" && <Summarizer />}
        {active === "cloze" && <ClozeMaker />}
        {active === "outline" && <Outliner />}
        {active === "simplify" && <Simplifier />}
        {active === "socratic" && <SocraticTutor />}
      </div>
    </section>
  );
}

function tokenize(text: string) {
  return text
    .replace(/[\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sentences(text: string) {
  return tokenize(text)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 0);
}

function words(text: string) {
  return tokenize(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, "")
    .split(/\s+/)
    .filter(Boolean);
}

const STOP = new Set([
  "the",
  "is",
  "in",
  "at",
  "of",
  "a",
  "and",
  "to",
  "for",
  "on",
  "with",
  "as",
  "that",
  "this",
  "it",
  "by",
  "an",
  "be",
  "or",
  "are",
  "from",
  "was",
  "were",
  "which",
  "but",
  "has",
  "had",
  "have",
  "not",
  "can",
  "its",
  "their",
  "his",
  "her",
  "they",
  "them",
  "we",
  "you",
  "your",
  "our",
]);

function keywordFreqMap(text: string) {
  const freq = new Map<string, number>();
  for (const w of words(text)) {
    if (STOP.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return freq;
}

function topKeywords(text: string, n = 20) {
  const freq = keywordFreqMap(text);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, n);
}

// ---------- Quiz Generator ----------
function QuizGenerator() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState<MCQ[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  type MCQ = { q: string; options: string[]; answer: number };

  function makeMCQs(input: string, n: number): MCQ[] {
    const sents = sentences(input);
    const freq = keywordFreqMap(input);

    const candidates = sents
      .map((s) => ({
        s,
        score: words(s).reduce((acc, w) => acc + (freq.get(w) || 0), 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n * 2)
      .map((x) => x.s);

    const topTerms = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w)
      .slice(0, 50);

    const res: MCQ[] = [];
    for (const s of candidates) {
      if (res.length >= n) break;
      const ws = words(s).filter((w) => !STOP.has(w));
      if (ws.length < 3) continue;
      const answerWord = ws[Math.floor(ws.length / 2)];
      const blanked = s.replace(
        new RegExp(`\\b${answerWord}\\b`, "i"),
        "_____",
      );
      const distractors = shuffle(
        topTerms.filter((w) => w !== answerWord),
      ).slice(0, 3);
      const options = shuffle([answerWord, ...distractors]).map((o) =>
        capitalize(o),
      );
      const answer = options.findIndex(
        (o) => o.toLowerCase() === answerWord.toLowerCase(),
      );
      res.push({ q: blanked, options, answer });
    }
    return res;
  }

  function generate() {
    const qs = makeMCQs(text, Math.max(1, Math.min(15, count)));
    setQuiz(qs);
    setAnswers(Array(qs.length).fill(-1));
    setScore(null);
  }

  function grade() {
    const s = quiz.reduce(
      (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
      0,
    );
    setScore(s);
  }

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Quiz Generator</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Questions</label>
            <input
              type="number"
              min={1}
              max={15}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value || "5"))}
              className="w-20 rounded-md border bg-background px-2 py-1"
            />
            <Button onClick={generate}>Generate</Button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes here..."
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {quiz.length > 0 && (
          <div className="mt-6 space-y-6">
            {quiz.map((q, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="font-medium">
                  {i + 1}. {q.q}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, j) => (
                    <label
                      key={j}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border p-2",
                        answers[i] === j
                          ? "border-violet-600 bg-violet-50"
                          : "hover:bg-accent",
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        checked={answers[i] === j}
                        onChange={() =>
                          setAnswers((a) =>
                            a.map((x, idx) => (idx === i ? j : x)),
                          )
                        }
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button onClick={grade}>Check answers</Button>
              {score !== null && (
                <div className="text-sm font-semibold">
                  Score: {score}/{quiz.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Tips
        title="Tips for better quizzes"
        items={[
          "Use 2–6 short paragraphs.",
          "Include key terms and definitions.",
          "Remove headings and lists for best results.",
        ]}
      />
    </>
  );
}

// ---------- Flashcards ----------
function FlashcardMaker() {
  const [text, setText] = useState("");
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  function buildCards(input: string) {
    const sents = sentences(input);
    const out: { front: string; back: string }[] = [];
    for (const s of sents) {
      const parts = s.split(/\s*[-:\u2014]\s*/);
      if (parts.length >= 2) {
        out.push({
          front: capitalize(parts[0]),
          back: parts.slice(1).join(" — "),
        });
      } else {
        const ws = words(s);
        if (ws.length > 6) {
          out.push({
            front: capitalize(ws.slice(0, 5).join(" ")) + "?",
            back: capitalize(ws.slice(5).join(" ")),
          });
        }
      }
      if (out.length >= 30) break;
    }
    return out;
  }

  function generate() {
    const deck = buildCards(text);
    setCards(deck);
    setI(0);
    setFlip(false);
  }

  const current = cards[i];

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Flashcards</h3>
          <Button onClick={generate}>Generate deck</Button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste definitions or notes (use '-' or ':' between term and definition for best results)"
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {current && (
          <div className="mt-6">
            <div
              onClick={() => setFlip((f) => !f)}
              className="aspect-[4/2.2] w-full cursor-pointer select-none rounded-xl border bg-gradient-to-br from-white to-violet-50 p-6 shadow-sm transition-all hover:shadow md:p-10 dark:from-slate-900 dark:to-violet-950/30"
            >
              <div className="flex h-full items-center justify-center text-center text-xl font-semibold sm:text-2xl">
                {flip ? current.back : current.front}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setI((x) => Math.max(0, x - 1))}
              >
                Prev
              </Button>
              <div className="text-sm text-muted-foreground">
                {i + 1} / {cards.length}
              </div>
              <Button
                onClick={() => setI((x) => Math.min(cards.length - 1, x + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      <Tips
        title="Better flashcards"
        items={[
          "Use 'Term - Definition' style lines.",
          "Keep terms short; details go on back.",
          "Aim for 10–20 cards per topic.",
        ]}
      />
    </>
  );
}

// ---------- Study Planner ----------
function StudyPlanner() {
  type Task = {
    id: string;
    title: string;
    minutes: number;
    due?: string;
    done?: boolean;
  };
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem("sm.tasks");
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [due, setDue] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("sm.tasks", JSON.stringify(tasks));
  }, [tasks]);

  function add() {
    if (!title.trim()) return;
    setTasks((t) => [
      {
        id: cryptoRandom(),
        title: title.trim(),
        minutes: Math.max(5, minutes),
        due: due || undefined,
      },
      ...t,
    ]);
    setTitle("");
  }

  function toggle(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function remove(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  return (
    <>
      <div className="glass">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Study Planner</h3>
          <Pomodoro defaultMinutes={minutes} />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="sm:col-span-2 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={5}
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value || "25"))}
            className="rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Minutes"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={add}>Add task</Button>
        </div>
        <ul className="mt-4 divide-y rounded-lg border">
          {tasks.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">
              No tasks yet. Add your first study task.
            </li>
          )}
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-3">
              <input
                type="checkbox"
                checked={!!t.done}
                onChange={() => toggle(t.id)}
              />
              <div className="flex-1">
                <div
                  className={cn(
                    "text-sm font-medium",
                    t.done && "line-through text-muted-foreground",
                  )}
                >
                  {t.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.minutes} min {t.due ? `• due ${t.due}` : ""}
                </div>
              </div>
              <Button variant="outline" onClick={() => remove(t.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Tips
        title="Planning advice"
        items={[
          "Break big topics into 25–50 min blocks.",
          "Add due dates to keep momentum.",
          "Mark done to track progress.",
        ]}
      />
    </>
  );
}

function Pomodoro({ defaultMinutes = 25 }: { defaultMinutes?: number }) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(defaultMinutes * 60);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(
        () => setSeconds((s) => Math.max(0, s - 1)),
        1000,
      );
    }
    return () => {
      if (ref.current) window.clearInterval(ref.current);
      ref.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  function format(s: number) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      <span className="font-mono">{format(seconds)}</span>
      <Button size="sm" onClick={() => setRunning((r) => !r)}>
        {running ? "Pause" : "Start"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setRunning(false);
          setSeconds(defaultMinutes * 60);
        }}
      >
        Reset
      </Button>
    </div>
  );
}

// ---------- Summarizer ----------
function Summarizer() {
  const [text, setText] = useState("");
  const [ratio, setRatio] = useState(0.35);
  const summary = useMemo(() => summarize(text, ratio), [text, ratio]);

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Notes Summarizer</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Length</label>
            <input
              type="range"
              min="0.15"
              max="0.7"
              step="0.05"
              value={ratio}
              onChange={(e) => setRatio(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste notes here to extract a concise summary."
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {summary && (
          <div className="mt-4 rounded-lg border bg-white/60 p-4 text-sm leading-relaxed dark:bg-white/10">
            {summary}
          </div>
        )}
      </div>
      <Tips
        title="Get sharper summaries"
        items={[
          "Remove redundant headings.",
          "Prefer paragraphs over bullet lists.",
          "Adjust the length slider as needed.",
        ]}
      />
    </>
  );
}

function summarize(input: string, ratio: number) {
  const sents = sentences(input);
  if (sents.length === 0) return "";
  const freq = keywordFreqMap(input);
  const scored = sents.map((s) => ({
    s,
    score: words(s).reduce((a, w) => a + (freq.get(w) || 0), 0),
  }));
  const keep = Math.max(1, Math.round(scored.length * ratio));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, keep)
    .sort((a, b) => sents.indexOf(a.s) - sents.indexOf(b.s))
    .map((x) => x.s)
    .join(" ");
}

// ---------- Cloze Deletions ----------
function ClozeMaker() {
  const [text, setText] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [cloze, setCloze] = useState<string>("");

  function generate() {
    const keys = topKeywords(text, 12);
    const marked = keys.reduce(
      (acc, k) =>
        acc.replace(new RegExp(`\\b${escapeReg(k)}\\b`, "gi"), "[[[___]]]"),
      text,
    );
    setHidden(keys);
    setCloze(marked.replace(/\[\[\[___\]\]\]/g, "_____"));
  }

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Cloze Deletions</h3>
          <Button onClick={generate}>Create cloze</Button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste notes; key terms will be blanked out."
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {cloze && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border bg-white/60 p-4 text-sm leading-relaxed dark:bg-white/10">
              {cloze}
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-semibold text-muted-foreground">
                Answers
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {hidden.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-full border bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700"
                  >
                    {capitalize(h)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Tips
        title="Improve cloze quality"
        items={[
          "Use clean paragraphs without lists.",
          "Include definitions and key terms.",
          "Aim for 2–3 short paragraphs.",
        ]}
      />
    </>
  );
}

// ---------- Outliner ----------
function Outliner() {
  const [text, setText] = useState("");
  const outline = useMemo(() => makeOutline(text), [text]);

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Outliner</h3>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste notes to generate a hierarchical outline."
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {outline.length > 0 && (
          <div className="mt-4 rounded-lg border p-4">
            <ul className="space-y-2">
              {outline.map((item, idx) => (
                <li key={idx}>
                  <div className="font-medium">{item.title}</div>
                  {item.points.length > 0 && (
                    <ul className="mt-1 ml-5 list-disc text-sm text-muted-foreground">
                      {item.points.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Tips
        title="Outlining tips"
        items={[
          "Group text by topic using blank lines.",
          "Keep headings short.",
          "Combine related sentences under a point.",
        ]}
      />
    </>
  );
}

function makeOutline(text: string) {
  const blocks = text
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  const freq = keywordFreqMap(text);
  return blocks.map((b) => {
    const sents = sentences(b);
    const title = sents[0] || b.slice(0, 60);
    const points = sents
      .slice(1)
      .sort((a, b) => scoreSent(b, freq) - scoreSent(a, freq))
      .slice(0, 4);
    return { title, points };
  });
}

function scoreSent(s: string, freq: Map<string, number>) {
  return words(s).reduce((a, w) => a + (freq.get(w) || 0), 0);
}

// ---------- Simplifier ----------
function Simplifier() {
  const [text, setText] = useState("");
  const simplified = useMemo(() => simplify(text), [text]);

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Simplifier</h3>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste complex text to rewrite in simpler language."
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {simplified && (
          <div className="mt-4 rounded-lg border bg-white/60 p-4 text-sm leading-relaxed dark:bg-white/10">
            {simplified}
          </div>
        )}
      </div>
      <Tips
        title="Better simplifications"
        items={[
          "Use full sentences.",
          "Avoid lists and tables.",
          "Short paragraphs work best.",
        ]}
      />
    </>
  );
}

const SIMPLE_SYNONYMS: Record<string, string> = {
  utilize: "use",
  commence: "start",
  terminate: "end",
  demonstrate: "show",
  approximately: "about",
  numerous: "many",
  consequently: "so",
  therefore: "so",
  however: "but",
  furthermore: "also",
  obtain: "get",
  prior: "before",
  subsequent: "after",
};

function simplify(text: string) {
  const sents = sentences(text);
  const out = sents.map((s) =>
    s
      .replace(/\([^\)]*\)/g, "")
      .replace(/,?\s?which\s/gi, " ")
      .replace(/,?\s?that\s/gi, " ")
      .split(/\s+/)
      .map((w) => {
        const lw = w.toLowerCase().replace(/[^a-z]/gi, "");
        return SIMPLE_SYNONYMS[lw] ? matchCase(SIMPLE_SYNONYMS[lw], w) : w;
      })
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );
  return out.join(" ");
}

function matchCase(replacement: string, original: string) {
  if (original[0] === original[0]?.toUpperCase())
    return capitalize(replacement);
  return replacement;
}

// ---------- Socratic Tutor ----------
function SocraticTutor() {
  const [text, setText] = useState("");
  const [qs, setQs] = useState<string[]>([]);

  function generate() {
    const sents = sentences(text);
    const keys = topKeywords(text, 8);
    const crafted: string[] = [];
    if (sents[0]) crafted.push(`What is the main idea of: "${sents[0]}"?`);
    for (const k of keys.slice(0, 5)) {
      crafted.push(`How would you define "${k}" in your own words?`);
      crafted.push(`Can you give a real-world example of ${k}?`);
    }
    if (sents.length > 1)
      crafted.push(`How does the last sentence relate to the first?`);
    setQs(crafted.slice(0, 10));
  }

  return (
    <>
      <div className="glass">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Socratic Tutor</h3>
          <Button onClick={generate}>Generate questions</Button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a passage to receive guiding questions."
          className="mt-4 h-40 w-full resize-y rounded-lg border bg-background p-3 text-sm"
        />
        {qs.length > 0 && (
          <ol className="mt-4 list-decimal space-y-2 rounded-lg border p-4 pl-6 text-sm">
            {qs.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        )}
      </div>
      <Tips
        title="Use the tutor effectively"
        items={[
          "Answer aloud or in writing.",
          "If stuck, break the question into parts.",
          "Re-read the text after answering.",
        ]}
      />
    </>
  );
}

// ---------- Shared UI ----------
function Tips({ title, items }: { title: string; items: string[] }) {
  return (
    <aside className="glass">
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </aside>
  );
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    return b[0].toString(16);
  }
  return Math.random().toString(16).slice(2);
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
