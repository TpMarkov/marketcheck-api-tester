"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, SlidersHorizontal, CarFront, X, Loader2, ArrowRight, AlertCircle, Gauge, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

interface CarListing {
  id: string;
  vin: string;
  heading: string;
  price: number;
  miles: number;
  exterior_color: string;
  media?: { photo_links?: string[] };
  build?: {
    year: number;
    make: string;
    model: string;
    body_type: string;
    transmission: string;
    engine: string;
  };
  dealer?: {
    city: string;
    state: string;
    name: string;
  };
}

export default function AutoTrader() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AutoTraderContent />
    </Suspense>
  );
}

function AutoTraderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [page, setPage] = useState(0);

  const initialFilters = {
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    year_min: searchParams.get("year_min") || "",
    year_max: searchParams.get("year_max") || "",
    price_max: searchParams.get("price_max") || "",
    body_type: searchParams.get("body_type") || "",
    car_type: searchParams.get("car_type") || "used"
  };

  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  // Sync state whenever the URL changes (e.g. Back button)
  useEffect(() => {
    const freshFilters = {
      make: searchParams.get("make") || "",
      model: searchParams.get("model") || "",
      year_min: searchParams.get("year_min") || "",
      year_max: searchParams.get("year_max") || "",
      price_max: searchParams.get("price_max") || "",
      body_type: searchParams.get("body_type") || "",
      car_type: searchParams.get("car_type") || "used"
    };
    setActiveFilters(freshFilters);
    setFilters(freshFilters);
    setPage(0);
  }, [searchParams]);

  const [showFilters, setShowFilters] = useState(false);

  // Makes & Models State
  const [availableMakes, setAvailableMakes] = useState<{ MakeId: number, MakeName: string }[]>([]);
  const [availableModels, setAvailableModels] = useState<{ Model_ID: number, Model_Name: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch all worldwide makes on mount
  useEffect(() => {
    fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json")
      .then(res => res.json())
      .then(data => {
        const sortedMakes = (data.Results || []).sort((a: { MakeName: string }, b: { MakeName: string }) => a.MakeName.localeCompare(b.MakeName));
        setAvailableMakes(sortedMakes);
      })
      .catch(err => console.error("Failed to fetch makes:", err));
  }, []);

  // Fetch models whenever the selected make changes
  useEffect(() => {
    if (!filters.make) {
      setAvailableModels([]);
      return;
    }
    setLoadingModels(true);
    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${filters.make}?format=json`)
      .then(res => res.json())
      .then(data => {
        const sortedModels = (data.Results || []).sort((a: { Model_Name: string }, b: { Model_Name: string }) => a.Model_Name.localeCompare(b.Model_Name));
        setAvailableModels(sortedModels);
      })
      .catch(err => console.error("Failed to fetch models:", err))
      .finally(() => setLoadingModels(false));
  }, [filters.make]);

  const fetchInventory = useCallback(async (isLoadMore = false, forceFresh = false) => {
    try {
      setError(null);

      // Try resolving from cache first if this is an initial mount (not load more)
      if (!isLoadMore && !forceFresh && typeof window !== 'undefined') {
        const saved = sessionStorage.getItem('autosphere_state');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.search === window.location.search) {
              setListings(parsed.listings);
              setPage(parsed.page);
              setTotalFound(parsed.totalFound);
              setLoading(false);

              // Apply scroll restoration slightly after DOM repaints
              setTimeout(() => window.scrollTo(0, parsed.scrollY), 50);
              return;
            }
          } catch (e) { }
        }
      }

      if (!isLoadMore) {
        setLoading(true);
        setPage(0);
      }

      const queryParams = new URLSearchParams();
      queryParams.append("endpoint", "/v2/search/car/active");

      if (activeFilters.make) queryParams.append("make", activeFilters.make);
      if (activeFilters.model) queryParams.append("model", activeFilters.model);
      if (activeFilters.year_min) queryParams.append("year_min", activeFilters.year_min);
      if (activeFilters.year_max) queryParams.append("year_max", activeFilters.year_max);
      if (activeFilters.price_max) queryParams.append("price_max", activeFilters.price_max);
      if (activeFilters.body_type) queryParams.append("body_type", activeFilters.body_type);
      if (activeFilters.car_type) queryParams.append("car_type", activeFilters.car_type);

      queryParams.append("start", (isLoadMore ? (page + 1) * 50 : 0).toString());
      queryParams.append("rows", "50");

      const res = await fetch(`/api/proxy?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch inventory");
      }

      if (isLoadMore) {
        setListings(prev => [...prev, ...(data.listings || [])]);
        setPage(prev => prev + 1);
      } else {
        setListings(data.listings || []);
        setTotalFound(data.num_found || 0);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      console.error(e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, page]);

  useEffect(() => {
    fetchInventory(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]); // Run a fresh search only when filters change, not when page changes

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "make") {
      setFilters(prev => ({ ...prev, make: value, model: "" }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });

    // Invalidate cached memory on completely new search!
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('autosphere_state');
    }

    // This pushes to the URL, which triggers the searchParams useEffect above
    router.push(`/?${params.toString()}`, { scroll: false });
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform">
              <CarFront className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">AutoSphere</span>
          </Link>

          <div className="hidden md:flex gap-10 text-[11px] font-bold uppercase tracking-[0.2em]">
            <a href="#" className="hover:opacity-50 transition">Inventory</a>
            <a href="#" className="hover:opacity-50 transition">Sell</a>
            <a href="#" className="hover:opacity-50 transition">Finance</a>
            <a href="#" className="hover:opacity-50 transition">About</a>
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-60">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Car"
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative h-full max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col justify-center items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-8">
              DRIVE THE <br /> FUTURE.
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-xl font-medium mb-12 serif italic">
              Experience the world&apos;s most curated collection of premium vehicles, delivered with uncompromising service.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('inventory');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-white text-black px-8 py-4 rounded-full font-bold uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:bg-gray-100 transition-all"
            >
              Explore Inventory <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main id="inventory" className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24">

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="text-red-900 font-bold mb-1">Connection Error</h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    {error}. Please check your <code className="bg-red-100 px-1 rounded">MARKETCHECK_API_KEY</code> in the environment settings.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4">Inventory</h2>
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <span>{totalFound.toLocaleString()} Available</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Worldwide Shipping</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading && page === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-6">
                <div className="aspect-[4/3] bg-gray-100 animate-pulse rounded-sm"></div>
                <div className="h-8 bg-gray-100 animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-100 animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-32 text-center border-y border-gray-100">
            <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4">No results found</h3>
            <p className="text-gray-400 serif italic">Try adjusting your filters to find your perfect match.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {listings.map((car, idx) => (
              <motion.div
                key={`${car.id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.1 }}
                className="group"
              >
                <Link
                  href={`/car/${car.id}`}
                  onClick={() => {
                    sessionStorage.setItem('autosphere_state', JSON.stringify({
                      search: window.location.search,
                      listings,
                      page,
                      totalFound,
                      scrollY: window.scrollY
                    }));
                  }}
                  className="block space-y-6"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm">
                    {car.media?.photo_links?.[0] ? (
                      <img
                        src={car.media.photo_links[0]}
                        alt={car.heading}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <CarFront className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      {car.build?.year}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl font-bold tracking-tight group-hover:opacity-60 transition-opacity">
                        {car.heading}
                      </h3>
                      <span className="text-xl font-bold tracking-tight">
                        {car.price > 0 ? `$${car.price.toLocaleString()}` : "POA"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3 h-3" />
                        {car.miles ? `${car.miles.toLocaleString()} mi` : "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {car.dealer ? `${car.dealer.city}, ${car.dealer.state}` : "Unknown"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        {car.exterior_color || "Any"}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {listings.length > 0 && (
          <div className="mt-32 flex justify-center">
            <button
              onClick={() => fetchInventory(true)}
              disabled={loading}
              className="group flex flex-col items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:opacity-50 transition"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Load More</span>
                  <div className="w-px h-12 bg-black group-hover:h-16 transition-all"></div>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[70] shadow-2xl p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-3xl font-bold tracking-tighter uppercase">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Condition</label>
                    <select name="car_type" value={filters.car_type} onChange={handleFilterChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors appearance-none bg-transparent">
                      <option value="">Any Condition</option>
                      <option value="used">Used Cars</option>
                      <option value="new">New Cars</option>
                      <option value="certified">Certified Pre-Owned</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Make</label>
                    <select
                      name="make"
                      value={filters.make}
                      onChange={handleFilterChange}
                      className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors appearance-none bg-transparent"
                      disabled={availableMakes.length === 0}
                    >
                      <option value="">Any Make</option>
                      {availableMakes.map(m => (
                        <option key={m.MakeId} value={m.MakeName}>{m.MakeName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Model</label>
                      {loadingModels && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                    </div>
                    <select
                      name="model"
                      value={filters.model}
                      onChange={handleFilterChange}
                      className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors appearance-none bg-transparent disabled:opacity-30"
                      disabled={!filters.make || availableModels.length === 0}
                    >
                      <option value="">{filters.make ? "Any Model" : "Select a Make first"}</option>
                      {availableModels.map(m => (
                        <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Min Year</label>
                      <input type="number" name="year_min" placeholder="2015" value={filters.year_min} onChange={handleFilterChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Max Year</label>
                      <input type="number" name="year_max" placeholder="2024" value={filters.year_max} onChange={handleFilterChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Max Price ($)</label>
                    <input type="number" name="price_max" placeholder="e.g. 50000" value={filters.price_max} onChange={handleFilterChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Body Type</label>
                    <select name="body_type" value={filters.body_type} onChange={handleFilterChange} className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors appearance-none bg-transparent">
                      <option value="">Any Body Type</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Wagon">Hatchback / Wagon</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-black text-white font-bold py-5 px-4 rounded-sm transition-all hover:bg-gray-900 uppercase text-[11px] tracking-[0.3em]">
                  Apply Filters
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-24 bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-sm space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
                <CarFront className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tighter uppercase">AutoSphere</span>
            </Link>
            <p className="text-gray-400 serif italic leading-relaxed">
              Redefining the automotive marketplace through curated excellence and unparalleled digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-24 gap-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Inventory</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-black transition">New Arrivals</a></li>
                <li><a href="#" className="hover:text-black transition">Electric</a></li>
                <li><a href="#" className="hover:text-black transition">Luxury</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Company</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-black transition">Our Story</a></li>
                <li><a href="#" className="hover:text-black transition">Careers</a></li>
                <li><a href="#" className="hover:text-black transition">Press</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Support</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-black transition">Contact</a></li>
                <li><a href="#" className="hover:text-black transition">FAQ</a></li>
                <li><a href="#" className="hover:text-black transition">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-24 pt-12 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <span>&copy; 2026 AutoSphere</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black transition">Instagram</a>
            <a href="#" className="hover:text-black transition">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
