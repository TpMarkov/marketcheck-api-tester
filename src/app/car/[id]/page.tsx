"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Gauge, CarFront, Info, CheckCircle2, ShieldCheck } from "lucide-react";

interface CarDetail {
  id: string;
  vin: string;
  heading: string;
  price: number;
  miles: number;
  exterior_color: string;
  interior_color: string;
  vdp_url: string;
  carfax_1_owner: boolean;
  carfax_clean_title: boolean;
  data_source: string;
  media?: { photo_links?: string[] };
  extra?: { features?: string[], options?: string[], seller_comment?: string };
  build?: {
    year: number;
    make: string;
    model: string;
    trim: string;
    body_type: string;
    transmission: string;
    engine: string;
    drivetrain: string;
    fuel_type: string;
    vehicle_type: string;
    doors: number;
    cylinders: number;
    made_in: string;
  };
  dealer?: {
    city: string;
    state: string;
    name: string;
    street: string;
    phone: string;
    website: string;
  };
}

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!params || !params.id) return;
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;

        // Fetch base listing info
        const res = await fetch(`/api/proxy?endpoint=/v2/listing/car/${id}`);
        if (!res.ok) throw new Error("Failed to fetch car");
        const data = await res.json();

        // Try fetching extra info (features, comments)
        try {
          const extraRes = await fetch(`/api/proxy?endpoint=/v2/listing/car/${id}/extra`);
          if (extraRes.ok) {
            const extraData = await extraRes.json();
            data.extra = extraData;
          }
        } catch (e) {
          console.warn("Could not fetch extra features.");
        }

        setCar(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-brand-300 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Vehicle Data...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-20 h-20 text-slate-700 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2">Vehicle Not Found</h1>
        <p className="text-slate-400 mb-8">The vehicle you are looking for may have been sold or removed.</p>
        <button onClick={() => router.back()} className="glass px-6 py-3 rounded-xl text-white font-bold inline-flex items-center gap-2 hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" /> Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans pb-24">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl bg-[#0b1120]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 glass rounded-full hover:bg-slate-800 transition">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-white truncate">{car.heading}</h1>
            <p className="text-xs text-brand-300 font-medium">VIN: {car.vin}</p>
          </div>
          {car.price > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-black text-white">${car.price.toLocaleString()}</p>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Gallery & Main Info */}
          <div className="w-full lg:w-2/3 space-y-6">

            {/* Gallery */}
            <div className="glass rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 bg-[#1e293b]/50">
              <div className="aspect-[16/9] md:aspect-[21/9] bg-black relative flex items-center justify-center">
                {car.media?.photo_links && car.media.photo_links.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={car.media.photo_links[activeImage]} alt={car.heading} className="w-full h-full object-cover" />
                ) : (
                  <CarFront className="w-24 h-24 text-slate-700" />
                )}

                {car.price > 0 && (
                  <div className="absolute top-4 right-4 bg-brand-600/90 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black tracking-wide border border-white/20 shadow-xl sm:hidden">
                    ${car.price.toLocaleString()}
                  </div>
                )}
              </div>

              {car.media?.photo_links && car.media.photo_links.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto custom-scrollbar">
                  {car.media.photo_links.map((link, idx) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={idx}
                      src={link}
                      alt="Thumbnail"
                      onClick={() => setActiveImage(idx)}
                      className={`w-24 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all shrink-0 ${activeImage === idx ? 'border-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Seller Comments */}
            {car.extra?.seller_comment && (
              <div className="glass p-8 rounded-3xl border border-slate-700/50 bg-[#1e293b]/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-brand-400" /> Seller's Notes
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                  {car.extra.seller_comment}
                </p>
              </div>
            )}

            {/* Features & Options */}
            {car.extra?.features && car.extra.features.length > 0 && (
              <div className="glass p-8 rounded-3xl border border-slate-700/50 bg-[#1e293b]/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Premium Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {car.extra.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-[#0b1120]/50 p-3 rounded-xl border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2"></div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar / Specs */}
          <div className="w-full lg:w-1/3 space-y-6">

            {/* Dealer Info */}
            <div className="glass p-8 rounded-3xl border border-slate-700/50 bg-[#1e293b]/50 sticky top-28">
              <h2 className="text-2xl font-black text-white mb-2">
                {car.price > 0 ? `$${car.price.toLocaleString()}` : "Contact for Price"}
              </h2>
              <div className="flex gap-4 mb-6">
                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                  <Gauge className="w-4 h-4" /> {car.miles ? car.miles.toLocaleString() : "Unknown"} mi
                </span>
                {car.carfax_1_owner && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    1-Owner Focus
                  </span>
                )}
              </div>

              <div className="border-t border-slate-700/50 pt-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Location & Dealer</h3>
                <div className="space-y-4">
                  <div>
                    <strong className="block text-white text-lg">{car.dealer?.name || "Independent Dealer"}</strong>
                    <div className="text-slate-400 text-sm mt-1 flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        {car.dealer?.street && <p>{car.dealer.street}</p>}
                        <p>{car.dealer?.city}, {car.dealer?.state}</p>
                      </div>
                    </div>
                  </div>
                  {car.dealer?.phone && (
                    <a href={`tel:${car.dealer.phone}`} className="block w-full text-center bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-brand-500/50">
                      Call {car.dealer.phone}
                    </a>
                  )}
                  {car.vdp_url && (
                    <a href={car.vdp_url} target="_blank" rel="noopener noreferrer" className="block w-full text-center glass hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all">
                      View Original Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Tech Specs */}
            <div className="glass p-8 rounded-3xl border border-slate-700/50 bg-[#1e293b]/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Gauge className="w-5 h-5 text-brand-400" /> Technical Specs
              </h3>

              <div className="divide-y divide-slate-700/50">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400 font-medium tracking-wide">Vin</span>
                  <span className="text-white font-mono text-sm">{car.vin}</span>
                </div>
                {car.build?.engine && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-medium tracking-wide">Engine</span>
                    <span className="text-white font-semibold flex-1 text-right ml-4">{car.build.engine}</span>
                  </div>
                )}
                {car.build?.transmission && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-medium tracking-wide">Transmission</span>
                    <span className="text-white font-semibold flex-1 text-right ml-4">{car.build.transmission}</span>
                  </div>
                )}
                {car.build?.drivetrain && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-medium tracking-wide">Drivetrain</span>
                    <span className="text-white font-semibold">{car.build.drivetrain}</span>
                  </div>
                )}
                {car.exterior_color && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-medium tracking-wide">Exterior</span>
                    <span className="text-white font-semibold">{car.exterior_color}</span>
                  </div>
                )}
                {car.interior_color && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-medium tracking-wide">Interior</span>
                    <span className="text-white font-semibold">{car.interior_color}</span>
                  </div>
                )}
                {car.build?.made_in && (
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-400 font-medium tracking-wide">Made In</span>
                    <span className="text-white font-semibold">{car.build.made_in}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(99, 102, 241, 0.2); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(99, 102, 241, 0.4); }
      `}} />
    </div>
  );
}
