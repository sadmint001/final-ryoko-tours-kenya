import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from './ImageUpload';

export interface GalleryItem {
  id: number;
  url: string;
  caption?: string | null;
  sort_order: number;
}

interface MultiImageUploadProps {
  destinationId: number;
  items: GalleryItem[];
  onItemsChange: (items: GalleryItem[]) => void;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ destinationId, items, onItemsChange }) => {
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState<string>('');
  const [newCaption, setNewCaption] = useState<string>('');
  const { toast } = useToast();

  const handleAddByUrl = async (urlArg?: string, captionArg?: string) => {
    const urlToUse = (urlArg ?? newUrl).trim();
    const captionToUse = captionArg ?? newCaption;
    if (!urlToUse) return;
    try {
      const nextOrder = items.length ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from('destination_media')
        .insert({
          destination_id: destinationId,
          url: urlToUse,
          caption: captionToUse || null,
          sort_order: nextOrder,
        })
        .select('*')
        .single();
      if (error) throw error;
      onItemsChange([...items, { id: data.id, url: data.url, caption: data.caption, sort_order: data.sort_order }]);
      setNewUrl('');
      setNewCaption('');
      setAdding(false);
      toast({ title: 'Added', description: 'Image added to gallery' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to add image', variant: 'destructive' });
    }
  };

  const handleAddFromUpload = async (url: string) => {
    await handleAddByUrl(url);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('destination_media').delete().eq('id', id);
      if (error) throw error;
      onItemsChange(items.filter(i => i.id !== id));
      toast({ title: 'Removed', description: 'Image removed from gallery' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to remove image', variant: 'destructive' });
    }
  };

  const move = async (id: number, direction: 'up' | 'down') => {
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];

    try {
      // Swap sort orders in DB
      const { error } = await supabase.rpc('swap_destination_media_order', {
        a_id: a.id,
        b_id: b.id,
      });
      if (error) throw error;
      // Swap locally
      const newItems = [...items];
      newItems[idx] = b;
      newItems[swapIdx] = a;
      onItemsChange(newItems);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to reorder', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Gallery Images</Label>
        <Button variant="outline" size="sm" onClick={() => setAdding(v => !v)}>
          {adding ? 'Cancel' : 'Add Image'}
        </Button>
      </div>

      {adding && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <ImageUpload
              value={newUrl}
              onChange={setNewUrl}
              onRemove={() => setNewUrl('')}
              folder="destinations/gallery"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <Input placeholder="Or paste image URL" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              </div>
              <div>
                <Input placeholder="Caption (optional)" value={newCaption} onChange={e => setNewCaption(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddByUrl} disabled={!newUrl}>Add to Gallery</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="text-sm truncate max-w-[60%]" title={item.caption || ''}>{item.caption || '—'}</div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => move(item.id, 'up')}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => move(item.id, 'down')}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MultiImageUpload;
