import Navbar from "@/components/shared/Navbar";


export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* মূল কন্টেন্ট এরিয়া */}
      <main className="flex-grow pt-20 overflow-hidden">
        {children}
      </main>
    </div>
  );
}