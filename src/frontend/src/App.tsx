import { Toaster } from "@/components/ui/sonner";
import { BookOpen, History, Receipt, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import BillingPage from "./pages/BillingPage";
import HistoryPage from "./pages/HistoryPage";
import MenuPage from "./pages/MenuPage";

type Tab = "billing" | "menu" | "history";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "menu", label: "Menu", icon: BookOpen },
  { id: "history", label: "History", icon: History },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("billing");
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="no-print bg-primary text-primary-foreground shadow-warm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide leading-tight">
              FRIENDS DHABA
            </h1>
            <p className="text-primary-foreground/70 text-xs mt-0 font-body">
              Your Friendly Neighbourhood Dhaba
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav
          className="max-w-2xl mx-auto px-4 pb-0"
          aria-label="Main navigation"
        >
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-ocid={`nav.${tab.id}.tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-accent border-b-2 border-accent"
                      : "text-primary-foreground/70 hover:text-primary-foreground border-b-2 border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "billing" && <BillingPage />}
          {activeTab === "menu" && <MenuPage />}
          {activeTab === "history" && <HistoryPage />}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="no-print py-5 text-center text-xs text-muted-foreground border-t border-border">
        © {year}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster richColors position="top-center" />
    </div>
  );
}
