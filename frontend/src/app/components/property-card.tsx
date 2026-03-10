import { Bed, Bath, Square, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface PropertyCardProps {
  id: string;
  images: string[];
  price: number;
  duration: string;
  title: string;
  beds: number;
  baths: number;
  sqm: number;
  verified?: boolean;
}

export function PropertyCard({
  id,
  images,
  price,
  duration,
  title,
  beds,
  baths,
  sqm,
  verified = false,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link 
      to={`/property/${id}`}
      className="block bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] transition-all"
    >
      {/* Image Container - 16:9 aspect ratio */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#F7F7F9] group">
        <img
          src={images[currentImageIndex]}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Verified Badge */}
        {verified && (
          <div className="absolute top-[8px] left-[8px] bg-[#2563EB] text-white px-[8px] py-[4px] flex items-center gap-[4px]">
            <Check className="w-[12px] h-[12px]" />
            <span className="uppercase tracking-[0.05em] text-[11px] font-semibold">
              Verified
            </span>
          </div>
        )}

        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-[8px] top-1/2 -translate-y-1/2 w-[32px] h-[32px] bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-[16px] h-[16px]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[32px] h-[32px] bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-[16px] h-[16px]" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 flex gap-[4px]">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-[6px] h-[6px] rounded-full transition-all ${
                    idx === currentImageIndex
                      ? "bg-white w-[16px]"
                      : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-[16px]">
        {/* Price */}
        <div className="mb-[8px]">
          <span className="text-[#1A1A1A] text-[24px] font-bold tracking-[-0.02em]">
            €{price.toLocaleString()}
          </span>
          <span className="text-[#6B6B6B] text-[14px] ml-[4px]">
            / {duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[#1A1A1A] text-[16px] font-semibold mb-[12px] line-clamp-1">
          {title}
        </h3>

        {/* Amenities */}
        <div className="flex items-center gap-[16px] text-[#6B6B6B] text-[14px]">
          <div className="flex items-center gap-[6px]">
            <Bed className="w-[16px] h-[16px]" />
            <span>{beds}</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <Bath className="w-[16px] h-[16px]" />
            <span>{baths}</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <Square className="w-[16px] h-[16px]" />
            <span>{sqm}m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
}