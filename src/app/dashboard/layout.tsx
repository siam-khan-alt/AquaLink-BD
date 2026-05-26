import Header from "@/shared/components/navigation/Header";
import Sidebar from "@/shared/components/navigation/Sidebar";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[var(--background)] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
}