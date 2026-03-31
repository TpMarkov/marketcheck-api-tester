"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CarFront, CheckCircle2, ShieldCheck, Phone, Globe, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  latitude?: number;
  longitude?: number;
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
    latitude?: number;
    longitude?: number;
  };
}

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"roro" | "container">("roro");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!params || !params.id) return;
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const res = await fetch(`/api/proxy?endpoint=/v2/listing/car/${id}`);
        if (!res.ok) throw new Error("Failed to fetch car");
        const data = await res.json();

        try {
          const extraRes = await fetch(`/api/proxy?endpoint=/v2/listing/car/${id}/extra`);
          if (extraRes.ok) {
            const extraData = await extraRes.json();
            data.extra = extraData;
          }
        } catch (error) {
          console.warn("Could not fetch extra features.", error);
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Authenticating Vehicle...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-gray-200 mb-8" />
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-4">Vehicle Not Found</h1>
        <p className="text-gray-400 serif italic mb-12">The requested vehicle is no longer available in our collection.</p>
        <button onClick={() => router.back()} className="bg-black text-white px-8 py-4 rounded-sm font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-gray-900 transition-all">
          Return to Inventory
        </button>
      </div>
    );
  }

  const nextImage = () => {
    if (car.media?.photo_links) {
      setActiveImage((prev) => (prev + 1) % car.media!.photo_links!.length);
    }
  };

  const prevImage = () => {
    if (car.media?.photo_links) {
      setActiveImage((prev) => (prev - 1 + car.media!.photo_links!.length) % car.media!.photo_links!.length);
    }
  };

  const handleCalculateShipping = async () => {
    if (!car || car.price <= 0) return;
    setIsCalculating(true);

    const lat = car.latitude || car.dealer?.latitude;
    const lng = car.longitude || car.dealer?.longitude;
    const bodyType = car.build?.body_type;

    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: car.price,
          lat,
          lng,
          bodyType,
          method: shippingMethod
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCalculationResult(data);
      }
    } catch (error) {
      console.error("Calculation failed", error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-32">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="hidden md:block text-center">
            <h1 className="text-sm font-bold uppercase tracking-[0.1em] truncate max-w-md">{car.heading}</h1>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold tracking-tight">
              {car.price > 0 ? `$${car.price.toLocaleString()}` : "POA"}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-24">

            {/* Hero Gallery */}
            <section className="relative group">
              <div className="aspect-[16/9] bg-gray-100 overflow-hidden rounded-sm">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={car.media?.photo_links?.[activeImage] || ""}
                    alt={car.heading}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {car.media?.photo_links && car.media.photo_links.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="mt-6 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {car.media.photo_links.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-32 aspect-[3/2] shrink-0 overflow-hidden rounded-sm border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      >
                        <img src={link} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Description */}
            <section className="max-w-3xl">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Overview</h2>
              <h3 className="text-4xl font-bold tracking-tighter uppercase mb-8">{car.heading}</h3>
              <div className="serif italic text-xl text-gray-600 leading-relaxed space-y-6">
                {car.extra?.seller_comment ? (
                  <p className="whitespace-pre-wrap">{car.extra.seller_comment}</p>
                ) : (
                  <p>This exceptional {car.build?.year} {car.build?.make} {car.build?.model} represents the pinnacle of automotive engineering and design. Meticulously maintained and presented in pristine condition.</p>
                )}
              </div>
            </section>

            {/* Features */}
            {car.extra?.features && car.extra.features.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-12">Specifications & Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                  {car.extra.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-900">{feature.includes('@') ? feature.split('@').pop()?.trim() : feature}</span>
                      <CheckCircle2 className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Specs & Contact */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pr-1">
            {/* Key Specs Card */}
            <div className="border border-gray-100 p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Price</span>
                <div className="text-4xl font-bold tracking-tighter uppercase">
                  {car.price > 0 ? `$${car.price.toLocaleString()}` : "Contact Us"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Mileage</span>
                  <div className="font-bold text-sm">{car.miles ? `${car.miles.toLocaleString()} mi` : "N/A"}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Year</span>
                  <div className="font-bold text-sm">{car.build?.year || "N/A"}</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Dealer</h4>
                  <div className="space-y-0.5">
                    <div className="font-bold uppercase tracking-tight text-xs leading-none">{car.dealer?.name || "Dealer"}</div>
                    <div className="text-[11px] text-gray-500 serif italic">{car.dealer?.city}, {car.dealer?.state}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {car.dealer?.phone && (
                    <a href={`tel:${car.dealer.phone}`} className="flex items-center justify-center gap-3 bg-black text-white py-3.5 rounded-sm font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-gray-900 transition-all">
                      <Phone className="w-4 h-4" /> Call Dealer
                    </a>
                  )}
                  {car.vdp_url && (
                    <a href={car.vdp_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-sm font-bold uppercase text-[11px] tracking-[0.2em] hover:border-black transition-all">
                      <Globe className="w-4 h-4" /> Visit Website
                    </a>
                  )}

                  {/* Method Selector */}
                  <div className="flex bg-gray-50 p-1 rounded-sm border border-gray-100">
                    <button
                      onClick={() => setShippingMethod("roro")}
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-[1px] ${shippingMethod === "roro" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      RoRo (Cheaper)
                    </button>
                    <button
                      onClick={() => setShippingMethod("container")}
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-[1px] ${shippingMethod === "container" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      Container (Safer)
                    </button>
                  </div>

                  {/* Shipping Calculator Button */}
                  <button
                    onClick={handleCalculateShipping}
                    disabled={isCalculating || car.price <= 0}
                    className={`flex items-center justify-center gap-3 py-3.5 rounded-sm font-bold uppercase text-[11px] tracking-[0.2em] transition-all border ${isCalculating ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]'}`}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Estimate to Bulgaria</span>
                      </>
                    )}
                  </button>

                  {/* Shipping Breakdown */}
                  <AnimatePresence>
                    {calculationResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="bg-indigo-50/50 rounded-sm overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between items-end border-b border-indigo-100 pb-2.5">
                            <h5 className="text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-900">Breakdown</h5>
                            {calculationResult.port && (
                              <div className="text-[10px] font-semibold text-indigo-400 text-right leading-tight">
                                {calculationResult.port} <br />
                                {calculationResult.method} • {car.build?.body_type || "Std"}
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                            <div className="flex justify-between items-center bg-white/50 px-2 py-1.5 rounded-sm">
                              <span className="text-gray-400 font-medium scale-90 origin-left">Transport</span>
                              <span className="font-bold text-gray-900">${calculationResult.inlandTransport.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 px-2 py-1.5 rounded-sm">
                              <span className="text-gray-400 font-medium scale-90 origin-left">Ocean</span>
                              <span className="font-bold text-gray-900">${calculationResult.oceanShipping.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 px-2 py-1.5 rounded-sm">
                              <span className="text-gray-400 font-medium scale-90 origin-left">Duty</span>
                              <span className="font-bold text-gray-900">${calculationResult.duty.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/50 px-2 py-1.5 rounded-sm">
                              <span className="text-gray-400 font-medium scale-90 origin-left">VAT</span>
                              <span className="font-bold text-gray-900">${calculationResult.vat.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-indigo-100 flex justify-between items-center text-indigo-900">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold uppercase tracking-tight">Total Landed</span>
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-100/50 px-1.5 py-0.5 rounded-sm mt-1">
                                ~{calculationResult.totalEUR.toLocaleString()} EUR
                              </span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter">
                              ${calculationResult.total.toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* View Route Details Button */}
                  {calculationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        href={`/car/${car.id}/route-details`}
                        onClick={() => {
                          const routeData = {
                            carId: car.id,
                            carName: car.heading || car.build ? `${car.build?.year} ${car.build?.make} ${car.build?.model}` : "Vehicle",
                            carPrice: car.price,
                            carImage: car.media?.photo_links?.[0] || "",
                            carBodyType: car.build?.body_type || "Standard",
                            inlandTransport: calculationResult.inlandTransport,
                            oceanShipping: calculationResult.oceanShipping,
                            duty: calculationResult.duty,
                            vat: calculationResult.vat,
                            otherFees: calculationResult.otherFees,
                            total: calculationResult.total,
                            totalEUR: calculationResult.totalEUR,
                            port: calculationResult.port,
                            distance: calculationResult.distance,
                            priority: calculationResult.priority,
                            method: calculationResult.method,
                            exchangeRate: calculationResult.exchangeRate,
                          };
                          localStorage.setItem("routeDetailsData", JSON.stringify(routeData));
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-black text-white font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-gray-900 transition-all active:scale-[0.98] rounded-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                        View Route Details
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Technical Details List */}
              <div className="pt-10 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Technical Details</h4>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-400 uppercase tracking-widest">VIN</span>
                    <span className="font-bold">{car.vin}</span>
                  </div>
                  {car.build?.engine && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-400 uppercase tracking-widest">Engine</span>
                      <span className="font-bold text-right ml-4">{car.build.engine}</span>
                    </div>
                  )}
                  {car.build?.transmission && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-400 uppercase tracking-widest">Transmission</span>
                      <span className="font-bold text-right ml-4">{car.build.transmission}</span>
                    </div>
                  )}
                  {car.exterior_color && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-400 uppercase tracking-widest">Exterior</span>
                      <span className="font-bold">{car.exterior_color}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <CarFront className={`${className} animate-pulse`} />;
}
