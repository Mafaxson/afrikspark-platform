import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { MessageCircle, Trash2 } from "lucide-react";
import { AnimateOnScroll } from "@/components/SectionComponents";

interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  comment: string;
  parent_id: string | null;
  created_at: string;
  user?: {
    display_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface BlogCommentsProps {
  blogId: string;
}

export function BlogComments({ blogId }: BlogCommentsProps) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("blog_id", blogId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each comment
      const commentsWithUsers = await Promise.all(
        data.map(async (comment: Comment) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", comment.user_id)
            .single();

          return {
            ...comment,
            user: userData || { display_name: "Anonymous", avatar_url: "" },
          };
        })
      );

      // Organize comments into threads
      const organized = organizeComments(commentsWithUsers);
      setComments(organized);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [blogId]);

  useEffect(() => {
    fetchComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`blog_comments:${blogId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_comments",
          filter: `blog_id=eq.${blogId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchComments]);

  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("blog_comments").insert({
        blog_id: blogId,
        user_id: user.id,
        comment: newComment.trim(),
        parent_id: replyTo,
      });

      if (error) throw error;

      setNewComment("");
      setReplyTo(null);
      toast.success("Comment posted successfully");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`${depth > 0 ? "ml-8 mt-4" : "mb-6"}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user?.avatar_url} />
          <AvatarFallback>{comment.user?.display_name?.[0] || "A"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">
                {comment.user?.display_name || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "MMM dd, yyyy")}
              </span>
            </div>
            <p className="text-sm">{comment.comment}</p>
          </div>
          <div className="flex gap-4 mt-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(comment.id)}
                className="h-auto p-0 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {(isAdmin || user?.id === comment.user_id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                className="h-auto p-0 text-xs text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AnimateOnScroll>
      <div className="mt-12 pt-12 border-t">
        <h2 className="text-2xl font-bold mb-6">
          Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h2>

        {/* Comment Form */}
        {user ? (
          <div className="mb-8">
            {replyTo && (
              <div className="mb-2 text-sm text-muted-foreground">
                Replying to comment...{" "}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="h-auto p-0 underline"
                >
                  Cancel
                </Button>
              </div>
            )}
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
              rows={4}
            />
            <Button onClick={handleSubmitComment} disabled={loading}>
              {loading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">
              Please{" "}
              <a href="/login" className="text-primary hover:underline">
                log in
              </a>{" "}
              to leave a comment
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
        </div>
      </div>
    </AnimateOnScroll>
  );
}
