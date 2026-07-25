import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(email: string): string {
  const [local] = email.split("@");
  return (local ?? email).slice(0, 2).toUpperCase();
}

function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : parts[0]!.slice(0, 2);
  return initials.toUpperCase();
}

interface UserAvatarProps {
  email: string;
  name?: string;
  imageUrl?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function UserAvatar({ email, name, imageUrl, size = "default", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name ?? email} />}
      <AvatarFallback>{name ? getInitialsFromName(name) : getInitials(email)}</AvatarFallback>
    </Avatar>
  );
}
