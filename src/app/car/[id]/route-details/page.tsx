"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CarFront,
  Anchor,
  Ship,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Info,
  DollarSign,
  Truck,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface RouteData {
  carName: string;
  carPrice: number;
  carImage: string;
  carBodyType: string;
  inlandTransport: number;
  oceanShipping: number;
  duty: number;
  vat: number;
  otherFees: number;
  total: number;
  totalEUR: number;
  port: string;
  distance: number;
  priority: string;
  method: string;
  exchangeRate: number;
  carId: string;
}

function getTransitDays(priority: string): string {
  if (priority === "high") return "10–14 days";
  if (priority === "medium") return "14–18 days";
  return "20–28 days";
}

function getHubPort(priority: string): string {
  if (priority === "high") return "Rotterdam / Hamburg";
  if (priority === "medium") return "Rotterdam / Antwerp";
  return "Rotterdam (via Panama Canal)";
}

function RouteDetailsContent() {
  const params = useSearchParams();
  const [data, setData] = useState<RouteData | null>(null);

  useEffect(() => {
    // Try URL params first, then localStorage
    const raw = params.get("data");
    if (raw) {
      try {
        setData(JSON.parse(decodeURIComponent(raw)));
        return;
      } catch { }
    }
    const stored = localStorage.getItem("routeDetailsData");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch { }
    }
  }, [params]);

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <CarFront className="w-12 h-12 mx-auto text-gray-300 animate-pulse" />
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">No route data found</p>
          <Link href="/" className="text-xs underline text-gray-500">← Back to Inventory</Link>
        </div>
      </div>
    );
  }

  const transitDays = getTransitDays(data.priority);
  const hubPort = getHubPort(data.priority);

  const costs = [
    { label: "Car Price", value: data.carPrice },
    { label: "Inland Transport (USA)", value: data.inlandTransport },
    {
      label: `Ocean Shipping (${data.carBodyType || "Standard"}, ${data.method === "container" ? "Container" : "RoRo"})`,
      value: data.oceanShipping,
    },
    { label: "Customs Duty (10%)", value: data.duty },
    { label: "VAT (20%)", value: data.vat },
    { label: "Processing & Port Fees", value: data.otherFees },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black flex items-center justify-center text-white rounded-sm group-hover:scale-110 transition-transform">
              <CarFront className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">AutoSphere</span>
          </Link>

          <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link href="/" className="hover:opacity-50 transition">Inventory</Link>
            <span className="opacity-50">Shipping</span>
            <Link href="/about" className="hover:opacity-50 transition">About</Link>
          </div>

          <Link
            href={`/car/${data.carId}`}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:opacity-60 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Car
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Car Header Section */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">
              <span className="w-8 h-px bg-gray-300"></span>
              Import Route Details
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6 leading-[0.9]">
              {data.carName}
            </h1>
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-3xl font-bold tracking-tight">${data.carPrice.toLocaleString()}</span>
              <span className="text-gray-400 text-sm uppercase tracking-widest font-bold">Base Price</span>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route:</span>
              <span className="text-xs font-bold uppercase">{data.port}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-xs font-bold uppercase">{hubPort}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-xs font-bold uppercase">Varna / Burgas, BG</span>
            </div>
            <div className="flex gap-4">
              <div className="bg-black text-white px-6 py-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-bold uppercase text-[10px] tracking-widest">Est. Transit: {transitDays}</span>
              </div>
              <div className="border border-gray-200 px-6 py-3 flex items-center gap-2">
                <Ship className="w-4 h-4 text-gray-500" />
                <span className="font-bold uppercase text-[10px] tracking-widest text-gray-600">
                  {data.method === "container" ? "Container Ship" : "RoRo Vessel"}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-video lg:aspect-square overflow-hidden bg-gray-100 rounded-sm"
          >
            {data.carImage ? (
              <Image
                src={data.carImage}
                alt={data.carName}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <CarFront className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Shipping Route Visualization */}
          <section className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tighter uppercase">Shipping Route</h2>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Global Logistics
              </div>
            </div>

            {/* Route Map Visual */}
            <div className="relative aspect-[21/9] bg-gray-50 border border-gray-100 rounded-sm overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000"
                alt="Route Map"
                fill
                className="object-cover opacity-20 grayscale group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-2xl px-12">
                  <div className="absolute top-1/2 left-12 right-12 border-t border-dashed border-black/20 -translate-y-1/2" />
                  <div className="relative flex justify-between items-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                        {data.port.replace("Port of ", "")}
                      </span>
                    </div>

                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-black shadow-sm"
                    >
                      <Ship className="w-4 h-4" />
                    </motion.div>

                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-xl">
                        <Anchor className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Varna, BG</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Steps */}
            <ul className="space-y-6">
              {[
                {
                  icon: <Truck className="w-5 h-5" />,
                  title: `Departure: ${data.port.replace("Port of ", "")}`,
                  detail: `Inland Distance: ${data.distance.toLocaleString()} mi — Cost: $${data.inlandTransport.toLocaleString()}`,
                  status: "Origin",
                },
                {
                  icon: <Ship className="w-5 h-5" />,
                  title: `Ocean Shipping to ${hubPort}`,
                  detail: `Transatlantic ${data.method === "container" ? "Container" : "RoRo"} Service — Est. ${transitDays}`,
                  status: "Transit",
                },
                {
                  icon: <Anchor className="w-5 h-5" />,
                  title: "Arrival at Varna / Burgas Port",
                  detail: "Bulgaria Customs Processing — Duty 10% + VAT 20%",
                  status: "Destination",
                },
              ].map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 p-6 border border-gray-100 hover:border-black transition-colors group"
                >
                  <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-sm group-hover:bg-black group-hover:text-white transition-colors">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{step.status}</div>
                    <div className="font-bold uppercase tracking-tight">{step.title}</div>
                    <div className="text-sm text-gray-500 italic">{step.detail}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                </motion.li>
              ))}
            </ul>
          </section>

          {/* Landed Cost Breakdown */}
          <section className="space-y-8">
            <div className="bg-gray-50 p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-10">
                <DollarSign className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tighter uppercase">Landed Cost</h2>
              </div>

              <div className="space-y-4 mb-10">
                {costs.map((cost, i) => (
                  <div key={i} className="flex justify-between items-center py-3.5 border-b border-gray-200 last:border-0">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 pr-4">{cost.label}</span>
                    <span className="font-mono text-sm font-bold shrink-0">${cost.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t-2 border-black space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Total Landed Cost</span>
                  <span className="text-3xl font-bold tracking-tighter">${data.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Approx. EUR</span>
                  <span className="font-bold tracking-tight text-indigo-700">~{data.totalEUR.toLocaleString()} EUR</span>
                </div>
                {data.exchangeRate && (
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-[9px] font-bold uppercase tracking-widest">Exchange Rate</span>
                    <span className="text-[9px] font-bold">1 USD = {data.exchangeRate.toFixed(4)} EUR</span>
                  </div>
                )}
              </div>

              <div className="mt-8 p-5 bg-white border border-gray-100 flex items-start gap-4">
                <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-gray-500 uppercase tracking-widest font-medium">
                  Based on live exchange rates and standard port fees. Final costs may vary.
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-5 border border-amber-100 bg-amber-50/30 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed italic">
                Estimated values. Actual costs may vary based on final route, live port fees, and exchange rates at time of processing.
              </p>
            </div>

            {/* Back Button */}
            <Link
              href={`/car/${data.carId}`}
              className="flex items-center justify-center gap-2 w-full py-4 border border-gray-200 font-bold uppercase text-[11px] tracking-widest hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vehicle
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white rounded-sm">
              <CarFront className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tighter uppercase">AutoSphere</span>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            © 2026 AutoSphere Logistics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function RouteDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <CarFront className="w-12 h-12 text-gray-300 animate-pulse" />
      </div>
    }>
      <RouteDetailsContent />
    </Suspense>
  );
}
