import { useEffect, useState } from "react";

interface AvatarProps {
  alt?: string;
  className?: string;
  imageUrl?: string | null;
  label?: string | null;
  onImageError?: () => void;
  showImage?: boolean;
}

function getInitial(label?: string | null) {
  const trimmedLabel = label?.trim();
  return trimmedLabel ? trimmedLabel.charAt(0).toUpperCase() : "?";
}

export function Avatar({ alt = "", className = "", imageUrl, label, onImageError, showImage = true }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedImageUrl = imageUrl?.trim();
  const canShowImage = showImage && Boolean(normalizedImageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [normalizedImageUrl]);

  return (
    <div className={`avatar ${className}`.trim()} aria-label={alt || undefined}>
      {canShowImage ? (
        <img
          src={normalizedImageUrl}
          alt={alt}
          onError={() => {
            setImageFailed(true);
            onImageError?.();
          }}
        />
      ) : (
        <span>{getInitial(label)}</span>
      )}
    </div>
  );
}
