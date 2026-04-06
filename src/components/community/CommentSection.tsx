import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommunityMemberRef {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

interface CommunityCommentRow {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: CommunityMemberRef;
}

export function CommentSection({
  postId,
  onAddComment,
}: {
  postId: string;
  onAddComment: (postId: string, comment: string) => Promise<void>;
}) {
  const [comments, setComments] = useState<CommunityCommentRow[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_comments")
      .select("*, community_members:user_id(name,avatar_url,role)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (!error) {
      const normalized = (data ?? []).map((row: CommunityCommentRow & { community_members?: CommunityMemberRef }) => ({
        ...row,
        user: row.community_members,
      }));
      setComments(normalized);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId, fetchComments]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full rounded-lg border border-slate-300 p-2"
          rows={3}
        />
        <Button
          onClick={async () => {
            if (!newComment.trim()) return;
            await onAddComment(postId, newComment.trim());
            setNewComment("");
            fetchComments();
          }}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Comment"}
        </Button>
      </div>

      <div className="space-y-2 max-h-72 overflow-auto">
        {comments.length === 0 && <p className="text-slate-500">No comments yet.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 rounded-lg border px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatar_url || "/placeholder-avatar.jpg"} />
              <AvatarFallback>{comment.user?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{comment.user?.name || "Unknown"}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-700">{comment.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
