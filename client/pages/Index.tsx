import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import FeatureGrid from "@/components/site/FeatureGrid";
import ToolTabs from "@/components/site/ToolTabs";
import Footer from "@/components/site/Footer";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <ToolTabs />
        <section
          id="faq"
          className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass">
              <h3 className="text-lg font-bold">
                Is this using a real AI model?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                These tools run locally without external APIs. For production
                AI, connect your own provider on the server.
              </p>
            </div>
            <div className="glass">
              <h3 className="text-lg font-bold">Will my data be saved?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Planner tasks are stored in your browser. Other tools work on
                pasted text and keep everything on-device.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
