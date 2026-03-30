"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Gauge, Tag, Filter, SlidersHorizontal, CarFront, ChevronRight, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    year_min: "",
    year_max: "",
    price_max: "",
    body_type: "",
    car_type: "used"
  });

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
        // Sort makes alphabetically
        const sortedMakes = (data.Results || []).sort((a: any, b: any) => a.MakeName.localeCompare(b.MakeName));
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
        const sortedModels = (data.Results || []).sort((a: any, b: any) => a.Model_Name.localeCompare(b.Model_Name));
        setAvailableModels(sortedModels);
      })
      .catch(err => console.error("Failed to fetch models:", err))
      .finally(() => setLoadingModels(false));
  }, [filters.make]);

  const fetchInventory = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setPage(0);
      }

      const queryParams = new URLSearchParams();
      queryParams.append("endpoint", "/v2/search/car/active");

      if (filters.make) queryParams.append("make", filters.make);
      if (filters.model) queryParams.append("model", filters.model);
      if (filters.year_min) queryParams.append("year_min", filters.year_min);
      if (filters.year_max) queryParams.append("year_max", filters.year_max);
      if (filters.price_max) queryParams.append("price_max", filters.price_max);
      if (filters.body_type) queryParams.append("body_type", filters.body_type);
      if (filters.car_type) queryParams.append("car_type", filters.car_type);

      queryParams.append("start", (isLoadMore ? (page + 1) * 50 : 0).toString());
      queryParams.append("rows", "50");

      const res = await fetch(`/api/proxy?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (isLoadMore) {
        setListings(prev => [...prev, ...(data.listings || [])]);
        setPage(prev => prev + 1);
      } else {
        setListings(data.listings || []);
        setTotalFound(data.num_found || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "make") {
      setFilters(prev => ({ ...prev, make: value, model: "" })); // Reset model when make changes
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans selection:bg-brand-500/30">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 rounded-xl p-2 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <CarFront className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Auto<span className="text-brand-400">Sphere</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-6 font-medium text-sm text-slate-300">
            <a href="#" className="hover:text-white transition">Buy a Car</a>
            <a href="#" className="hover:text-white transition">Sell your Car</a>
            <a href="#" className="hover:text-white transition">Reviews</a>
            <a href="#" className="hover:text-white transition">Finance</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(true)}
          className="md:hidden glass w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold mb-4"
        >
          <SlidersHorizontal className="w-5 h-5 text-brand-400" />
          Advanced Filters
        </button>

        {/* Sidebar Filters */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 glass border-r bg-[#0f172a] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-1/4 md:border-none md:bg-transparent ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 md:p-0 h-full overflow-y-auto custom-scrollbar flex flex-col">
            <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 glass rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              <div className="glass p-6 rounded-2xl border border-slate-700/50 bg-[#1e293b]/50 shadow-xl">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
                  <Filter className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-bold text-white tracking-wide">Refine Search</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Condition</label>
                    <select name="car_type" value={filters.car_type} onChange={handleFilterChange} className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a] text-white">
                      <option value="">Any Condition</option>
                      <option value="used">Used Cars</option>
                      <option value="new">New Cars</option>
                      <option value="certified">Certified Pre-Owned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Make</label>
                    <select
                      name="make"
                      value={filters.make}
                      onChange={handleFilterChange}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a] text-white"
                      disabled={availableMakes.length === 0}
                    >
                      <option value="">Any Make</option>
                      {availableMakes.map(m => (
                        <option key={m.MakeId} value={m.MakeName}>{m.MakeName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Model</label>
                      {loadingModels && <span className="text-[10px] text-brand-400 animate-pulse">Loading...</span>}
                    </div>
                    <select
                      name="model"
                      value={filters.model}
                      onChange={handleFilterChange}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a] text-white disabled:opacity-50"
                      disabled={!filters.make || availableModels.length === 0}
                    >
                      <option value="">{filters.make ? "Any Model" : "Select a Make first"}</option>
                      {availableModels.map(m => (
                        <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1/2">
                      <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Min Year</label>
                      <input type="number" name="year_min" placeholder="2015" value={filters.year_min} onChange={handleFilterChange} className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a]" />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Max Year</label>
                      <input type="number" name="year_max" placeholder="2024" value={filters.year_max} onChange={handleFilterChange} className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Max Price ($)</label>
                    <input type="number" name="price_max" placeholder="e.g. 50000" value={filters.price_max} onChange={handleFilterChange} className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a]" />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">Body Type</label>
                    <select name="body_type" value={filters.body_type} onChange={handleFilterChange} className="w-full glass-input px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-[#0f172a] text-white">
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

                <button type="submit" className="w-full mt-6 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Apply Filters
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* Inventory Grid */}
        <section className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {loading && page === 0 ? "Searching..." : `${totalFound.toLocaleString()} Vehicles Found`}
            </h2>
          </div>

          {loading && page === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl h-80 animate-pulse bg-slate-800/50"></div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="glass p-16 rounded-3xl text-center border border-slate-700/50 flex flex-col justify-center items-center">
              <Search className="h-16 w-16 text-slate-500 mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No vehicles found</h3>
              <p className="text-slate-400">Try adjusting your advanced filters to broaden your search.</p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {listings.map((car, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`${car.id}-${idx}`}
                    className="glass rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all duration-300 group flex flex-col border border-slate-700/50 bg-slate-900/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                  >
                    <Link href={`/car/${car.id}`} className="block relative aspect-[4/3] bg-slate-800 overflow-hidden">
                      {car.media?.photo_links?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={car.media.photo_links[0]}
                          alt={car.heading}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                          <CarFront className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                      {car.price > 0 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-bold tracking-wide border border-white/10">
                          ${car.price.toLocaleString()}
                        </div>
                      )}
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white hover:text-brand-400 line-clamp-1 mb-1 shadow-sm">
                          <Link href={`/car/${car.id}`}>{car.heading}</Link>
                        </h3>
                        <p className="text-sm text-brand-300 font-medium tracking-wide">
                          {car.build?.body_type || "Vehicle"} &bull; {car.build?.make}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Gauge className="w-3.5 h-3.5 text-slate-500" />
                          {car.miles ? `${car.miles.toLocaleString()} mi` : "Unknown mi"}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {car.dealer ? `${car.dealer.city}, ${car.dealer.state}` : "Unknown Loc"}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {car.build?.year || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium truncate">
                          <Tag className="w-3.5 h-3.5 text-slate-500" />
                          {car.exterior_color || "Any Color"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination / Load More */}
              <div className="mt-12 flex justify-center pb-12">
                <button
                  onClick={() => fetchInventory(true)}
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl border border-slate-600 transition-colors font-medium flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                  {loading ? "Loading..." : "Load More Vehicles"}
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(99, 102, 241, 0.2);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(99, 102, 241, 0.4);
        }
      `}} />
    </div>
  );
}
