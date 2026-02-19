import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    submitLabel?: string;
    initialValue?: string;
    onCancel?: () => void;
    isReply?: boolean;
}

const CommentForm = ({
    onSubmit,
    placeholder = "Write a comment...",
    submitLabel = "Post Comment",
    initialValue = "",
    onCancel,
    isReply = false,
}: CommentFormProps) => {
    const [content, setContent] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await onSubmit(content);
            setContent('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] resize-none focus-visible:ring-primary"
                disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default CommentForm;
