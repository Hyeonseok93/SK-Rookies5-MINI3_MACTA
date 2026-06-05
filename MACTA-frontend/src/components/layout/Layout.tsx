import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
