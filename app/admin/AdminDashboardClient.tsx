'use client';

import AdminGuard from '@/components/global/AdminGuard';
import { useState, useEffect } from 'react';
import { api } from '@/lib/services/api';
import { IBooking, IItinerary } from '@/types';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import ItineraryForm from '@/components/admin/ItineraryForm';
import BlogForm from '@/components/admin/BlogForm';
import {
  Pencil, Trash2, Plus, Bell, LayoutDashboard,
  Map, BookOpen, CalendarCheck, Users, IndianRupee,
  TrendingUp, CheckCircle2, Clock, ChevronRight, Star, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'overview' | 'bookings' | 'itineraries' | 'builder' | 'blogs' | 'blog-editor' | 'reviews';

interface Stats {
  totalBookings: number;
  totalItineraries: number;
  totalBlogs: number;
  totalUsers: number;
  totalRevenue: number;
  recentBookings: any[];
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<any | null>(null);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '', userName: '', userLocation: '' });
  const [bookingSubTab, setBookingSubTab] = useState<'pending_payments' | 'all_paid'>('pending_payments');

  async function markCompleted(bookingId: string) {
    try {
      await api.put(`/bookings/${bookingId}`, { bookingStatus: 'completed' });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'completed' } : b));
      toast.success('Marked as completed');
    } catch (err) { console.error(err); }
  }

  async function deleteItinerary(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/itineraries/${id}`);
      setItineraries(prev => prev.filter(it => it._id !== id));
      toast.success('Itinerary deleted');
    } catch (err: any) { toast.error(err.message || 'Delete failed'); }
  }

  async function deleteBlog(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/blogs/${slug}`);
      setBlogs(prev => prev.filter(b => b.slug !== slug));
      toast.success('Blog deleted');
    } catch (err: any) { toast.error(err.message || 'Delete failed'); }
  }

  async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Browser does not support push notifications.'); return;
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });
      await api.post('/admin/push', sub);
      toast.success('Push notifications enabled!');
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await api.get('/admin/stats');
          setStats(res);
        } else if (activeTab === 'bookings') {
          const res = await api.get('/bookings');
          setBookings(Array.isArray(res) ? res : res?.data || []);
        } else if (activeTab === 'itineraries') {
          const res = await api.get('/itineraries?limit=50');
          setItineraries(Array.isArray(res) ? res : res?.data || []);
        } else if (activeTab === 'blogs') {
          const res = await api.get('/blogs?limit=50');
          setBlogs(Array.isArray(res) ? res : res?.data || []);
        } else if (activeTab === 'reviews') {
          const res = await api.get('/admin/reviews');
          setAdminReviews(Array.isArray(res) ? res : res?.data || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (!['builder', 'blog-editor'].includes(activeTab)) fetchData();
  }, [activeTab]);

  const NAV: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview',     label: 'Overview',       icon: LayoutDashboard },
    { key: 'bookings',     label: 'Bookings',        icon: CalendarCheck },
    { key: 'itineraries',  label: 'Itineraries',     icon: Map },
    { key: 'builder',      label: 'New Itinerary',   icon: Plus },
    { key: 'blogs',        label: 'Blogs & Guides',  icon: BookOpen },
    { key: 'blog-editor',  label: 'Write Blog',      icon: Pencil },
    { key: 'reviews',      label: 'Reviews',         icon: Star },
  ];

  const statusColor: Record<string, string> = {
    completed:   'text-green-500 bg-green-500/10',
    confirmed:   'text-blue-400 bg-blue-400/10',
    in_progress: 'text-yellow-500 bg-yellow-500/10',
    pending:     'text-brand-text/50 bg-brand-border/20',
    cancelled:   'text-red-400 bg-red-400/10',
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-surface dark:bg-surface-dark">
        <div className="container mx-auto px-4 lg:px-8 pt-28 pb-8 max-w-7xl flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
            <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h1 className="font-outfit font-extrabold text-lg leading-tight">Admin Portal</h1>
                  <p className="text-white/70 text-xs font-inter">Seematra Operations</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark p-2 rounded-2xl shadow-sm">
              {NAV.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setEditingBlog(null); setEditingItinerary(null); setActiveTab(key); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold font-outfit transition-all flex items-center gap-3 ${
                    activeTab === key
                      ? 'bg-primary text-white shadow-md'
                      : 'text-brand-text/70 dark:text-brand-text-dark/70 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={subscribeToPush}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold font-outfit text-brand-text/70 dark:text-brand-text-dark/70 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3 border border-dashed border-brand-border dark:border-brand-border-dark bg-brand-card dark:bg-brand-card-dark"
            >
              <Bell size={16} /> Enable Alerts
            </button>

            <Link
              href="/"
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold font-outfit text-brand-text/70 dark:text-brand-text-dark/70 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3 border border-brand-border dark:border-brand-border-dark bg-brand-card dark:bg-brand-card-dark"
            >
              ← Back to Website
            </Link>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">

            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-outfit font-extrabold">Dashboard Overview</h2>
                  <p className="text-brand-text/60 dark:text-brand-text-dark/60 text-sm font-inter">Welcome back! Here's what's happening.</p>
                </div>

                {loading ? <LoadingSpinner /> : stats && (
                  <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Total Revenue',    value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee,   color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
                        { label: 'Total Bookings',   value: stats.totalBookings,   icon: CalendarCheck,  color: 'bg-primary/10 text-primary' },
                        { label: 'Itineraries',      value: stats.totalItineraries, icon: Map,           color: 'bg-secondary/10 text-secondary' },
                        { label: 'Blogs & Guides',   value: stats.totalBlogs,      icon: BookOpen,       color: 'bg-accent/10 text-accent-dark dark:text-accent' },
                        { label: 'Total Users',      value: stats.totalUsers,      icon: Users,          color: 'bg-purple-500/10 text-purple-500' },
                        { label: 'Growth',           value: 'Active',              icon: TrendingUp,     color: 'bg-teal-500/10 text-teal-500' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={22} />
                          </div>
                          <div>
                            <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 font-inter uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-outfit font-extrabold text-brand-text dark:text-brand-text-dark">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6">
                      <h3 className="font-outfit font-bold text-lg mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'New Itinerary', tab: 'builder',     icon: Plus,      color: 'bg-primary text-white hover:bg-primary/90' },
                          { label: 'Write Blog',    tab: 'blog-editor',  icon: Pencil,    color: 'bg-secondary text-white hover:bg-secondary/90' },
                          { label: 'View Bookings', tab: 'bookings',     icon: CalendarCheck, color: 'bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark hover:border-primary text-brand-text dark:text-brand-text-dark' },
                          { label: 'All Blogs',     tab: 'blogs',        icon: BookOpen,  color: 'bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark hover:border-primary text-brand-text dark:text-brand-text-dark' },
                        ].map(({ label, tab, icon: Icon, color }) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab as Tab)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl font-bold text-sm transition-all ${color}`}
                          >
                            <Icon size={22} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-outfit font-bold text-lg">Recent Bookings</h3>
                        <button onClick={() => setActiveTab('bookings')} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                          View all <ChevronRight size={14} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {stats.recentBookings.length === 0 && (
                          <p className="text-center py-6 text-brand-text/40">No bookings yet.</p>
                        )}
                        {stats.recentBookings.map((b: any) => (
                          <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface dark:hover:bg-surface-dark transition-colors border border-brand-border/50 dark:border-brand-border-dark/50">
                            {b.itinerary?.thumbnail && (
                              <img src={b.itinerary.thumbnail} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{b.itinerary?.title || 'Unknown Tour'}</p>
                              <p className="text-xs text-brand-text/50">{b.user?.name} · {b.user?.email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor[b.bookingStatus] || ''}`}>
                                {b.bookingStatus}
                              </span>
                              <span className="text-sm font-bold text-primary">₹{b.amountPaidOnline?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ BOOKINGS TAB ══ */}
            {activeTab === 'bookings' && (
              <div className="space-y-4 animate-fade-up">
                {/* Sub-tabs for pending vs paid */}
                <div className="flex gap-2 border-b border-brand-border dark:border-brand-border-dark pb-0">
                  {(['pending_payments', 'all_paid'] as const).map(subTab => {
                    const pendingCount = bookings.filter(b => b.paymentStatus === 'PENDING').length;
                    const paidCount = bookings.filter(b => ['RESERVED','PARTIAL_PAID','COMPLETED'].includes(b.paymentStatus as string)).length;
                    const isActive = (subTab === 'pending_payments' ? bookingSubTab === 'pending_payments' : bookingSubTab === 'all_paid');
                    return (
                      <button
                        key={subTab}
                        onClick={() => setBookingSubTab(subTab)}
                        className={`px-4 py-2.5 text-sm font-bold font-outfit rounded-t-xl border border-b-0 transition-all relative -mb-px ${isActive ? 'bg-brand-card dark:bg-brand-card-dark border-brand-border dark:border-brand-border-dark text-brand-text dark:text-brand-text-dark' : 'bg-surface/50 dark:bg-surface-dark/50 border-transparent text-brand-text/50 dark:text-brand-text-dark/50 hover:text-primary'}`}
                      >
                        {subTab === 'pending_payments' ? (
                          <span className="flex items-center gap-2">
                            <Clock size={13} className="text-amber-500" />
                            Pending Payments
                            {pendingCount > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={13} className="text-green-500" />
                            Paid Bookings
                            {paidCount > 0 && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{paidCount}</span>}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6">
                  {loading ? <LoadingSpinner /> : (() => {
                    const filtered = bookingSubTab === 'pending_payments'
                      ? bookings.filter(b => b.paymentStatus === 'PENDING')
                      : bookings.filter(b => ['RESERVED','PARTIAL_PAID','COMPLETED'].includes(b.paymentStatus as string));
                    
                    const subLabel = bookingSubTab === 'pending_payments' ? 'Pending Payments' : 'Paid Bookings';
                    return (
                      <>
                        <h2 className="text-lg font-outfit font-bold mb-4">{subLabel} <span className="text-sm font-inter text-brand-text/50">({filtered.length})</span></h2>
                        {bookingSubTab === 'pending_payments' && filtered.length > 0 && (
                          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-inter">
                            ⚠️ These bookings have been initiated but payment has not been verified yet. They do not count towards revenue.
                          </div>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-surface dark:bg-surface-dark border-b border-brand-border dark:border-brand-border-dark">
                              <tr>
                                {['ID', 'User', 'Itinerary', 'Status', 'Payment', 'Paid', 'Balance', 'Action'].map(h => (
                                  <th key={h} className="px-3 py-3 text-xs font-bold text-brand-text/50 uppercase tracking-wider">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map(b => {
                                const user = b.user as any;
                                const it = b.itinerary as any;
                                return (
                                  <tr key={b._id as string} className="border-b border-brand-border dark:border-brand-border-dark hover:bg-surface/50 dark:hover:bg-surface-dark/50">
                                    <td className="px-3 py-3 font-mono text-xs">{String(b._id).substr(-6)}</td>
                                    <td className="px-3 py-3"><div className="font-bold text-xs">{user?.name || 'N/A'}</div><div className="text-xs opacity-60">{user?.email}</div></td>
                                    <td className="px-3 py-3 text-xs max-w-[140px] truncate">{it?.title || 'Unknown'}</td>
                                    <td className="px-3 py-3">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColor[b.bookingStatus as string] || ''}`}>
                                        {b.bookingStatus}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3">
                                      <span className={`text-xs font-bold ${b.paymentStatus === 'PENDING' ? 'text-amber-600 dark:text-amber-400' : b.paymentStatus === 'COMPLETED' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                        {b.paymentStatus}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-primary font-bold text-xs">₹{b.amountPaidOnline?.toLocaleString()}</td>
                                    <td className="px-3 py-3 text-xs">₹{b.balanceDue?.toLocaleString()}</td>
                                    <td className="px-3 py-3">
                                      {b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled' && b.paymentStatus !== 'PENDING' && (
                                        <button
                                          onClick={() => markCompleted(b._id as string)}
                                          className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-2 py-1 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap flex items-center gap-1"
                                        >
                                          <CheckCircle2 size={12} /> Complete
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {filtered.length === 0 && <p className="text-center py-12 text-brand-text/40">No {bookingSubTab === 'pending_payments' ? 'pending payments' : 'paid bookings'} found.</p>}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ══ ITINERARIES TAB ══ */}
            {activeTab === 'itineraries' && (
              <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6 animate-fade-up">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-outfit font-bold">Itineraries <span className="text-sm font-inter text-brand-text/50">({itineraries.length})</span></h2>
                  <button onClick={() => setActiveTab('builder')} className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
                    <Plus size={14} /> New Itinerary
                  </button>
                </div>
                {loading ? <LoadingSpinner /> : (
                  <div className="flex flex-col gap-3">
                    {itineraries.map(it => (
                      <div key={it._id} className="flex justify-between items-center p-4 border border-brand-border dark:border-brand-border-dark rounded-xl hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {it.thumbnail && <img src={it.thumbnail} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" />}
                          <div>
                            <h4 className="font-outfit font-bold text-sm">{it.title}</h4>
                            <p className="text-xs text-brand-text/50">₹{it.price?.toLocaleString()} · {it.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${it.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {it.active ? 'Active' : 'Draft'}
                          </span>
                          <button onClick={() => { setEditingItinerary(it); setActiveTab('builder'); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteItinerary(it._id, it.title)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {itineraries.length === 0 && <p className="text-center py-12 text-brand-text/40">No itineraries found.</p>}
                  </div>
                )}
              </div>
            )}

            {/* ══ ITINERARY BUILDER ══ */}
            {activeTab === 'builder' && (
              <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6 animate-fade-up">
                <div className="flex justify-between items-center mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4">
                  <div>
                    <h3 className="text-2xl font-outfit font-bold">{editingItinerary ? `Editing: ${editingItinerary.title}` : 'Create New Itinerary'}</h3>
                    <p className="text-brand-text/70 dark:text-brand-text-dark/70 text-sm">{editingItinerary ? 'Update the details below and save.' : 'Fill in the details to publish a new package.'}</p>
                  </div>
                  <button onClick={() => { setEditingItinerary(null); setActiveTab('itineraries'); }} className="btn-secondary py-2 text-sm">Cancel</button>
                </div>
                <ItineraryForm initial={editingItinerary} onSuccess={() => { setEditingItinerary(null); setActiveTab('itineraries'); }} />
              </div>
            )}

            {/* ══ BLOGS TAB ══ */}
            {activeTab === 'blogs' && (
              <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6 animate-fade-up">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-outfit font-bold">Blogs & Guides <span className="text-sm font-inter text-brand-text/50">({blogs.length})</span></h2>
                  <button onClick={() => { setEditingBlog(null); setActiveTab('blog-editor'); }} className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
                    <Plus size={14} /> New Blog
                  </button>
                </div>
                {loading ? <LoadingSpinner /> : (
                  <div className="flex flex-col gap-3">
                    {blogs.map(blog => (
                      <div key={blog.slug} className="flex justify-between items-center p-4 border border-brand-border dark:border-brand-border-dark rounded-xl hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {blog.thumbnail && <img src={blog.thumbnail} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" />}
                          <div>
                            <h4 className="font-outfit font-bold text-sm">{blog.title}</h4>
                            <p className="text-xs text-brand-text/50 font-mono">/blogs/{blog.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {blog.isRecommended && <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent-dark dark:text-accent font-bold uppercase">Featured</span>}
                          <button onClick={() => { setEditingBlog(blog); setActiveTab('blog-editor'); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteBlog(blog.slug, blog.title)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {blogs.length === 0 && <p className="text-center py-12 text-brand-text/40">No blogs yet. Write your first one!</p>}
                  </div>
                )}
              </div>
            )}

            {/* ══ BLOG EDITOR ══ */}
            {activeTab === 'blog-editor' && (
              <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6 animate-fade-up">
                <div className="flex justify-between items-center mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4">
                  <div>
                    <h3 className="text-2xl font-outfit font-bold">{editingBlog ? `Editing: ${editingBlog.title}` : 'Write New Blog / Guide'}</h3>
                    <p className="text-brand-text/70 dark:text-brand-text-dark/70 text-sm">Create travel guides, tips, and destination stories.</p>
                  </div>
                  <button onClick={() => setActiveTab('blogs')} className="btn-secondary py-2 text-sm">Cancel</button>
                </div>
                <BlogForm initial={editingBlog} onSuccess={() => { setEditingBlog(null); setActiveTab('blogs'); }} />
              </div>
            )}

            {/* ══ REVIEWS MANAGER ══ */}
            {activeTab === 'reviews' && (
              <div className="bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6 animate-fade-up">
                <div className="flex justify-between items-center mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4">
                  <div>
                    <h3 className="text-2xl font-outfit font-bold">Reviews Manager</h3>
                    <p className="text-brand-text/70 dark:text-brand-text-dark/70 text-sm">{adminReviews.length} total reviews</p>
                  </div>
                  <button onClick={() => setShowAddReview(v => !v)} className="btn-primary py-2 text-sm flex items-center gap-2">
                    <Plus size={14} /> Add Review
                  </button>
                </div>

                {/* Add review form */}
                {showAddReview && (
                  <div className="mb-6 p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-4">
                    <h4 className="font-outfit font-bold text-base">Add Review Manually</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input className="input-field" placeholder="Traveler name *" value={newReview.userName} onChange={e => setNewReview(p => ({ ...p, userName: e.target.value }))} />
                      <input className="input-field" placeholder="Location (e.g. Delhi)" value={newReview.userLocation} onChange={e => setNewReview(p => ({ ...p, userLocation: e.target.value }))} />
                    </div>
                    <input className="input-field" placeholder="Review title *" value={newReview.title} onChange={e => setNewReview(p => ({ ...p, title: e.target.value }))} />
                    <textarea className="input-field resize-none" rows={3} placeholder="Review comment *" value={newReview.comment} onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} />
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-inter text-brand-text/70">Rating:</label>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setNewReview(p => ({ ...p, rating: s }))} className={s <= newReview.rating ? 'text-amber-400' : 'text-brand-border dark:text-brand-border-dark'}>
                          <Star size={20} fill={s <= newReview.rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="btn-primary py-2 text-sm"
                        onClick={async () => {
                          try {
                            await api.post('/admin/reviews', newReview);
                            toast.success('Review added!');
                            setShowAddReview(false);
                            setNewReview({ rating: 5, title: '', comment: '', userName: '', userLocation: '' });
                            const res = await api.get('/admin/reviews');
                            setAdminReviews(Array.isArray(res) ? res : res?.data || []);
                          } catch (err: any) { toast.error(err.message || 'Failed'); }
                        }}
                      >Save Review</button>
                      <button className="btn-secondary py-2 text-sm" onClick={() => setShowAddReview(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                <div className="flex flex-col gap-3">
                  {adminReviews.map((r: any) => (
                    <div key={r._id} className={`flex items-start gap-4 p-4 rounded-xl border ${r.isHidden ? 'opacity-50 border-brand-border/50 dark:border-brand-border-dark/50' : 'border-brand-border dark:border-brand-border-dark'}`}>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold font-outfit text-primary shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-outfit font-semibold text-sm">{r.name}</span>
                          {r.location && <span className="text-xs text-brand-text/50">{r.location}</span>}
                          <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s<=r.rating?'#F59E0B':'none'} className={s<=r.rating?'text-amber-400':'text-brand-border'} />)}</div>
                          {r.isHighlighted && <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">FEATURED</span>}
                          {r.isHidden && <span className="text-[9px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">HIDDEN</span>}
                        </div>
                        <p className="text-xs font-outfit font-medium mt-0.5">{r.title}</p>
                        <p className="text-xs text-brand-text/60 dark:text-brand-text-dark/60 font-inter line-clamp-2 mt-0.5">{r.comment}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title={r.isHidden ? 'Show' : 'Hide'}
                          onClick={async () => { await api.patch(`/admin/reviews?id=${r._id}`, { isHidden: !r.isHidden }); setAdminReviews(prev => prev.map(x => x._id === r._id ? { ...x, isHidden: !x.isHidden } : x)); }}
                          className="p-2 rounded-lg text-brand-text/50 hover:bg-brand-border/20 transition-colors"
                        >{r.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                        <button
                          title={r.isHighlighted ? 'Unfeature' : 'Feature'}
                          onClick={async () => { await api.patch(`/admin/reviews?id=${r._id}`, { isHighlighted: !r.isHighlighted }); setAdminReviews(prev => prev.map(x => x._id === r._id ? { ...x, isHighlighted: !x.isHighlighted } : x)); }}
                          className={`p-2 rounded-lg transition-colors ${r.isHighlighted ? 'text-primary bg-primary/10' : 'text-brand-text/50 hover:bg-brand-border/20'}`}
                        ><Star size={14} fill={r.isHighlighted ? 'currentColor' : 'none'} /></button>
                        <button
                          onClick={async () => { if (!confirm('Delete this review?')) return; await api.delete(`/admin/reviews?id=${r._id}`); setAdminReviews(prev => prev.filter(x => x._id !== r._id)); toast.success('Deleted'); }}
                          className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        ><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {adminReviews.length === 0 && <p className="text-center py-12 text-brand-text/40 font-inter">No reviews yet. Add your first one above!</p>}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
