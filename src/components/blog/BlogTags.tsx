import { Badge } from "@/components/ui/badge";

interface BlogTagsProps {
  tags?: string[];
  className?: string;
}

export function BlogTags({ tags, className = "" }: BlogTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <section className={`my-8 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-sm px-3 py-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            #{tag}
          </Badge>
        ))}
      </div>
    </section>
  );
}
