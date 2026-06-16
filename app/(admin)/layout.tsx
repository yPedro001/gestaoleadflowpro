import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 260px)' }}>
        <Header />
        <main className="flex-1 p-6 pt-24 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
