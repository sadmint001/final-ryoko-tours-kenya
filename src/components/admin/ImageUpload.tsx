import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  bucket?: string; // Supabase storage bucket name
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  folder = 'destinations',
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  bucket = 'destination-images'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSize}MB`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: 'Upload Error',
          description: validationError,
          variant: 'destructive',
        });
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemove = async () => {
    if (value && onRemove) {
      try {
        // Determine if this is a Supabase public URL for our bucket
        // Examples:
        // https://<project>.supabase.co/storage/v1/object/public/destination-images/destinations/abc.png
        // We only attempt storage deletion if URL matches our bucket path.
        let didDeleteFromStorage = false;
        try {
          const parsed = new URL(value, window.location.origin);
          const pathname = parsed.pathname; // includes leading '/'
          const marker = `/storage/v1/object/public/${bucket}/`;
          if (pathname.includes(marker)) {
            const filePath = pathname.substring(pathname.indexOf(marker) + marker.length);
            if (filePath) {
              const { data, error } = await supabase.storage
                .from(bucket)
                .remove([filePath]);
              if (error) throw error;
              didDeleteFromStorage = true;
            }
          }
        } catch (parseErr) {
          // Non-URL or relative paths (e.g., '/lovable-uploads/...') — ignore storage deletion
        }

        // Always clear the value in the form/UI
        onRemove();

        toast({
          title: 'Success',
          description: didDeleteFromStorage ? 'Image removed successfully' : 'Image reference cleared',
        });
      } catch (error) {
        console.error('Remove error:', error);
        toast({
          title: 'Error',
          description: (error as any)?.message ? `Failed to remove image: ${(error as any).message}` : 'Failed to remove image',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Image Upload</Label>
      
      {value ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={value}
                alt="Uploaded image"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Click the X button to remove this image
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop your image here, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports: JPG, PNG, WebP (max {maxSize}MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Manual URL input as fallback */}
      <div className="space-y-2">
        <Label htmlFor="manual-url" className="text-sm">Or enter image URL manually:</Label>
        <Input
          id="manual-url"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
