import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-grid size-8 place-items-center rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-lg">
            AI
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            StudyMate<span className="text-violet-600">.AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#tools"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Tools
          </a>
          <a
            href="#faq"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            FAQ
          </a>
          <NavLink
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#tools" className="hidden sm:block">
            <span className="btn-gradient">Get started</span>
          </a>
          <Button asChild variant="outline" className="md:hidden">
            <a href="#tools">Start</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
