import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}

interface PostRow {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
}

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export default function AdminCommunityDashboard() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCommunityDashboard'],
    queryFn: async () => {
      const [membersRes, postsRes, commentsRes] = await Promise.all([
        supabase.from("community_members").select("*").order("created_at", { ascending: false }),
        supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("community_comments").select("*").order("created_at", { ascending: false }),
      ]);

      return {
        members: membersRes.data || [],
        posts: postsRes.data || [],
        comments: commentsRes.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const members = data?.members || [];
  const posts = data?.posts || [];
  const comments = data?.comments || [];

  const deletePost = async (id: string) => {
    await supabase.from("community_posts").delete().eq("id", id);
    await supabase.from("community_comments").delete().eq("post_id", id);
    queryClient.invalidateQueries({ queryKey: ['adminCommunityDashboard'] });
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Community Admin</h1>
        <div className="grid gap-4 lg:grid-cols-3 mb-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Members</h2>
            </CardHeader>
            <CardContent>{members.length}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Posts</h2>
            </CardHeader>
            <CardContent>{posts.length}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Comments</h2>
            </CardHeader>
            <CardContent>{comments.length}</CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">All Posts</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <p>Loading posts...</p>}
              {!loading && posts.length === 0 && <p>No posts found.</p>}
              {posts.map((post) => (
                <div key={post.id} className="rounded-lg border p-3">
                  <p className="font-semibold truncate">{post.content}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
