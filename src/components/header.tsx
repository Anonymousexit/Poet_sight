import { Feather } from 'lucide-react';

export default function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto flex items-center gap-3">
        <Feather className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground tracking-tight">VerseVision</h1>
      </div>
    </header>
  );
}
