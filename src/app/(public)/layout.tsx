import Navbar from "@/shared/components/navigation/Navbar";
import Footer from "@/shared/components/navigation/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
