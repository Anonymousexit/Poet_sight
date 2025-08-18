'use client';

import { useState } from 'react';
import type { GeneratePoemInput } from '@/ai/flows/generate-poem';
import { generatePoem } from '@/ai/flows/generate-poem';
import ImageUploader from '@/components/image-uploader';
import PoemDisplay from '@/components/poem-display';
import Header from '@/components/header';
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react';

type AppState = 'idle' | 'loading' | 'success' | 'error';

export default function VerseVisionPage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [imageData, setImageData] = useState<string | null>(null);
  const [poem, setPoem] = useState<string>('');
  const { toast } = useToast();

  const handleImageUpload = async (imageDataUri: string) => {
    setImageData(imageDataUri);
    setAppState('loading');
    setPoem('');
    try {
      const input: GeneratePoemInput = {
        imageDataUri,
        topic: '',
        style: '',
      };
      const result = await generatePoem(input);
      if (result.poem) {
        setPoem(result.poem);
        setAppState('success');
      } else {
        throw new Error('The AI was unable to generate a poem from this image.');
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'An unknown error occurred.';
      setAppState('error');
      toast({
        variant: "destructive",
        title: "Error Generating Poem",
        description: error,
      })
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setImageData(null);
    setPoem('');
  };
  
  const handlePoemChange = (newPoem: string) => {
    setPoem(newPoem);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        {appState === 'idle' && !imageData && (
          <div className="flex-grow flex items-center justify-center w-full animate-fade-in">
              <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        )}
        {appState !== 'idle' && imageData && (
          <PoemDisplay 
            imageUrl={imageData} 
            poem={poem}
            onPoemChange={handlePoemChange}
            onReset={handleReset}
            isLoading={appState === 'loading'}
            hasError={appState === 'error'}
          />
        )}
        {appState === 'loading' && !imageData && (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground font-headline">VerseVision is crafting your poem...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}
