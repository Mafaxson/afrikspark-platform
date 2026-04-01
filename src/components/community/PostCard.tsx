import { Heart, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url: string | null;
    likes_count: number;
    created_at: string;
    user?: { name: string; avatar_url: string | null; role: string };
  };
  onLike: () => void;
  onShowComments: () => void;
  liked: boolean;
  commentCount: number;
}

export function PostCard({ post, onLike, onShowComments, liked, commentCount }: PostCardProps) {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user?.avatar_url || "/placeholder-avatar.jpg"} />
          <AvatarFallback>{post.user?.name?.at(0) ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{post.user?.name || "Community Member"}</p>
          <p className="text-xs text-slate-500">{post.user?.role || "Member"}</p>
        </div>
        <time className="text-xs text-slate-500">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </time>
      </div>
      <p className="my-3 text-slate-700 whitespace-pre-wrap">{post.content}</p>
      {post.image_url && <img src={post.image_url} alt="Post media" className="mb-3 w-full rounded-lg object-cover max-h-80" />}
      <div className="mt-2 flex items-center justify-between gap-3">
        <button onClick={onLike} className={`flex items-center gap-1 text-sm ${liked ? "text-red-500" : "text-slate-500"}`}>
          <Heart className="h-4 w-4" />
          {post.likes_count}
        </button>
        <button onClick={onShowComments} className="flex items-center gap-1 text-sm text-slate-500">
          <MessageSquare className="h-4 w-4" />
          {commentCount} Comments
        </button>
      </div>
    </article>
  );
}
