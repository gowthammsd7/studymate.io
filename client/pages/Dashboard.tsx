import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">This is a placeholder. Ask to fill this page with progress tracking, saved decks, and analytics.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
