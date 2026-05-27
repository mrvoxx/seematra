import { Metadata } from 'next';
import Image from 'next/image';
import { Heart, Star, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Seematra | Curating Himalayan Experiences',
  description: 'Learn about Seematra, your premier travel partner in Uttarakhand. Meet the experts behind our adventure, spiritual, and luxury tours.',
};

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* ─── Hero Section ─── */}
      <section className="relative h-[50vh] lg:h-screen w-full overflow-hidden flex items-center justify-center pt-16 isolate">
        <div className="absolute inset-0 z-[-2]">
          <Image src="https://res.cloudinary.com/ddthsmqk8/image/upload/v1779136949/seematra/backgrounds/about.jpg" alt="About Seematra" fill className="object-cover" priority />
        </div>
        <div className="absolute inset-0 z-[-1] bg-black/50" />
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-black/20 to-surface dark:to-surface-dark" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-outfit font-extrabold mb-4 text-white drop-shadow-sm">
            About <span className="text-primary">Seematra</span>
          </h1>
          <p className="text-base md:text-lg font-inter text-white/85 max-w-2xl mx-auto drop-shadow-sm">
            Helping You Experience Uttarakhand, Not Just Visit It
          </p>
        </div>
      </section>

      {/* ─── Content ─── */}
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24 animate-fade-up">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl h-[450px] lg:h-[600px] relative w-full border border-brand-border/50 dark:border-brand-border-dark/50">
              <Image
                src="/owner.jpeg"
                alt="Seematra Founder"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="font-boldonse text-xl tracking-wide">Ashwin Kishor Dangwal</p>
                <p className="font-poppins text-xs uppercase tracking-widest text-white/80 mt-1">Founder, Seematra</p>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-10" />
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* The Vision (Quote) */}
            <div className="relative">
              <span className="absolute -top-10 -left-6 text-8xl font-serif text-primary/10 dark:text-primary/5 select-none leading-none">"</span>
              <h2 className="text-3xl md:text-4xl font-boldonse font-normal text-brand-text dark:text-brand-text-dark mb-4 leading-snug">
                Experiencing the Soul of Uttarakhand
              </h2>
              <p className="text-lg md:text-xl font-poppins text-brand-text/70 dark:text-brand-text-dark/70 font-light leading-relaxed">
                Seematra was created to help travelers experience Uttarakhand through thoughtfully handmade curated itineraries. Founded by Ashwin, a B.Tech CSE student at Graphic Era Hill University, the platform takes care of everything behind the scenes — from bookings and stays to activities and local experiences — so travelers can simply enjoy the journey.
              </p>
            </div>

            {/* Behind the Name */}
            <div className="card p-6 md:p-8 bg-surface/50 dark:bg-surface-dark/50 border-l-4 border-l-accent flex flex-col gap-3">
              <h3 className="font-boldonse text-xl md:text-2xl tracking-wide flex items-center gap-2">
                <Heart size={20} className="text-accent" /> Behind the Name
              </h3>
              <p className="font-poppins text-sm md:text-base text-brand-text/80 dark:text-brand-text-dark/80 leading-relaxed">
                Named lovingly after his mother, Seematra is more than a travel platform. It’s a heartfelt effort by a group of friends who believe places like <span className="font-semibold text-primary">Rishikesh, Haridwar, and Dehradun</span> are not just destinations, but experiences meant to be felt through their spirituality, culture, and profound natural beauty.
              </p>
            </div>

            {/* Our Philosophy & Office Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Star size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-boldonse text-lg tracking-wide mb-1">Quality Over Quantity</h4>
                  <p className="font-poppins text-sm text-brand-text/60 dark:text-brand-text-dark/60">Crafting genuine journeys that leave you with peace, lasting memories, and a deeper connection.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-1">
                  <Compass size={18} className="text-secondary" />
                </div>
                <div>
                  <h4 className="font-boldonse text-lg tracking-wide mb-1">Local Headquarters</h4>
                  <p className="font-poppins text-sm text-brand-text/60 dark:text-brand-text-dark/60">
                    <strong>Office:</strong> Bhairav Colony, Gali no 1, Bhattowala, Gumamniwala<br />
                    Rishikesh, Uttarakhand
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-center animate-fade-up animate-delay-100">
          <div className="card p-8 flex flex-col items-center bg-gradient-to-b from-surface to-primary/5 border-t-2 border-t-primary">
            <div className="text-4xl md:text-5xl font-boldonse text-primary mb-2">50+</div>
            <p className="font-poppins text-sm font-medium tracking-widest uppercase text-brand-text/60 dark:text-brand-text-dark/60">Curated Itineraries</p>
          </div>
          <div className="card p-8 flex flex-col items-center bg-gradient-to-b from-surface to-secondary/5 border-t-2 border-t-secondary">
            <div className="text-4xl md:text-5xl font-boldonse text-secondary mb-2">10k+</div>
            <p className="font-poppins text-sm font-medium tracking-widest uppercase text-brand-text/60 dark:text-brand-text-dark/60">Happy Travelers</p>
          </div>
          <div className="card p-8 flex flex-col items-center bg-gradient-to-b from-surface to-accent/5 border-t-2 border-t-accent">
            <div className="text-4xl md:text-5xl font-boldonse text-accent mb-2">100%</div>
            <p className="font-poppins text-sm font-medium tracking-widest uppercase text-brand-text/60 dark:text-brand-text-dark/60">Local Expertise</p>
          </div>
        </div>
      </div>
    </div>
  );
}
