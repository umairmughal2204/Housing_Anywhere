import { useEffect, useMemo, useState } from "react";

interface UserAvatarProps {
  name?: string;
  profilePictureUrl?: string;
  sizeClassName: string;
  textClassName: string;
  className?: string;
}

function getInitials(name?: string) {
  const trimmedName = (name ?? "").trim();
  if (!trimmedName) {
    return "U";
  }

  const parts = trimmedName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function UserAvatar({
  name,
  profilePictureUrl,
  sizeClassName,
  textClassName,
  className = "",
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profilePictureUrl]);

  const initials = useMemo(() => getInitials(name), [name]);
  const shouldShowImage = Boolean(profilePictureUrl) && !imageFailed;

  return (
    <div
      className={`${sizeClassName} ${textClassName} ${className} rounded-full flex items-center justify-center overflow-hidden`}
      aria-label={name ? `${name} avatar` : "User avatar"}
    >
      {shouldShowImage ? (
        <img
          src={profilePictureUrl}
          alt={name ? `${name} avatar` : "User"}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}