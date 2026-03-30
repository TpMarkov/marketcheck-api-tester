"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  CheckCircle2,
  CarFront,
  ArrowRight,
  Globe,
  Award,
  Users,
  Search,
  Zap,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

export default function AboutPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
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
            <Link href="/" className="hover:opacity-50 transition">Inventory</Link>
            <Link href="/" className="hover:opacity-50 transition">Sell</Link>
            <Link href="/" className="hover:opacity-50 transition">Finance</Link>
            <Link href="/about" className="opacity-50 pointer-events-none">About</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-black" /> Global Reach</span>
          </div>
        </div>
      </nav>

      <main>
        {/* Luxury Hero Section */}
        <header className="relative h-[90vh] flex items-center bg-black overflow-hidden">
          {/* Parallax Background */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2400"
              alt="Sleek premium automotive design"
              fill
              className="object-cover opacity-60"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent"></div>
          </motion.div>

          <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Our Vision</span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase text-white mb-8 leading-[0.85] md:leading-[0.8]"
              >
                The Future <br />
                <span className="text-white/30 italic lowercase tracking-normal font-normal serif">of Automotive</span> <br />
                Transparency
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl text-white/70 max-w-2xl leading-relaxed mb-12 serif italic font-medium"
              >
                AutoSphere isn&apos;t just a marketplace. We&apos;re a data-driven engine empowering buyers, dealers, and professionals with real-time market clarity.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
                <Link
                  href="/"
                  className="group bg-white text-black px-10 py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 hover:bg-gray-100 transition-all shadow-2xl"
                >
                  Explore Inventory <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 right-12 flex items-center gap-4 hidden lg:flex flex-row-reverse"
          >
            <div className="w-px h-12 bg-white/20 relative overflow-hidden">
              <motion.div
                animate={{ y: [0, 48, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-1/2 bg-white"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Scroll to Explore</span>
          </motion.div>
        </header>

        {/* Brand Pillars - Glassmorphic Cards */}
        <section className="py-32 bg-white border-b border-gray-100">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end mb-24">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 block mb-6">Our Philosophy</span>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.9]">
                  Integrity Through <br /> Technical Precision
                </h2>
              </div>
              <p className="text-xl text-gray-500 serif italic max-w-xl">
                We bridge the gap between complex market analytics and effortless user experiences, creating a standard of trust in every transaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Market Velocity",
                  desc: "Real-time sync with millions of listings ensuring you catch every price shift the moment it happens.",
                  icon: TrendingUp
                },
                {
                  title: "Deep Verification",
                  desc: "Every VIN is decoded and analyzed against historical data to ensure absolute authenticity and value.",
                  icon: ShieldCheck
                },
                {
                  title: "Global Standards",
                  desc: "Unifying automotive data standards from across North America into one seamless, intuitive interface.",
                  icon: Award
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="group p-10 bg-gray-50 border border-gray-100 hover:border-black transition-all duration-500 rounded-sm"
                >
                  <item.icon className="w-10 h-10 mb-8 stroke-[1.5px] group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Immersive Data Section */}
        <section className="py-32 bg-black text-white overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 block mb-6">Built for Insights</span>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-12 leading-[0.9]">
                  Unparalleled <br />Market Intelligence
                </h2>

                <div className="space-y-12">
                  {[
                    { label: "Active Listings", value: "2.4M+", icon: Search },
                    { label: "Data Points Analyzed Daily", value: "15M+", icon: Zap },
                    { label: "Dealer Network", value: "85k+", icon: Users }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                      <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm group-hover:bg-white group-hover:text-black transition-colors duration-500">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold tracking-tighter mb-1">{stat.value}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="relative aspect-square">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
                    alt="Advanced automotive diagnostics"
                    fill
                    className="object-cover opacity-40 mix-blend-luminosity grayscale contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow m-12" />
                  <div className="absolute inset-0 border border-white/5 rounded-full animate-reverse-spin m-24" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery - Cinematic Showcase */}
        <section className="py-32 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 block mb-6">Gallery</span>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.9]">
                  Cinematic Market <br />Highlights
                </h2>
              </div>
              <p className="text-gray-500 serif italic max-w-sm mb-2">
                A glimpse into the calibre of inventory our platform monitors every second of every day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[800px]">
              <div className="md:col-span-8 relative group overflow-hidden rounded-sm">
                <Image
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1600"
                  alt="Classic luxury vehicle"
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white border-b border-white pb-1">View Market Data</span>
                </div>
              </div>
              <div className="md:col-span-4 grid grid-rows-2 gap-8">
                <div className="relative group overflow-hidden rounded-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
                    alt="Heritage muscle car"
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white border-b border-white pb-1">Detail View</span>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"
                    alt="Modern executive vehicle"
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white border-b border-white pb-1">Spec Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA - Statement Section */}
        <section className="py-48 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-12 leading-[0.9]">
                Start Your <br />Search Today
              </h2>
              <p className="text-xl text-gray-500 serif italic mb-16 max-w-2xl mx-auto font-medium">
                Whether you&apos;re hunting for a deal, analyzing competition, or discovering your dream drive — clarity is just a click away.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-6 text-2xl font-bold tracking-tighter uppercase border-b-2 border-black pb-4 hover:opacity-50 transition-all group"
              >
                <span>Enter Marketplace</span>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform duration-500" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-sm space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
                <CarFront className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tighter uppercase">AutoSphere</span>
            </Link>
            <p className="text-gray-400 serif italic leading-relaxed font-medium">
              Redefining the automotive marketplace through curated excellence and unparalleled digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-24 gap-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Inventory</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-black transition">New Arrivals</Link></li>
                <li><Link href="/" className="hover:text-black transition">Electric</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Company</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/about" className="text-black pointer-events-none">Our Story</Link></li>
                <li><Link href="/about" className="hover:text-black transition">Careers</Link></li>
                <li><Link href="/about" className="hover:text-black transition">Press</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Support</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-black transition">Contact</Link></li>
                <li><Link href="/about" className="hover:text-black transition">FAQ</Link></li>
                <li><Link href="/about" className="hover:text-black transition">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-24 pt-12 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <span>&copy; 2026 AutoSphere</span>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-black transition">Instagram</Link>
            <Link href="/" className="hover:text-black transition">Twitter</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
