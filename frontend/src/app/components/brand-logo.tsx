import brandLogo from "../../assets/logo.png";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export function BrandLogo({ className = "h-[72px] sm:h-[84px]", alt = "ReserveHousing" }: BrandLogoProps) {
  return <img src={brandLogo} alt={alt} className={`${className} w-auto object-contain`} />;
}
