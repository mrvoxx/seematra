'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { IItinerary } from '@/types';
import { Clock, MapPin, CheckCircle, XCircle, Navigation, Hotel, Star, Users, Car, ChevronDown } from 'lucide-react';
import Modal from '@/components/global/Modal';
import PaymentModal from '@/components/global/PaymentModal';
import RoadmapTimeline from '@/components/global/RoadmapTimeline';
import UnifiedHero from '@/components/global/UnifiedHero';
import { motion } from 'framer-motion';

import SocialVideoEmbed from '@/components/global/SocialVideoEmbed';
import FullWidthRecommendations from '@/components/global/FullWidthRecommendations';

const MapView = dynamic(() => import('@/components/global/MapView'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-surface-dark/10 animate-pulse rounded-xl" />
});

export default function ItineraryDetailClient({ itinerary }: { itinerary: IItinerary }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const handleBookNowClick = () => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
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
      <div className="flex items-center justify-center gap-2 mb-3 bg-green-500/10 text-green-700 dark:text-green-400 py-1.5 px-3 rounded-full w-fit mx-auto">
        <div className="flex -space-x-2">
          <img className="w-5 h-5 rounded-full border border-white dark:border-gray-800" src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
          <img className="w-5 h-5 rounded-full border border-white dark:border-gray-800" src="https://randomuser.me/api/portraits/women/44.jpg" alt="avatar" />
          <img className="w-5 h-5 rounded-full border border-white dark:border-gray-800" src="https://randomuser.me/api/portraits/men/46.jpg" alt="avatar" />
        </div>
        <span className="text-[11px] font-bold">23 people booked this month</span>
      </div>

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
              className="prose dark:prose-invert max-w-none font-inter text-brand-text/80 dark:text-brand-text-dark/80"
              dangerouslySetInnerHTML={{ __html: itinerary.description }}
            />
            {/* Mobile Pricing Section */}
            <div className="mt-12 block lg:hidden">
              <PricingCardContent />
              <div className="flex flex-col items-center justify-center mt-8 text-brand-text/50 dark:text-brand-text-dark/50 animate-bounce">
                <span className="text-xs uppercase tracking-widest font-semibold mb-2">Scroll to see Roadmap</span>
                <ChevronDown size={24} />
              </div>
            </div>
          </section>



          {/* Transportation — per group size assignment */}
          {(vehicles.length > 0 || pricingTiers.some(t => t.vehicle)) && (
            <div className="mb-12">
              <section>
                <h2 className="text-xl font-boldonse font-normal leading-snug mb-4 border-l-4 border-primary pl-4">Transport Included</h2>
                <p className="text-sm font-inter text-brand-text/60 dark:text-brand-text-dark/60 mb-5 pl-1">
                  Your transport is arranged based on your group size — the vehicle assigned at the time of booking.
                </p>

                {/* Per-group-size vehicle assignment table */}
                {pricingTiers.some(t => t.vehicle) ? (
                  <div className="space-y-3">
                    {pricingTiers.filter(t => t.vehicle).map(tier => {
                      // Find matching vehicle details from vehicles array
                      const vehicleDetail = vehicles.find(
                        v => v.name?.toLowerCase() === tier.vehicle?.toLowerCase()
                      ) || vehicles[0];
                      return (
                        <div
                          key={tier.persons}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border border-brand-border dark:border-brand-border-dark bg-surface/60 dark:bg-surface-dark/60 hover:border-primary/40 transition-colors"
                        >
                          {/* Group size badge */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                              <Users size={14} className="text-primary mb-0.5" />
                              <span className="text-primary font-bold font-outfit text-sm leading-none">{tier.persons}</span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-brand-text/50 uppercase tracking-wider">Group of</div>
                              <div className="text-sm font-bold">{tier.persons} {tier.persons === 1 ? 'Person' : 'Persons'}</div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="hidden sm:flex text-brand-text/20 text-lg shrink-0">→</div>

                          {/* Vehicle info */}
                          <div className="flex items-center gap-4 flex-1">
                            {vehicleDetail?.image ? (
                              <img
                                src={vehicleDetail.image}
                                alt={tier.vehicle!}
                                className="w-24 h-14 object-cover rounded-xl shrink-0 shadow-sm"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-24 h-14 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                                <Car size={28} className="text-secondary/50" />
                              </div>
                            )}
                            <div>
                              <div className="font-outfit font-bold text-base">{tier.vehicle}</div>
                              {vehicleDetail?.capacity && (
                                <div className="text-xs text-brand-text/50 font-inter mt-0.5 flex items-center gap-1">
                                  <Users size={10} /> Seats up to {vehicleDetail.capacity} persons
                                </div>
                              )}
                              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle size={9} /> Included in package
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback: show vehicle cards if no tier mapping exists */
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vehicles.map(v => (
                      <div key={v.name} className="card p-4 text-center flex flex-col items-center justify-center gap-2">
                        <Navigation className="text-secondary" />
                        <div className="text-base font-bold font-outfit uppercase mt-2">{v.name}</div>
                        <div className="text-xs text-brand-text/50">Seats: {v.capacity}</div>
                        {v.image ? (
                          <img src={v.image} alt={v.name} className="mt-3 rounded-lg w-full object-cover h-28"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="mt-3 rounded-lg w-full h-28 bg-secondary/10 flex items-center justify-center">
                            <Navigation size={28} className="text-secondary/40" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}



          {/* Accommodations */}
          {itinerary.hotels && itinerary.hotels.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-boldonse font-normal leading-snug mb-4 border-l-4 border-primary pl-4">Accommodations</h2>

              {/* Per-booking room arrangement callout */}
              <div className="mb-5 flex flex-wrap gap-3">
                {pricingTiers.length > 0 ? (
                  pricingTiers.map(tier => (
                    <div
                      key={tier.persons}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-border dark:border-brand-border-dark bg-surface/60 dark:bg-surface-dark/60 text-xs font-inter"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Users size={12} className="text-primary" />
                      </div>
                      <div>
                        <span className="font-bold">{tier.persons} {tier.persons === 1 ? 'Person' : 'Persons'}</span>
                        <span className="text-brand-text/50 dark:text-brand-text-dark/50 ml-1.5">→</span>
                        <span className="ml-1.5 text-brand-text/70 dark:text-brand-text-dark/70">
                          {tier.persons === 1 ? '1 single room' : tier.persons === 2 ? '1 double room' : `${Math.ceil(tier.persons / 2)} rooms`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-brand-border dark:border-brand-border-dark bg-surface/60 dark:bg-surface-dark/60 text-xs font-inter text-brand-text/70 dark:text-brand-text-dark/70">
                    <Hotel size={13} className="text-primary" />
                    Rooms arranged per group — confirmed at booking
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {itinerary.hotels.map((hotel, i) => (
                  <div key={i} className="card p-5 border border-brand-border dark:border-brand-border-dark flex flex-col md:flex-row gap-5">
                    <div className="h-44 md:h-auto md:w-56 shrink-0 rounded-xl overflow-hidden bg-surface-dark/10 relative">
                      {hotel.images && hotel.images[0] ? (
                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-brand-text/30 bg-surface dark:bg-surface-dark">
                          <Hotel size={36} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 badge-primary flex items-center gap-1 shadow-lg">
                        <Star size={10} fill="currentColor" /> {hotel.rating}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 justify-center gap-2">
                      <h3 className="text-base font-outfit font-bold flex items-center gap-2">
                        <Hotel size={16} className="text-primary shrink-0" /> {hotel.name}
                      </h3>
                      {hotel.description && (
                        <p className="font-inter text-sm text-brand-text/70 dark:text-brand-text-dark/70 leading-relaxed">
                          {hotel.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle size={9} /> Included in package
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          <Users size={9} /> Rooms as per group size
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

      {/* Full Width Recommendations placed outside the grid so cards can expand completely */}
      <div className="container mx-auto px-4 lg:px-8 pb-20">
        <section className="mt-16 pt-12 border-t border-brand-border dark:border-brand-border-dark">
          <FullWidthRecommendations currentItineraryId={itinerary._id} />
        </section>
      </div>

      {/* Mobile Fixed Book Now Button */}
      <div className="fixed bottom-4 right-4 z-40 block lg:hidden pointer-events-none">
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
    </div>
  );
}
