import { Header } from "../components/header";
import { useAuth } from "../contexts/auth-context";
import { Footer } from "../components/footer";
import heroBg from "../../assets/hero-bg.jpg";

export function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header variant={isAuthenticated ? "dashboard" : "default"} dashboardButtonFilled={false} />

      {/* Hero Banner Section */}
      <section 
        className="relative min-h-[380px] md:min-h-[460px] flex items-center justify-center text-center bg-cover bg-center py-[64px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45 z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-[800px] px-[16px] text-white flex flex-col items-center">
          {/* Logo Branding */}
          <div className="text-[34px] md:text-[40px] font-black tracking-wider uppercase mb-[2px] font-serif select-none">
            EzzyStay
          </div>
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/90 mb-[24px]">
            Travel better together
          </span>

          {/* Headings */}
          <h1 className="text-[32px] md:text-[54px] font-bold tracking-tight mb-[12px] leading-[1.2]">
            Get to know EzzyStay
          </h1>
          <p className="text-[18px] md:text-[22px] font-medium text-white/95">
            Where families travel better together
          </p>
        </div>
      </section>

      {/* Mission Statement Banner */}
      <section className="bg-[#0D263B] text-white py-[28px] px-[16px] text-center">
        <p className="text-[16px] md:text-[18px] font-semibold max-w-[960px] mx-auto leading-[1.5]">
          Our mission is to find every family the space they need to relax, reconnect, and enjoy precious time away together.
        </p>
      </section>

      {/* Main Narrative Articles */}
      <main className="max-w-[960px] mx-auto px-[16px] py-[64px] space-y-[52px]">
        {/* Connection Section */}
        <section className="text-left border-b border-[#F1F5F9] pb-[40px]">
          <h2 className="text-[#0F2D36] text-[28px] md:text-[32px] font-bold mb-[14px]">
            We believe in family connection
          </h2>
          <p className="text-[#4B5563] text-[16px] leading-[1.7] font-medium">
            We need each other now more than ever, and we all want more quality time with the people we love. 
            Our focus is on the importance of connection and the joy that celebrating meaningful moments together brings. 
            That's the magic we're trying to capture. That's why we're here.
          </p>
        </section>

        {/* Place for everyone Section */}
        <section className="text-left border-b border-[#F1F5F9] pb-[40px]">
          <h2 className="text-[#0F2D36] text-[28px] md:text-[32px] font-bold mb-[14px]">
            We have a place for everyone
          </h2>
          <p className="text-[#4B5563] text-[16px] leading-[1.7] font-medium font-sans">
            We started pairing homeowners with families looking for places to stay in 2018, and EzzyStay was born. 
            Since then, we've grown into a trusted global vacation brand with a unique selection of whole homes all over the world. 
            In other words, there's room for everyone. EzzyStay takes diversity and inclusion seriously, because we believe that family is everything. 
            No matter how it takes shape.
          </p>
        </section>

        {/* Travel better together Section */}
        <section className="text-left pb-[10px]">
          <h2 className="text-[#0F2D36] text-[28px] md:text-[32px] font-bold mb-[14px]">
            We want families to travel better together
          </h2>
          <p className="text-[#4B5563] text-[16px] leading-[1.7] font-medium">
            That means new features that make getting away together simpler for everyone. It means filtering for preferences and highlighting destinations within driving distance. 
            It means streamlined group planning tools. It means stays for every budget. And it means excellent customer service and flexible cancellation policies if plans change.
          </p>
        </section>
      </main>

      {/* Call to Action Banner */}
      <section className="bg-[#0891B2] text-white py-[20px] px-[16px] text-center">
        <p className="text-[14px] md:text-[16px] font-bold">
          Want to join our rental housing marketplace as a property owner? 
          <a href="/landlord" className="underline hover:text-white/90 ml-[6px]">
            Learn More
          </a>
        </p>
      </section>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
