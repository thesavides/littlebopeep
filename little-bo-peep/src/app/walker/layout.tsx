import { Navigation } from '@/components/Navigation';

export default function WalkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <Navigation variant="walker" />
    </div>
  );
}
