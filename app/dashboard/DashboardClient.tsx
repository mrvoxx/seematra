'use client';

import { useState, useEffect, Suspense } from 'react';
import ProtectedRoute from '@/components/global/ProtectedRoute';
import { useSession, signOut } from 'next-auth/react';
import { api } from '@/lib/services/api';
import { IBooking, IItinerary, IBlog } from '@/types';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import ItineraryCard from '@/components/global/ItineraryCard';
import BlogCard from '@/components/global/BlogCard';
import DarkModeToggle from '@/components/global/DarkModeToggle';
import {
  PaymentProgress,
  BookingStatusBadge,
  PayBalanceButton,
  InvoiceDownloadButton,
} from '@/components/global/PaymentComponents';
import toast from 'react-hot-toast';
import {
  User as UserIcon, Heart, BookOpen, CreditCard, Settings, LogOut,
  ChevronRight, MapPin, Users, Calendar, Car, Hotel, Phone,
  CheckCircle2, Clock,
} from 'lucide-react';

// ─── Booking Detail Panel ─────────────────────────────────────────────────────
function BookingDetailPanel({
  booking,
  onBack,
  onRefresh,
}: {
  booking: IBooking;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const it = booking.itinerary as any;
  const isFullyPaid  = booking.balanceDue <= 0 || booking.paymentStatus === 'COMPLETED';
  const hasBalance   = booking.balanceDue > 0 && booking.paymentStatus !== 'COMPLETED';
  const invoiceToken = (booking as any).invoiceToken;

  const PAYMENT_MODE_LABEL: Record<string, string> = {
    full:            'Full Payment',
    advance_40:      '40% Advance',
    reservation_500: '₹500 Reservation',
    direct:          'Direct / Offline',
  };

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="text-primary font-bold text-sm mb-5 flex items-center gap-1 hover:underline">
        ← Back to bookings
      </button>

      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-brand-border dark:border-brand-border-dark overflow-hidden">
        {/* Booking header */}
        <div className="p-5 border-b border-brand-border/50 dark:border-brand-border-dark/50 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 bg-primary/5">
          <div>
            <h4 className="font-outfit font-bold text-xl">{it?.title || 'Trip Details'}</h4>
            <p className="text-xs text-brand-text/50 mt-0.5">Booking #{String(booking._id).slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <BookingStatusBadge status={booking.bookingStatus} />
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Trip info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: Calendar, label: 'Tour Date',    value: booking.tourDate ? new Date(booking.tourDate).toLocaleDateString('en-IN') : 'TBD' },
              { icon: Users,    label: 'Group',         value: `${booking.groupSize ?? 1} Person(s)` },
              { icon: MapPin,   label: 'Pickup',        value: booking.pickupPoint },
              { icon: Car,      label: 'Vehicle',       value: (booking as any).vehicleAssigned || 'To be assigned' },
              { icon: Hotel,    label: 'Hotel',         value: (booking as any).hotelStatus || 'To be confirmed' },
              { icon: Phone,    label: 'Contact',       value: booking.contactPhone },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-brand-border/30 dark:border-brand-border-dark/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
                </div>
                <p className="text-sm font-bold truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Payment mode label */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 font-medium">Payment Plan:</span>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
              {PAYMENT_MODE_LABEL[(booking as any).paymentMode ?? 'direct']}
            </span>
          </div>

          {/* Payment progress */}
          <PaymentProgress
            totalAmount={booking.totalAmount}
            amountPaid={booking.amountPaidOnline}
            balanceDue={booking.balanceDue}
            dueDate={(booking as any).balanceDueDate}
            paymentMode={(booking as any).paymentMode}
          />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            {hasBalance && (
              <PayBalanceButton
                bookingId={String(booking._id)}
                balanceDue={booking.balanceDue}
                onSuccess={onRefresh}
              />
            )}
            {isFullyPaid && (
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-bold">
                <CheckCircle2 size={16} /> Fully Paid & Confirmed
              </div>
            )}
            {invoiceToken && (
              <InvoiceDownloadButton invoiceToken={invoiceToken} />
            )}
          </div>

          {/* Trust assurance */}
          <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-brand-text/70 dark:text-brand-text-dark/70">
              Your booking is secured by Razorpay. For any changes or support, WhatsApp us or email{' '}
              <a href="mailto:support@seematra.com" className="text-primary font-bold">support@seematra.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bookings List ─────────────────────────────────────────────────────────────
function BookingsList({
  bookings,
  loading,
  onSelect,
}: {
  bookings: IBooking[];
  loading: boolean;
  onSelect: (b: IBooking) => void;
}) {
  if (loading) return <LoadingSpinner />;

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <CreditCard size={48} className="mx-auto text-brand-border/50 dark:text-brand-border-dark/50 mb-4" />
        <p className="text-brand-text/60 dark:text-brand-text-dark/60 mb-4">No bookings yet.</p>
        <Link href="/itineraries" className="btn-primary">Explore Itineraries</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {bookings.map((booking) => {
        const it = booking.itinerary as any;
        const hasBalance = booking.balanceDue > 0 && booking.paymentStatus !== 'COMPLETED';
        return (
          <div
            key={String(booking._id)}
            onClick={() => onSelect(booking)}
            className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-brand-border dark:border-brand-border-dark hover:border-primary cursor-pointer transition-all hover:shadow-md group"
          >
            {/* Thumbnail */}
            <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-brand-border/20 flex items-center justify-center">
              {it?.thumbnail ? (
                <img src={it.thumbnail} alt={it?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              ) : (
                <span className="text-[10px] text-brand-text/40">No image</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-center gap-1">
              <div className="flex justify-between items-start">
                <h4 className="font-outfit font-bold text-base leading-tight">{it?.title || 'Booking'}</h4>
                <BookingStatusBadge status={booking.bookingStatus} />
              </div>
              <p className="text-xs text-brand-text/50">
                {booking.tourDate ? new Date(booking.tourDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                {' · '}{booking.groupSize} Person(s)
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold text-green-600">
                  Paid: ₹{booking.amountPaidOnline.toLocaleString('en-IN')}
                </span>
                {hasBalance && (
                  <span className="text-xs font-bold text-amber-500">
                    Due: ₹{booking.balanceDue.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-brand-text/40 flex items-center gap-1 group-hover:text-primary transition-colors ml-auto">
                  Details <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'profile';

  const [bookings, setBookings]             = useState<IBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  const { favorites, preferences, setUserData } = useUserStore();

  const fetchBookings = () => {
    setLoadingBookings(true);
    api.get('/bookings/my')
      .then((res) => setBookings(Array.isArray(res) ? res : res?.data || []))
      .catch(console.error)
      .finally(() => setLoadingBookings(false));
  };

  useEffect(() => {
    if (!session) return;
    fetchBookings();
    api.get('/user/profile').then((data) => { if (data) setUserData(data); }).catch(console.error);
  }, [session, setUserData]);

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`);
    setSelectedBooking(null);
  };

  const updatePreferences = async (updates: any) => {
    try {
      const newPrefs = { ...preferences, ...updates };
      setUserData({ favoriteItineraries: favorites.itineraries, favoriteBlogs: favorites.blogs, preferences: newPrefs });
      await api.put('/user/profile', newPrefs);
      toast.success('Preferences updated!');

      // Handle language change automatically via Google Translate
      if (updates.language) {
        if (updates.language === 'hindi') {
          document.cookie = 'googtrans=/en/hi; path=/';
        } else {
          document.cookie = 'googtrans=/en/en; path=/';
          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'; // clear
        }
        // Small delay to let toast show before reloading
        setTimeout(() => window.location.reload(), 500);
      }
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  const navItems = [
    { id: 'profile',              label: 'Profile Info',          icon: UserIcon },
    { id: 'bookings',             label: 'My Bookings',           icon: Calendar },
    { id: 'payments',             label: 'Payment History',       icon: CreditCard },
    { id: 'favorite-itineraries', label: 'Favourite Itineraries', icon: Heart },
    { id: 'favorite-blogs',       label: 'Travel Guides',         icon: BookOpen },
    { id: 'settings',             label: 'Settings',              icon: Settings },
  ];

  // Pending balance summary
  const pendingBookings = bookings.filter((b) => b.balanceDue > 0 && b.paymentStatus !== 'COMPLETED');
  const totalPending = pendingBookings.reduce((sum, b) => sum + b.balanceDue, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-brand-card dark:bg-brand-card-dark rounded-2xl shadow-sm border border-brand-border dark:border-brand-border-dark overflow-hidden sticky top-28">
          {/* User info */}
          <div className="p-5 border-b border-brand-border dark:border-brand-border-dark bg-primary/5 flex items-center gap-3">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-outfit font-bold text-base leading-tight truncate">{session?.user?.name}</h2>
              <p className="text-xs text-brand-text/60 dark:text-brand-text-dark/60 truncate">{session?.user?.email}</p>
            </div>
          </div>

          {/* Pending balance alert */}
          {totalPending > 0 && (
            <div className="mx-3 mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">⚠️ Balance Pending</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">₹{totalPending.toLocaleString('en-IN')} due across {pendingBookings.length} booking(s)</p>
              <button onClick={() => handleTabChange('bookings')} className="text-xs text-primary font-bold mt-1 hover:underline">
                Pay now →
              </button>
            </div>
          )}

          {/* Nav */}
          <div className="p-2 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left ${
                  activeTab === item.id
                    ? 'bg-primary text-white font-bold'
                    : 'text-brand-text dark:text-brand-text-dark hover:bg-surface-dark/5 dark:hover:bg-surface/5'
                }`}
              >
                <item.icon size={16} />
                <span className="flex-1 text-sm">{item.label}</span>
                <ChevronRight size={14} className={`transition-transform ${activeTab === item.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
            <div className="h-px bg-brand-border/30 dark:bg-brand-border-dark/30 my-1 mx-4" />
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
            >
              <LogOut size={16} />
              <span className="flex-1 text-sm font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-brand-card dark:bg-brand-card-dark rounded-2xl shadow-sm border border-brand-border dark:border-brand-border-dark p-5 md:p-7 min-h-[500px]">

          {/* ─── Profile Tab ─── */}
          {activeTab === 'profile' && (
            <div className="animate-fade-up">
              <h3 className="text-2xl font-outfit font-bold mb-6">Profile Information</h3>
              <div className="space-y-4 max-w-lg">
                {[
                  ['Full Name',     session?.user?.name],
                  ['Email Address', session?.user?.email],
                  ['Account Role',  (session?.user as any)?.role ?? 'User'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <label className="block text-xs font-bold text-brand-text/50 dark:text-brand-text-dark/50 uppercase tracking-wider mb-1">{label}</label>
                    <div className="p-3 bg-surface dark:bg-surface-dark rounded-xl border border-brand-border/50 dark:border-brand-border-dark/50 font-inter capitalize">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Bookings Tab ─── */}
          {activeTab === 'bookings' && (
            <div className="animate-fade-up">
              <h3 className="text-2xl font-outfit font-bold mb-6">My Bookings</h3>
              {selectedBooking ? (
                <BookingDetailPanel
                  booking={selectedBooking}
                  onBack={() => setSelectedBooking(null)}
                  onRefresh={() => { fetchBookings(); setSelectedBooking(null); }}
                />
              ) : (
                <BookingsList bookings={bookings} loading={loadingBookings} onSelect={setSelectedBooking} />
              )}
            </div>
          )}

          {/* ─── Payment History Tab ─── */}
          {activeTab === 'payments' && (
            <div className="animate-fade-up">
              <h3 className="text-2xl font-outfit font-bold mb-6">Payment History</h3>
              {loadingBookings ? <LoadingSpinner /> : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <CreditCard size={48} className="mx-auto text-brand-border/50 mb-4" />
                  <p className="text-brand-text/60">No payment records yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const it = booking.itinerary as any;
                    const isComplete = booking.balanceDue <= 0 || booking.paymentStatus === 'COMPLETED';
                    const pct = booking.totalAmount > 0
                      ? Math.round((booking.amountPaidOnline / booking.totalAmount) * 100) : 0;
                    const invoiceToken = (booking as any).invoiceToken;

                    return (
                      <div key={String(booking._id)} className="p-4 rounded-xl border border-brand-border dark:border-brand-border-dark">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-outfit font-bold">{it?.title || 'Booking'}</h4>
                            <p className="text-xs text-gray-400">#{String(booking._id).slice(-8).toUpperCase()}</p>
                          </div>
                          <BookingStatusBadge status={booking.paymentStatus === 'COMPLETED' ? 'completed' : booking.bookingStatus} />
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                          <div
                            className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-3">
                          <span>Paid: <strong className="text-green-600">₹{booking.amountPaidOnline.toLocaleString('en-IN')}</strong></span>
                          <span>Total: <strong>₹{booking.totalAmount.toLocaleString('en-IN')}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {!isComplete && (
                            <PayBalanceButton
                              bookingId={String(booking._id)}
                              balanceDue={booking.balanceDue}
                              onSuccess={fetchBookings}
                            />
                          )}
                          {invoiceToken && <InvoiceDownloadButton invoiceToken={invoiceToken} />}
                          {isComplete && (
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Fully Paid
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── Favourite Itineraries Tab ─── */}
          {activeTab === 'favorite-itineraries' && (
            <div className="animate-fade-up">
              <h3 className="text-2xl font-outfit font-bold mb-6">Favourite Itineraries</h3>
              {favorites.itineraries.length === 0 ? (
                <div className="text-center py-16">
                  <Heart size={48} className="mx-auto text-brand-border/50 mb-4" />
                  <p className="text-brand-text/60 mb-4">No saved itineraries yet.</p>
                  <Link href="/itineraries" className="btn-outline">Explore Experiences</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.itineraries.map((it: any) =>
                    typeof it === 'object' && it._id ? <ItineraryCard key={it._id} itinerary={it} /> : null
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Favourite Blogs Tab ─── */}
          {activeTab === 'favorite-blogs' && (
            <div className="animate-fade-up">
              <h3 className="text-2xl font-outfit font-bold mb-6">Travel Guides</h3>
              {favorites.blogs.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen size={48} className="mx-auto text-brand-border/50 mb-4" />
                  <p className="text-brand-text/60 mb-4">No saved guides yet.</p>
                  <Link href="/blogs" className="btn-outline">Read Travel Guides</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.blogs.map((blog: any) =>
                    typeof blog === 'object' && blog._id ? <BlogCard key={blog._id} blog={blog} /> : null
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Settings Tab ─── */}
          {activeTab === 'settings' && (
            <div className="animate-fade-up">
              <h3 className="text-2xl font-outfit font-bold mb-6">Account Settings</h3>
              <div className="space-y-6 max-w-lg">
                <div className="p-5 rounded-2xl border border-brand-border/50 dark:border-brand-border-dark/50 bg-surface dark:bg-surface-dark">
                  <h4 className="font-outfit font-bold text-lg mb-1 flex items-center gap-2">
                    <Settings size={16} className="text-primary" /> Display Mode
                  </h4>
                  <p className="text-sm text-brand-text/60 dark:text-brand-text-dark/60 mb-4">Toggle between light and dark mode.</p>
                  <div className="flex items-center gap-4">
                    <DarkModeToggle />
                    <span className="text-sm font-bold">{preferences.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-brand-border/50 dark:border-brand-border-dark/50 bg-surface dark:bg-surface-dark">
                  <h4 className="font-outfit font-bold text-lg mb-1">🌍 Language</h4>
                  <p className="text-sm text-brand-text/60 dark:text-brand-text-dark/60 mb-4">Select your preferred language.</p>
                  <div className="flex gap-3">
                    {[['english', 'English'], ['hindi', 'हिन्दी']].map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => updatePreferences({ language: val })}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                          preferences.language === val
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-brand-border dark:border-brand-border-dark hover:border-primary/50'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 lg:px-8 pt-32 pb-12 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-outfit font-extrabold mb-4">My Account</h1>
          <p className="text-brand-text/70 dark:text-brand-text-dark/70 font-inter text-sm">
            Manage your profile, bookings, and payments.
          </p>
        </div>
        <Suspense fallback={<div className="py-20"><LoadingSpinner /></div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
