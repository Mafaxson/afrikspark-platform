import { Badge } from "@/components/ui/badge";

interface KeyFocusAreasProps {
  areas?: string[];
  className?: string;
}

export function KeyFocusAreas({ areas, className = "" }: KeyFocusAreasProps) {
  if (!areas || areas.length === 0) {
    return null;
  }

  return (
    <section className={`my-8 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Focus Areas</h3>
      <div className="flex flex-wrap gap-3">
        {areas.map((area, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-sm px-4 py-2 rounded-full font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
          >
            {area}
          </Badge>
        ))}
      </div>
    </section>
  );
}
