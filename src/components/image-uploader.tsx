'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { UploadCloud, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (imageDataUri: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload an image file (PNG, JPG, etc.)."
        });
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        onImageUpload(e.target?.result as string);
    };
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Error Reading File",
            description: "Could not read the selected image file."
        });
    }
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card 
        className={`transition-all duration-300 border-dashed ${isDragging ? 'border-primary ring-2 ring-primary shadow-lg' : 'border-border'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create Poetry from a Photo</CardTitle>
          <CardDescription className="pt-1">Upload an image and let our AI craft a unique poem for you.</CardDescription>
        </CardHeader>
        <CardContent 
            className="flex flex-col items-center gap-6 p-8 cursor-pointer"
            onClick={handleBrowseClick}
        >
          <div className="w-full text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="font-semibold text-foreground">Drag &amp; drop an image here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              aria-label="Image upload input"
            />
          </div>
          <div className="flex items-center w-full">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <Button variant="secondary" size="lg" className="w-full max-w-xs" onClick={handleBrowseClick}>
            <Camera className="mr-2 h-5 w-5" />
            Upload Photo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
