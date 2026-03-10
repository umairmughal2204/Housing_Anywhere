import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Heart, MapPin, Euro, Home, Calendar, X } from "lucide-react";
import { Link } from "react-router";

export function Favorites() {
  const favorites = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      title: "Modern Loft in Kreuzberg",
      location: "Berlin, Germany",
      price: "€1,200",
      bedrooms: 2,
      size: "75m²",
      available: "Available Now",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      title: "Sunny Studio near Tiergarten",
      location: "Berlin, Germany",
      price: "€950",
      bedrooms: 1,
      size: "45m²",
      available: "Available from Mar 15",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      title: "Cozy Apartment in Eixample",
      location: "Barcelona, Spain",
      price: "€850",
      bedrooms: 1,
      size: "55m²",
      available: "Available Now",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-[#F7F7F9] py-[64px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          {/* Header */}
          <div className="mb-[48px]">
            <h1 className="text-[#1A1A1A] text-[40px] font-bold tracking-[-0.02em] mb-[16px]">
              Favorites
            </h1>
            <p className="text-[#6B6B6B] text-[16px]">
              {favorites.length} saved properties
            </p>
          </div>

          {/* Favorites Grid */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 gap-[24px]">
              {favorites.map((property) => (
                <div key={property.id} className="bg-white border border-[rgba(0,0,0,0.08)] group hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute top-[16px] right-[16px] w-[40px] h-[40px] bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-[20px] h-[20px] text-[#FF4B27] fill-[#FF4B27]" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-[24px]">
                    <Link to={`/property/${property.id}`}>
                      <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[8px] hover:text-[#FF4B27] transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-[8px] text-[#6B6B6B] text-[14px] mb-[16px]">
                      <MapPin className="w-[14px] h-[14px]" />
                      {property.location}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-[16px] mb-[16px] pb-[16px] border-b border-[rgba(0,0,0,0.08)]">
                      <div className="text-[#6B6B6B] text-[14px]">
                        {property.bedrooms} bed
                      </div>
                      <div className="w-[4px] h-[4px] bg-[#6B6B6B] rounded-full"></div>
                      <div className="text-[#6B6B6B] text-[14px]">
                        {property.size}
                      </div>
                    </div>

                    {/* Price & Availability */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[#FF4B27] text-[24px] font-bold">
                          {property.price}
                        </div>
                        <div className="text-[#6B6B6B] text-[12px]">per month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#008A52] text-[12px] font-semibold">
                          {property.available}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-[8px] mt-[16px] pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                      <Link
                        to={`/property/${property.id}`}
                        className="flex-1 px-[16px] py-[10px] bg-[#FF4B27] text-white text-[14px] font-semibold text-center hover:bg-[#E63E1F] transition-colors"
                      >
                        View Details
                      </Link>
                      <button className="px-[16px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[64px] text-center">
              <Heart className="w-[64px] h-[64px] text-[#6B6B6B] mx-auto mb-[24px]" />
              <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">
                No Favorites Yet
              </h2>
              <p className="text-[#6B6B6B] text-[16px] mb-[32px] max-w-[500px] mx-auto">
                Start saving properties you love to keep track of them and get notifications when they become available.
              </p>
              <Link
                to="/s/berlin"
                className="inline-block px-[24px] py-[12px] bg-[#FF4B27] text-white font-semibold hover:bg-[#E63E1F] transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
