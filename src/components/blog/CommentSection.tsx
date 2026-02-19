import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Loader2, Reply, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import CommentForm from './CommentForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
    id: string;
    post_id: number;
    user_id: string;
    parent_id: string | null;
    content: string;
    created_at: string;
    profiles: {
        full_name: string | null;
        avatar_url?: string | null;
    } | null;
}

interface CommentSectionProps {
    postId: number;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [replyTo, setReplyTo] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('blog_comments')
                .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast({
                title: 'Error',
                description: 'Failed to load comments.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (content: string, parentId: string | null = null) => {
        if (!user) {
            toast({
                title: 'Authentication required',
                description: 'Please log in to leave a comment.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('blog_comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content,
                    parent_id: parentId,
                })
                .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
                .single();

            if (error) throw error;

            setComments([...comments, data]);
            setReplyTo(null);
            toast({
                title: 'Comment posted!',
                description: 'Your comment has been added successfully.',
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to post comment.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const { error } = await supabase
                .from('blog_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            setComments(comments.filter(c => c.id !== commentId));
            toast({
                title: 'Comment deleted',
                description: 'The comment has been removed.',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete comment.',
                variant: 'destructive',
            });
        }
    };

    const renderComments = (parentId: string | null = null, depth = 0) => {
        const filteredComments = comments.filter(c => c.parent_id === parentId);

        if (filteredComments.length === 0 && depth === 0 && !loading) {
            return (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                </div>
            );
        }

        return (
            <div className={`space-y-6 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-muted pl-6' : ''}`}>
                {filteredComments.map(comment => (
                    <div key={comment.id} className="group transition-all duration-200">
                        <div className="flex gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-background">
                                <AvatarImage src={comment.profiles?.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {comment.profiles?.full_name ? comment.profiles.full_name.split(' ').map(n => n[0]).join('') : '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-sm">
                                            {comment.profiles?.full_name || 'Anonymous Travel Enthusiast'}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-3 flex items-center inline-flex gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(comment.created_at), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {user && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-xs gap-1"
                                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                            >
                                                <Reply className="h-3 w-3" />
                                                Reply
                                            </Button>
                                        )}
                                        {(user?.id === comment.user_id) && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1">
                                                        <Trash2 className="h-3 w-3" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your comment.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm leading-relaxed text-foreground/90 bg-muted/30 p-4 rounded-2xl rounded-tl-none border border-muted/50">
                                    {comment.content}
                                </div>

                                {replyTo === comment.id && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <CommentForm
                                            onSubmit={(content) => handleAddComment(content, comment.id)}
                                            placeholder={`Replying to ${comment.profiles?.full_name || 'comment'}...`}
                                            submitLabel="Post Reply"
                                            onCancel={() => setReplyTo(null)}
                                            isReply
                                        />
                                    </div>
                                )}

                                {renderComments(comment.id, depth + 1)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section id="comments" className="mt-16 space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Community Discussion
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({comments.length})
                        </span>
                    </h2>
                </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Leave a comment</h3>
                {user ? (
                    <CommentForm onSubmit={(content) => handleAddComment(content)} />
                ) : (
                    <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">
                        <p className="text-muted-foreground mb-4">Join the conversation! Log in to share your thoughts.</p>
                        <Button asChild>
                            <a href="/auth">Sign In to Comment</a>
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Loading discussion...</p>
                    </div>
                ) : (
                    renderComments()
                )}
            </div>
        </section>
    );
};

export default CommentSection;
