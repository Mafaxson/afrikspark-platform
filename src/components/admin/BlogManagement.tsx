import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload, Link, Image, Video } from "lucide-react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  media_type: string;
  media_url: string;
  video_url: string;
  author: string;
  tags: string[];
  is_published: boolean;
  published_at: string;
  created_at: string;
}

interface Category {
  id: string;
  category_name: string;
  slug: string;
}

export function BlogManagement() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    media_type: "none",
    media_url: "",
    video_url: "",
    author: "AfrikSpark Team",
    tags: "",
    is_published: false,
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPosts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("blog_categories")
      .select("*")
      .order("category_name");

    if (data) setCategories(data);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-media").getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        media_type: type,
        media_url: publicUrl
      }));
      toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const calculateReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const readingTime = calculateReadingTime(formData.content);
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const postData = {
        title: formData.title,
        slug,
        content: formData.content,
        excerpt: formData.excerpt,
        cover_image: formData.cover_image,
        media_type: formData.media_type,
        media_url: formData.media_url,
        video_url: formData.video_url,
        author: formData.author,
        tags: tagsArray,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
        reading_time: readingTime,
        author_id: user?.id,
      };

      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.from("blog_posts").insert(postData);

        if (error) throw error;
        toast.success("Post created successfully");

        // Send newsletter if post is published
        if (formData.is_published) {
          try {
            const response = await fetch("/functions/v1/send-newsletter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: formData.title,
                slug,
                excerpt: formData.excerpt
              })
            });

            if (response.ok) {
              const result = await response.json();
              console.log("Newsletter sent successfully:", result);
              toast.success(`Newsletter sent to ${result.totalSubscribers} subscribers`);
            } else {
              const error = await response.json();
              console.error("Failed to send newsletter:", error);
              toast.error("Post created but newsletter failed to send");
            }
          } catch (error) {
            console.error("Error sending newsletter:", error);
            toast.error("Post created but newsletter failed to send");
          }
        }
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    }
  };

  const handleCreatePost = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("blog_posts").insert({
        title: formData.title,
        slug: generateSlug(formData.title),
        content: formData.content,
        excerpt: formData.excerpt,
        media_type: formData.media_type,
        media_url: formData.media_url,
        video_url: formData.video_url,
        author: formData.author,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date() : null
      });

      if (error) {
        console.error(error);
        toast.error("Failed to create post");
      } else {
        toast.success("Post created successfully");
        resetForm();
        setIsDialogOpen(false);
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);

      if (error) throw error;
      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      media_type: post.media_type,
      media_url: post.media_url,
      video_url: post.video_url,
      author: post.author,
      tags: post.tags?.join(", ") || "",
      is_published: post.is_published,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      cover_image: "",
      media_type: "none",
      media_url: "",
      video_url: "",
      author: "AfrikSpark Team",
      tags: "",
      is_published: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Update the blog post details below." : "Fill in the details to create a new blog post."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      }));
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="AfrikSpark Team"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated from title"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  className="bg-background"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["blockquote", "code-block"],
                      ["link", "image", "video"],
                      ["clean"],
                    ],
                  }}
                />
              </div>

              {/* Media Upload Section */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-semibold">Media Content</Label>

                <div>
                  <Label htmlFor="media_type">Media Type</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value) => setFormData((prev) => ({
                      ...prev,
                      media_type: value,
                      media_url: value === 'none' ? '' : prev.media_url,
                      video_url: value !== 'link' ? '' : prev.video_url
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Media</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">External Video Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.media_type === 'image' && (
                  <div>
                    <Label>Upload Image</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleMediaUpload(e, 'image')}
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.media_url && (
                      <img src={formData.media_url} alt="Preview" className="h-32 w-32 object-cover rounded mt-2" />
                    )}
                  </div>
                )}

                {formData.media_type === 'video' && (
                  <div>
                    <Label>Upload Video</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleMediaUpload(e, 'video')}
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                    {formData.media_url && (
                      <video src={formData.media_url} className="h-32 w-32 object-cover rounded mt-2" controls />
                    )}
                  </div>
                )}

                {formData.media_type === 'link' && (
                  <div>
                    <Label htmlFor="video_url">Video URL (YouTube, Vimeo, etc.)</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, video_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="cover_image">Cover Image URL (optional)</Label>
                <Input
                  id="cover_image"
                  value={formData.cover_image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="tech, startup, innovation"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>

              <div className="flex gap-2 pt-4">
                {editingPost ? (
                  <Button type="submit" disabled={uploading}>
                    Update Post
                  </Button>
                ) : (
                  <Button onClick={handleCreatePost} disabled={creating || uploading}>
                    Create Post
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Media</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate">{post.title}</div>
              </TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {post.media_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={post.is_published ? "default" : "secondary"}>
                  {post.is_published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                {post.published_at ? format(new Date(post.published_at), "MMM dd, yyyy") : "-"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(post.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
