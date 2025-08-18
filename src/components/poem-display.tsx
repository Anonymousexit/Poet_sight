'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Download, Share2, RefreshCw, PenLine, RotateCcw } from 'lucide-react';
import type { ImprovePoemInput } from '@/ai/flows/improve-poem';
import { improvePoem } from '@/ai/flows/improve-poem';
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from './ui/skeleton';

interface PoemDisplayProps {
  imageUrl: string;
  poem: string;
  onPoemChange: (newPoem: string) => void;
  onReset: () => void;
  isLoading: boolean;
  hasError: boolean;
}

export default function PoemDisplay({ imageUrl, poem, onPoemChange, onReset, isLoading, hasError }: PoemDisplayProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  const handleImprovePoem = async () => {
    if (!feedback.trim()) {
        toast({ title: "Feedback needed", description: "Please provide feedback to improve the poem."});
        return;
    }
    setIsImproving(true);
    try {
        const input: ImprovePoemInput = { poem, feedback };
        const result = await improvePoem(input);
        onPoemChange(result.improvedPoem);
        setFeedback('');
        toast({ title: "Poem Improved!", description: "The AI has revised your poem based on your feedback." });
    } catch (e) {
        const error = e instanceof Error ? e.message : "Failed to improve poem";
        toast({ variant: 'destructive', title: 'Error', description: error });
    } finally {
        setIsImproving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && poem) {
      try {
        await navigator.share({
          title: 'A Poem from VerseVision',
          text: poem,
        });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error Sharing', description: 'Could not share your poem.' });
      }
    } else if (poem) {
      await navigator.clipboard.writeText(poem);
      toast({ title: 'Poem Copied!', description: 'Your poem has been copied to the clipboard.' });
    }
  };

  const handleDownload = async () => {
    if (!poem) return;
    const blob = new Blob([poem], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'versevision-poem.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fade-in w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
            <Card className="overflow-hidden shadow-lg w-full aspect-square rounded-xl">
                <CardContent className="p-0">
                    <Image 
                        src={imageUrl} 
                        alt="Uploaded image for poem generation"
                        width={800} 
                        height={800} 
                        className="w-full h-full object-cover"
                        priority
                        data-ai-hint="artistic photo"
                    />
                </CardContent>
            </Card>

            <div className="flex flex-col gap-4 h-full w-full aspect-square">
                {isLoading ? (
                    <div className="space-y-3 h-full w-full p-4 border rounded-xl bg-background/50 flex flex-col justify-center">
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/5" />
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ) : hasError ? (
                  <div className="h-full w-full p-4 border rounded-xl bg-destructive/10 text-destructive-foreground flex flex-col items-center justify-center text-center">
                      <p className="font-semibold">Oops, something went wrong.</p>
                      <p className="text-sm">We couldn't generate a poem. Please try another image.</p>
                      <Button onClick={onReset} variant="destructive" className="mt-4"><RotateCcw className="mr-2 h-4 w-4"/>Try Again</Button>
                  </div>
                ) : (
                    <Textarea
                        value={poem}
                        onChange={(e) => onPoemChange(e.target.value)}
                        className="w-full h-full text-lg leading-relaxed bg-background/50 backdrop-blur-sm resize-none border-border focus:border-primary transition-all p-6 rounded-xl shadow-inner"
                        placeholder="Your poem appears here..."
                        aria-label="Generated Poem"
                    />
                )}
            </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleDownload} variant="secondary" disabled={isLoading || hasError}><Download className="mr-2 h-4 w-4" /> Save Poem</Button>
            <Button onClick={handleShare} variant="secondary" disabled={isLoading || hasError}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="secondary" disabled={isLoading || hasError}><PenLine className="mr-2 h-4 w-4" /> Improve</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="center">
                    <div className="grid gap-4">
                        <div className="space-y-1.5">
                            <h4 className="font-medium leading-none font-headline">Improve Poem</h4>
                            <p className="text-sm text-muted-foreground">
                                Tell the AI how to make your poem better.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="feedback" className="sr-only">Feedback</Label>
                            <Input id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="e.g., make it more romantic" disabled={isImproving} />
                        </div>
                        <Button onClick={handleImprovePoem} disabled={isImproving}>
                            {isImproving ? 'Improving...' : 'Submit Feedback'}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            <Button onClick={onReset} variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Start Over</Button>
        </div>
    </div>
  );
}
