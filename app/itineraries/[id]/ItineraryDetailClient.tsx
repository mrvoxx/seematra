'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { IItinerary } from '@/types';
import { Clock, MapPin, CheckCircle, XCircle, Navigation, Hotel, Star, Users, Car, ChevronDown, LogIn } from 'lucide-react';
import Modal from '@/components/global/Modal';
import PaymentModal from '@/components/global/PaymentModal';
import RoadmapTimeline from '@/components/global/RoadmapTimeline';
import UnifiedHero from '@/components/global/UnifiedHero';
import { motion } from 'framer-motion';
import Link from 'next/link';

import SocialVideoEmbed from '@/components/global/SocialVideoEmbed';

const MapView = dynamic(() => import('@/components/global/MapView'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-surface-dark/10 animate-pulse rounded-xl" />,
});

export default function ItineraryDetailClient({ itinerary }: { itinerary: IItinerary }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen]   = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const handleBookNowClick = () => {
    if (status === 'unauthenticated') {
      setIsLoginModalOpen(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  // Generate map pins from roadmap — guard against undefined/empty arrays
  const roadmap = itinerary.roadmap ?? [];
  const tags = itinerary.tags ?? [];
  const genres = itinerary.genres ?? [];
  const vehicles = itinerary.vehicles ?? [];
  const exclusions = itinerary.exclusions ?? [];
  const pricingTiers = itinerary.pricingTiers ?? [];

  const mapPins = roadmap.map(rm => ({
    itineraryId: itinerary._id,
    title: rm.locationName,
    lat: rm.coords.lat,
    lng: rm.coords.lng,
    thumbnail: rm.image,
    price: itinerary.price,
  }));

  // Handle YouTube/Vimeo vs MP4 (hybrid video strategy)
  const isEmbed = itinerary.video?.includes('youtube') || itinerary.video?.includes('vimeo');

  const PricingCardContent = () => (
    <div className="card p-6 md:p-8 animate-fade-left shadow-xl border-t-4 border-t-primary w-full">
      <h3 className="font-outfit font-bold text-lg mb-2">Book Your Journey</h3>
      <p className="text-sm font-inter text-brand-text/60 dark:text-brand-text-dark/60 mb-6">Experience {itinerary.title} with local experts.</p>

      {/* Group Pricing Table */}
      {pricingTiers.length > 0 ? (
        <div className="mb-6 border border-brand-border dark:border-brand-border-dark rounded-xl overflow-hidden">
          <div className="bg-surface dark:bg-surface-dark px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-text/50 flex items-center gap-1.5 border-b border-brand-border dark:border-brand-border-dark">
            <Users size={12} /> Group Pricing
          </div>
          {pricingTiers.map(tier => (
            <div key={tier.persons} className="flex items-center justify-between px-4 py-3 border-b border-brand-border dark:border-brand-border-dark last:border-0 hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{tier.persons} {tier.persons === 1 ? 'Person' : 'Persons'}</span>
                {tier.vehicle && (
                  <span className="text-[10px] bg-surface-dark/10 dark:bg-surface/10 px-2 py-0.5 rounded-full text-brand-text/50 flex items-center gap-1">
                    <Car size={9} /> {tier.vehicle}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                {itinerary.hasDiscount && (
                  <div className="relative inline-block text-[10px] text-brand-text/40 dark:text-brand-text-dark/40 font-semibold mb-0.5">
                    ₹{Math.ceil(tier.totalPrice / 0.75).toLocaleString('en-IN')}
                    <motion.span
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="absolute -left-[5%] top-1/2 w-[110%] h-[1.5px] bg-red-500 origin-left -translate-y-1/2 rotate-[-6deg]"
                    />
                  </div>
                )}
                <span className="text-primary font-outfit font-bold text-sm">₹{tier.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1 mb-6 border-b border-brand-border dark:border-brand-border-dark pb-6">
          {itinerary.hasDiscount && (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white font-bold font-outfit text-xs uppercase tracking-wider px-3 py-1.5 rounded-md shadow-md transform -rotate-2 flex items-center gap-1 border border-red-400">
                  <span className="text-yellow-300">🔥</span> 25% OFF <span className="opacity-80 font-medium ml-1 hidden sm:inline">— Limited Slots!</span>
                </div>
                <div className="relative inline-block text-sm text-brand-text/40 dark:text-brand-text-dark/40 font-semibold">
                  ₹{Math.ceil(itinerary.price / 0.75).toLocaleString('en-IN')}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute -left-[5%] top-1/2 w-[110%] h-[2px] bg-red-500 origin-left -translate-y-1/2 rotate-[-6deg]"
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex items-end gap-2 mt-1">
            <span className="text-4xl font-outfit font-bold text-primary">₹{itinerary.price.toLocaleString('en-IN')}</span>
            <span className="text-sm pb-1 text-brand-text/50 dark:text-brand-text-dark/50">per person</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBookNowClick}
        className="btn-primary w-full text-lg justify-center py-4 mb-3 shadow-lg shadow-primary/30 hover:shadow-primary/50"
      >
        Book Now
      </button>

      {/* Social proof addition */}
      {(() => {
        // Seeded count from itinerary ID — stable, believable (8–24 range)
        const seed = itinerary._id ? String(itinerary._id).split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
        const bookedCount = 8 + (seed % 17);
        const avatarColors = ['bg-primary/20', 'bg-secondary/20', 'bg-accent/20'];
        return (
          <div className="flex items-center justify-center gap-2 mb-3 bg-green-500/10 text-green-700 dark:text-green-400 py-1.5 px-3 rounded-full w-fit mx-auto">
            <div className="flex -space-x-1.5">
              {avatarColors.map((color, i) => (
                <div key={i} className={`w-5 h-5 rounded-full border border-white dark:border-gray-800 ${color} flex items-center justify-center shrink-0`}>
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-brand-text/50 dark:text-brand-text-dark/50" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold">{bookedCount} booked this month</span>
          </div>
        );
      })()}

      <p className="text-xs text-center mb-6 text-brand-text/50 font-inter">
        You can choose to pay an advance online or reserve and pay on arrival.
      </p>

      <ul className="space-y-3 font-inter text-sm text-brand-text/80 dark:text-brand-text-dark/80">
        <li className="flex items-start gap-3"><CheckCircle size={18} className="text-green-500 shrink-0" /> Accommodations Included</li>
        <li className="flex items-start gap-3"><CheckCircle size={18} className="text-green-500 shrink-0" /> Transport & Guide</li>
        <li className="flex items-start gap-3"><CheckCircle size={18} className="text-green-500 shrink-0" /> 24/7 Dedicated Support</li>
        <li className="flex items-start gap-3"><CheckCircle size={18} className="text-green-500 shrink-0" /> Permits where required</li>
      </ul>
    </div>
  );

  return (
    <div className="w-full overflow-x-hidden">
      <UnifiedHero
        title={itinerary.title}
        subtitle={tags.length > 0 ? tags.join(' • ') : itinerary.duration}
        backgroundImage={itinerary.thumbnail}
        showCanvas={true}
      />

      <div className="container mx-auto px-4 lg:px-8 mt-[-60px] relative z-20">
        {/* Badges + CTA row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">

          {/* Left: genre & duration badges */}
          <div className="flex flex-wrap gap-2">
            {genres.map(g => <span key={g} className="badge-primary">{g}</span>)}
            <span className="badge-secondary flex items-center gap-1"><Clock size={12} /> {itinerary.duration}</span>
          </div>

          {/* Right: CTA buttons */}
          <div className="flex items-center gap-2">
            {/* WhatsApp Enquire */}
            <a
              href={`https://wa.me/qr/IP26U77IWO5GO1?text=${encodeURIComponent(`Hi, I'm interested in the "${itinerary.title}" package. Could you share more details and pricing?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-poppins font-semibold tracking-wide transition-all duration-200 active:scale-95 border"
              style={{
                background: 'rgba(37,211,102,0.10)',
                borderColor: 'rgba(37,211,102,0.40)',
                color: '#128C7E',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366', flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.611.611l6.053-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.001-1.366l-.36-.213-3.724.902.919-3.626-.234-.373A9.818 9.818 0 1112 21.818z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span> Enquire
            </a>

            <span className="text-brand-text/50 text-xs font-poppins select-none">or</span>

            {/* Book Now */}
            <button
              onClick={handleBookNowClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-poppins font-semibold tracking-wide bg-primary text-white transition-all duration-200 hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
            >
              Book Now →
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Column: Content */}
        <div className="flex-1">
          <section className="mb-12">
            <h2 className="text-xl font-boldonse font-normal leading-snug mb-6 border-l-4 border-primary pl-4">Overview</h2>
            <div
              className="iti-desc prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: itinerary.description }}
            />
            {/* Mobile Pricing Section */}
            <div className="mt-12 mb-24 block lg:hidden">
              <PricingCardContent />
              <div className="flex flex-col items-center justify-center mt-8 text-brand-text/50 dark:text-brand-text-dark/50 animate-bounce">
                <span className="text-xs uppercase tracking-widest font-semibold mb-2">Scroll to see Roadmap</span>
                <ChevronDown size={24} />
              </div>
            </div>
          </section>

               {/* Transport + Accommodation — side-by-side on desktop, stacked on mobile */}
          {((vehicles.length > 0 || pricingTiers.some(t => t.vehicle)) || (itinerary.hotels && itinerary.hotels.length > 0)) && (
            <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* ── Transport ────────────────────────────────── */}
              {(vehicles.length > 0 || pricingTiers.some(t => t.vehicle)) && (
                <section>
                  <h2 className="text-xl font-boldonse font-normal leading-snug mb-2 border-l-4 border-primary pl-4">Transport Included</h2>
                  <p className="text-sm font-inter text-brand-text/60 dark:text-brand-text-dark/60 mb-4 pl-1">
                    Vehicle assigned at booking based on group size.
                  </p>

                  {pricingTiers.some(t => t.vehicle) ? (
                    <div className="grid grid-cols-2 gap-2">
                      {pricingTiers.filter(t => t.vehicle).map(tier => {
                        const vehicleDetail = vehicles.find(
                          v => v.name?.toLowerCase() === tier.vehicle?.toLowerCase()
                        ) || vehicles[0];
                        return (
                          <div
                            key={tier.persons}
                            className="card border border-brand-border dark:border-brand-border-dark flex flex-col overflow-hidden hover:border-primary/40 transition-colors"
                          >
                            {/* Full vehicle photo — matches accommodation style */}
                            <div className="relative w-full h-24 shrink-0 bg-surface-dark/10">
                              {vehicleDetail?.image ? (
                                <img
                                  src={vehicleDetail.image}
                                  alt={tier.vehicle!}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface dark:bg-surface-dark">
                                  <Car size={28} className="text-brand-text/20" />
                                </div>
                              )}
                              {/* Group size badge — top right */}
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                <Users size={8} />{tier.persons}P
                              </div>
                              {/* Vehicle type badge — top left */}
                              <div className="absolute top-1.5 left-1.5 badge-primary flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 shadow">
                                <Car size={7} /> {(tier.vehicle ?? '').split(' ')[0]}
                              </div>
                            </div>

                            {/* Info body */}
                            <div className="p-2.5 flex flex-col gap-1">
                              <h3 className="text-xs font-outfit font-bold leading-tight line-clamp-1">{tier.vehicle}</h3>
                              {vehicleDetail?.capacity && (
                                <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                                  <Users size={9} className="shrink-0" />
                                  Seats {vehicleDetail.capacity}
                                </div>
                              )}
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                                <CheckCircle size={7} /> Included
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback vehicle list */
                    <div className="grid grid-cols-2 gap-2">
                      {vehicles.map(v => (
                        <div key={v.name} className="card border border-brand-border dark:border-brand-border-dark flex flex-col overflow-hidden">
                          <div className="relative w-full h-24 bg-surface-dark/10">
                            {v.image ? (
                              <img src={v.image} alt={v.name} className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-surface dark:bg-surface-dark">
                                <Car size={28} className="text-brand-text/20" />
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 flex flex-col gap-1">
                            <h3 className="text-xs font-outfit font-bold leading-tight line-clamp-1">{v.name}</h3>
                            {v.capacity && (
                              <div className="text-[10px] text-primary font-bold flex items-center gap-1">
                                <Users size={9} />Seats {v.capacity}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── Accommodations ──────────────────────────── */}
              {itinerary.hotels && itinerary.hotels.length > 0 && (
                <section>
                  <h2 className="text-xl font-boldonse font-normal leading-snug mb-2 border-l-4 border-primary pl-4">Accommodations</h2>
                  <p className="text-sm font-inter text-brand-text/60 dark:text-brand-text-dark/60 mb-4 pl-1">
                    Rooms arranged by group size — confirmed at booking.
                  </p>

                  {pricingTiers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {pricingTiers.map(tier => {
                        // Use hotelIndex from tier if set, else fall back to hotel[0]
                        const hotelIdx = (tier as any).hotelIndex ?? 0;
                        const hotel = itinerary.hotels![hotelIdx] ?? itinerary.hotels![0];
                        if (!hotel) return null;
                        const roomLabel = tier.persons === 1
                          ? '1 Single Room'
                          : tier.persons === 2
                          ? '1 Double Room'
                          : `${Math.ceil(tier.persons / 2)} Rooms`;
                        return (
                          <div key={tier.persons} className="card border border-brand-border dark:border-brand-border-dark flex flex-col overflow-hidden hover:border-primary/40 transition-colors">
                            <div className="relative w-full h-24 shrink-0 bg-surface-dark/10">
                              {hotel.images && hotel.images[0] ? (
                                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-brand-text/30 bg-surface dark:bg-surface-dark">
                                  <Hotel size={22} />
                                </div>
                              )}
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                <Users size={8} />{tier.persons}P
                              </div>
                              {hotel.rating && (
                                <div className="absolute top-1.5 left-1.5 badge-primary flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 shadow">
                                  <Star size={7} fill="currentColor" /> {hotel.rating}
                                </div>
                              )}
                            </div>
                            <div className="p-2.5 flex flex-col gap-1">
                              <h3 className="text-xs font-outfit font-bold leading-tight line-clamp-1">{hotel.name}</h3>
                              <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                                <Hotel size={9} className="shrink-0" />
                                {roomLabel}
                              </div>
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                                <CheckCircle size={7} /> Included
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback: show all hotels when no pricing tiers defined */
                    <div className="grid grid-cols-2 gap-2">
                      {itinerary.hotels.map((hotel, i) => (
                        <div key={i} className="card border border-brand-border dark:border-brand-border-dark flex flex-col overflow-hidden">
                          <div className="relative w-full h-24 shrink-0 bg-surface-dark/10">
                            {hotel.images && hotel.images[0] ? (
                              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-text/30 bg-surface dark:bg-surface-dark">
                                <Hotel size={22} />
                              </div>
                            )}
                            {hotel.rating && (
                              <div className="absolute top-1.5 left-1.5 badge-primary flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 shadow">
                                <Star size={7} fill="currentColor" /> {hotel.rating}
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 flex flex-col gap-1">
                            <h3 className="text-xs font-outfit font-bold leading-tight line-clamp-1">{hotel.name}</h3>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                              <CheckCircle size={7} /> Included
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

            </div>
          )}

          {/* Roadmap */}
          <section className="mb-12 relative">
            <h2 className="text-xl font-boldonse font-normal leading-snug mb-6 border-l-4 border-primary pl-4">Itinerary Roadmap</h2>
            <RoadmapTimeline points={itinerary.roadmap} />
          </section>

          {/* Journey Preview */}
          {itinerary.video && (
            <section className="mb-12">
              <h2 className="text-xl font-boldonse font-normal leading-snug mb-6 border-l-4 border-primary pl-4">Journey Preview</h2>
              <SocialVideoEmbed url={itinerary.video} />
            </section>
          )}

          {/* Inclusions */}
          {itinerary.inclusions && itinerary.inclusions.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-boldonse font-normal leading-snug mb-6 border-l-4 border-primary pl-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itinerary.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface/50 dark:bg-surface-dark/50 p-4 rounded-xl border border-brand-border dark:border-brand-border-dark">
                    <CheckCircle className="text-green-500 shrink-0" size={20} />
                    <span className="font-inter text-brand-text/80 dark:text-brand-text-dark/80">{inc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Exclusions */}
          {exclusions.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-boldonse font-normal leading-snug mb-6 border-l-4 border-red-400 pl-4">What's Not Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exclusions.map((exc, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface/50 dark:bg-surface-dark/50 p-4 rounded-xl border border-red-200 dark:border-red-900/40">
                    <XCircle className="text-red-400 shrink-0" size={20} />
                    <span className="font-inter text-brand-text/80 dark:text-brand-text-dark/80">{exc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Route Map */}
          {mapPins.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-boldonse font-normal leading-snug mb-6 border-l-4 border-primary pl-4">Route Map</h2>
              <MapView pins={mapPins} height="h-[500px]" interactive={false} />
            </section>
          )}

          {/* Bottom CTA */}
          <section className="mb-12 mt-12 bg-primary/10 dark:bg-primary/5 rounded-2xl p-8 border border-primary/20 text-center flex flex-col items-center">
            <h2 className="text-xl font-boldonse font-normal leading-snug mb-4">Ready to start your journey?</h2>
            <p className="font-inter text-brand-text/70 dark:text-brand-text-dark/70 mb-6 max-w-lg">
              Secure your spot today with a simple 40% advance payment. Limited slots available for upcoming dates!
            </p>
            <button
              onClick={handleBookNowClick}
              className="btn-primary py-4 px-10 text-lg shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Book Your Adventure Now
            </button>
          </section>

        </div>

        {/* Right Column: Sticky Pricing Card */}
        <div className="hidden lg:block w-full lg:w-[400px]">
          <div className="sticky top-28">
            <PricingCardContent />
          </div>
        </div>
      </div>

      {/* Removed FullWidthRecommendations; it is now rendered server-side in page.tsx for SEO internal linking */}

      {/* Mobile Fixed Book Now Button — sits above bottom nav bar */}
      <div className="fixed bottom-20 right-4 z-40 block lg:hidden pointer-events-none">
        <button
          onClick={handleBookNowClick}
          className="btn-primary shadow-xl shadow-primary/40 px-6 py-3 text-sm rounded-full font-bold animate-bounce hover:animate-none pointer-events-auto"
        >
          Book Now →
        </button>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Complete Booking"
      >
        <PaymentModal
          itinerary={{ _id: itinerary._id, title: itinerary.title, price: itinerary.price, pricingTiers }}
          onSuccess={(id) => {
            setIsPaymentModalOpen(false);
            window.location.href = `/booking-confirmation/${id}`;
          }}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      </Modal>

      {/* ── Login Prompt Modal ───────────────────────────────────── */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Sign in to Book"
      >
        <div className="flex flex-col items-center gap-5 py-2">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LogIn size={28} className="text-primary" />
          </div>

          <div className="text-center">
            <h3 className="font-outfit font-bold text-lg mb-1">One step away!</h3>
            <p className="font-inter text-sm text-brand-text/65 dark:text-brand-text-dark/65 leading-relaxed">
              Sign in to securely book <strong className="text-brand-text dark:text-brand-text-dark">{itinerary.title}</strong>.<br />
              Your trip details will be saved automatically.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={() => signIn('google', { callbackUrl: window.location.href })}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-brand-border dark:border-brand-border-dark bg-surface dark:bg-surface-dark hover:border-primary/50 transition-all font-outfit font-semibold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-brand-border dark:bg-brand-border-dark" />
            <span className="text-xs text-brand-text/40 font-inter">or</span>
            <div className="flex-1 h-px bg-brand-border dark:bg-brand-border-dark" />
          </div>

          <Link
            href={`/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
            className="btn-secondary w-full text-center py-2.5 text-sm"
            onClick={() => setIsLoginModalOpen(false)}
          >
            Sign in with Email
          </Link>

          <p className="text-[11px] text-brand-text/40 font-inter text-center">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">Terms</Link>
            {' '}&{' '}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
          </p>
        </div>
      </Modal>
    </div>
  );
}
