import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar_url: string | null;
  };
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-3 shadow-sm">
      <Avatar className="h-11 w-11">
        <AvatarImage src={member.avatar_url || "/placeholder-avatar.jpg"} />
        <AvatarFallback>{member.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <p className="font-semibold text-slate-900">{member.name}</p>
        <p className="text-sm text-slate-500">{member.role}</p>
        <p className="mt-1 text-xs text-slate-600 line-clamp-2">{member.bio}</p>
      </div>
    </div>
  );
}
