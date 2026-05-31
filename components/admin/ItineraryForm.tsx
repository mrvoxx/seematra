'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/services/api';

const TIER_OPTIONS = [1, 2, 4, 6] as const;
const TIER_LABELS: Record<number, string> = {
  1: '1 Person (Solo)',
  2: '2 Persons (Couple)',
  4: '4 Persons (Group)',
  6: '6 Persons (Group+)',
};

type PricingTier = {
  persons: 1 | 2 | 4 | 6;
  totalPrice: number;
  vehicle: string;     // transport name for this group size
  hotelIndex: number;  // which hotel from hotels[] for this group size (index)
};

const defaultTiers = (): PricingTier[] =>
  TIER_OPTIONS.map((p) => ({ persons: p, totalPrice: 0, vehicle: '', hotelIndex: 0 }));

export default function ItineraryForm({
  onSuccess,
  initial,
}: {
  onSuccess: () => void;
  initial?: any;
}) {
  const isEditing = Boolean(initial?._id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDescPreview, setShowDescPreview] = useState(false);

  // Merge saved tiers with default structure (add hotelIndex if missing)
  const mergeTiers = (saved: any[]): PricingTier[] => {
    return TIER_OPTIONS.map((p) => {
      const found = saved?.find((t: any) => t.persons === p);
      return found
        ? { persons: p, totalPrice: found.totalPrice ?? 0, vehicle: found.vehicle ?? '', hotelIndex: found.hotelIndex ?? 0 }
        : { persons: p, totalPrice: 0, vehicle: '', hotelIndex: 0 };
    });
  };

  const [formData, setFormData] = useState({
    title: initial?.title ?? '',
    duration: initial?.duration ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    thumbnail: initial?.thumbnail ?? '',
    genres: (initial?.genres ?? []) as string[],
    tags: (initial?.tags ?? []) as string[],
    inclusions: (initial?.inclusions ?? []) as string[],
    exclusions: (initial?.exclusions ?? []) as string[],
    pricingTiers: mergeTiers(initial?.pricingTiers ?? []) as PricingTier[],
    vehicles: (initial?.vehicles ?? []) as any[],
    hotels: (initial?.hotels ?? []) as any[],
    roadmap: (initial?.roadmap ?? []) as any[],
    active: initial?.active ?? true,
    isRecommended: initial?.isRecommended ?? false,
    hasDiscount: initial?.hasDiscount ?? false,
    video: initial?.video ?? '',
  });

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    index?: number,
    subfield?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (index !== undefined && subfield) {
        setFormData((prev) => {
          const list = [...(prev as any)[field]];
          if (Array.isArray(list[index][subfield])) {
            list[index][subfield] = [...list[index][subfield], result.url];
          } else {
            list[index][subfield] = result.url;
          }
          return { ...prev, [field]: list };
        });
      } else {
        setFormData((prev) => ({ ...prev, [field]: result.url }));
      }
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateTier = (idx: number, key: keyof PricingTier, value: any) => {
    setFormData((prev) => {
      const tiers = [...prev.pricingTiers];
      tiers[idx] = { ...tiers[idx], [key]: value };
      return { ...prev, pricingTiers: tiers };
    });
  };

  const addRoadmapPoint = () =>
    setFormData((prev) => ({
      ...prev,
      roadmap: [
        ...prev.roadmap,
        {
          day: prev.roadmap.length + 1,
          locationName: '',
          coords: { lat: 30, lng: 79 },
          image: '',
          overview: '',
        },
      ],
    }));

  const addHotel = () =>
    setFormData((prev) => ({
      ...prev,
      hotels: [
        ...prev.hotels,
        { name: '', rating: '3 Star', images: [], contactNumber: '' },
      ],
    }));

  const addVehicle = () =>
    setFormData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, { name: '', capacity: 6, image: '' }],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter tiers to only include ones with a price set; strip hotelIndex before saving
      const payload = {
        ...formData,
        pricingTiers: formData.pricingTiers
          .filter((t) => t.totalPrice > 0)
          .map(({ hotelIndex, ...rest }) => rest),
      };
      if (isEditing) {
        await api.put(`/itineraries/${initial._id}`, payload);
        toast.success('Itinerary updated!');
      } else {
        await api.post('/itineraries', payload);
        toast.success('Itinerary published!');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || (isEditing ? 'Update failed' : 'Creation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto text-left">

      {/* ─── Core Info ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Title</label>
          <input required type="text" className="input-field" placeholder="Kedarnath Discovery Journey" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Duration</label>
          <input required type="text" className="input-field" placeholder="5 Days / 4 Nights" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Base Price (₹) <span className="text-brand-text/40 font-normal">— fallback if no pricing tiers set</span></label>
          <input required type="number" min={0} className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Thumbnail Cover</label>
          {formData.thumbnail && <img src={formData.thumbnail} alt="cover" className="h-16 rounded mt-1 mb-2 object-cover" />}
          <input type="file" accept="image/*" onChange={e => handleUpload(e, 'thumbnail')} disabled={uploading} className="input-field py-2" />
        </div>

        {/* HTML Description with Preview */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-bold">
              Description <span className="text-brand-text/40 font-normal">(HTML tags supported: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;br&gt;, etc.)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowDescPreview(v => !v)}
              className="text-xs font-bold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {showDescPreview ? '✏️ Edit' : '👁️ Preview HTML'}
            </button>
          </div>
          {showDescPreview ? (
            <div
              className="prose dark:prose-invert max-w-none border border-brand-border dark:border-brand-border-dark rounded-xl p-4 bg-surface dark:bg-brand-card-dark min-h-[96px] text-sm"
              dangerouslySetInnerHTML={{ __html: formData.description || '<p class="opacity-40 italic">Nothing to preview yet…</p>' }}
            />
          ) : (
            <textarea
              required
              className="input-field h-28 font-mono text-sm"
              placeholder="<p>Describe the experience…</p>&#10;<ul><li>Point 1</li><li>Point 2</li></ul>"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          )}
          <p className="text-[11px] text-brand-text/40 mt-1 font-inter">
            Tip: Use &lt;p&gt; for paragraphs, &lt;strong&gt; for bold, &lt;ul&gt;&lt;li&gt; for bullet lists, &lt;br/&gt; for line breaks.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Video URL <span className="text-brand-text/40 font-normal">(Instagram Reels / Facebook / YouTube) — Optional</span></label>
          <input type="text" className="input-field" placeholder="https://www.instagram.com/reel/..." value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-2">Genres <span className="text-red-400">*</span></label>
          <div className="flex flex-wrap gap-3">
            {['Adventure', 'Spiritual', 'Family', 'Couple', 'Solo', 'Luxury', 'Wildlife', 'Trekking'].map(g => (
              <label key={g} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 cursor-pointer text-sm font-outfit font-semibold transition-colors
                ${formData.genres.includes(g) ? 'border-primary bg-primary/10 text-primary' : 'border-brand-border dark:border-brand-border-dark text-brand-text/60 dark:text-brand-text-dark/60'}`}>
                <input type="checkbox" className="sr-only" checked={formData.genres.includes(g)}
                  onChange={e => setFormData(p => ({
                    ...p,
                    genres: e.target.checked ? [...p.genres, g] : p.genres.filter(x => x !== g)
                  }))} />
                {g}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">
            Tags <span className="text-red-400">*</span> <span className="text-brand-text/40 font-normal">(comma separated)</span>
          </label>
          <input required type="text" className="input-field" placeholder="Kedarnath, Pilgrimage, Uttarakhand"
            defaultValue={formData.tags.join(', ')}
            onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">
            Inclusions <span className="text-brand-text/40 font-normal">(comma separated)</span>
          </label>
          <input type="text" className="input-field" placeholder="Meals, Accommodation, Guide"
            defaultValue={formData.inclusions.join(', ')}
            onChange={e => setFormData({...formData, inclusions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">
            Exclusions <span className="text-brand-text/40 font-normal">(comma separated — what's NOT included)</span>
          </label>
          <input type="text" className="input-field" placeholder="Air tickets, Travel insurance, Personal expenses, Tips"
            defaultValue={formData.exclusions.join(', ')}
            onChange={e => setFormData({...formData, exclusions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
        </div>
        <div className="flex items-center gap-6 md:col-span-2 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({...formData, isRecommended: e.target.checked})} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-bold">Mark as Recommended</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.hasDiscount} onChange={e => setFormData({...formData, hasDiscount: e.target.checked})} className="w-4 h-4 accent-red-500" />
            <span className="text-sm font-bold">Enable 25% OFF</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-bold">Active (visible to users)</span>
          </label>
        </div>
      </div>

      {/* ─── Group Pricing + Transport + Accommodation per tier ─── */}
      <div className="border-t border-brand-border dark:border-brand-border-dark pt-6">
        <div className="mb-5">
          <h3 className="font-bold font-outfit text-xl">Group Pricing, Transport & Accommodation</h3>
          <p className="text-sm text-brand-text/50 mt-1">
            Set the <strong>total package price</strong>, the <strong>assigned vehicle</strong>, and the <strong>hotel</strong> for each group size. Leave price at ₹0 to disable a tier.
          </p>
        </div>

        {/* Vehicle + Hotel reference strip */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Vehicles quick-ref */}
          <div className="p-3 rounded-xl border border-dashed border-brand-border dark:border-brand-border-dark bg-surface/60 dark:bg-surface-dark/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text/40 mb-2">Your Vehicles</p>
            {formData.vehicles.length === 0
              ? <p className="text-xs text-brand-text/30 italic">No vehicles added below yet.</p>
              : formData.vehicles.map((v, i) => (
                  <p key={i} className="text-xs font-bold text-primary">🚗 {v.name} {v.capacity ? `(Seats ${v.capacity})` : ''}</p>
                ))}
          </div>
          {/* Hotels quick-ref */}
          <div className="p-3 rounded-xl border border-dashed border-brand-border dark:border-brand-border-dark bg-surface/60 dark:bg-surface-dark/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text/40 mb-2">Your Hotels (by index)</p>
            {formData.hotels.length === 0
              ? <p className="text-xs text-brand-text/30 italic">No hotels added below yet.</p>
              : formData.hotels.map((h, i) => (
                  <p key={i} className="text-xs font-bold text-primary">🏨 #{i}: {h.name || <span className="text-brand-text/30">Unnamed</span>} {h.rating ? `· ${h.rating}` : ''}</p>
                ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.pricingTiers.map((tier, idx) => (
            <div key={tier.persons} className="p-4 rounded-xl border border-brand-border dark:border-brand-border-dark bg-surface/50 dark:bg-surface-dark/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                  👤 {TIER_LABELS[tier.persons]}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {/* Price */}
                <div>
                  <label className="text-xs font-bold block mb-1">Total Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className="input-field py-2 text-sm"
                    placeholder="e.g. 12000"
                    value={tier.totalPrice || ''}
                    onChange={e => updateTier(idx, 'totalPrice', Number(e.target.value))}
                  />
                </div>
                {/* Vehicle for this group size */}
                <div>
                  <label className="text-xs font-bold block mb-1">
                    🚗 Vehicle / Transport <span className="text-brand-text/40 font-normal">(type name exactly as added below)</span>
                  </label>
                  {formData.vehicles.length > 0 ? (
                    <select
                      className="input-field py-2 text-sm"
                      value={tier.vehicle}
                      onChange={e => updateTier(idx, 'vehicle', e.target.value)}
                    >
                      <option value="">— None / Not assigned —</option>
                      {formData.vehicles.map((v, vi) => (
                        <option key={vi} value={v.name}>{v.name} {v.capacity ? `(Seats ${v.capacity})` : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="input-field py-2 text-sm"
                      placeholder="e.g. Innova Crysta (add vehicles below first)"
                      value={tier.vehicle}
                      onChange={e => updateTier(idx, 'vehicle', e.target.value)}
                    />
                  )}
                </div>
                {/* Hotel for this group size */}
                <div>
                  <label className="text-xs font-bold block mb-1">
                    🏨 Accommodation <span className="text-brand-text/40 font-normal">(assign hotel from list below)</span>
                  </label>
                  {formData.hotels.length > 0 ? (
                    <select
                      className="input-field py-2 text-sm"
                      value={tier.hotelIndex}
                      onChange={e => updateTier(idx, 'hotelIndex', Number(e.target.value))}
                    >
                      {formData.hotels.map((h, hi) => (
                        <option key={hi} value={hi}>#{hi}: {h.name || 'Unnamed'} {h.rating ? `· ${h.rating}` : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-brand-text/40 italic p-2 border border-dashed border-brand-border dark:border-brand-border-dark rounded-lg">
                      Add hotels below first, then assign here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Vehicles ─── */}
      <div className="border-t border-brand-border dark:border-brand-border-dark pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold font-outfit text-xl">Vehicles / Transport</h3>
            <p className="text-xs text-brand-text/50 mt-0.5">Define the vehicles available for this package. Assign them to group sizes above.</p>
          </div>
          <button type="button" onClick={addVehicle} className="btn-secondary py-1 px-3 text-xs">+ Add Vehicle</button>
        </div>
        {formData.vehicles.length === 0 && (
          <p className="text-sm text-brand-text/40 italic">No vehicles added yet. Click "+ Add Vehicle" to include transport details.</p>
        )}
        {formData.vehicles.map((v, i) => (
          <div key={i} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-xl mb-4 bg-surface/50 dark:bg-surface-dark/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Vehicle Name</label>
                <input className="input-field py-2 text-sm" placeholder="e.g. Innova Crysta / Tempo Traveller" value={v.name} onChange={e => {
                  const arr = [...formData.vehicles]; arr[i] = {...arr[i], name: e.target.value};
                  // Also update pricingTiers that reference old name
                  setFormData({...formData, vehicles: arr});
                }} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Capacity (persons)</label>
                <input type="number" min={1} className="input-field py-2 text-sm" value={v.capacity} onChange={e => {
                  const arr = [...formData.vehicles]; arr[i] = {...arr[i], capacity: Number(e.target.value)}; setFormData({...formData, vehicles: arr});
                }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold block mb-1">Vehicle Photo</label>
                {v.image && <img src={v.image} alt={v.name} className="h-16 rounded mb-2 object-cover" />}
                <input type="file" accept="image/*" onChange={e => handleUpload(e, 'vehicles', i, 'image')} disabled={uploading} className="input-field py-1 text-sm" />
              </div>
              <div className="col-span-2 flex justify-end">
                <button type="button" onClick={() => setFormData(p => ({...p, vehicles: p.vehicles.filter((_, vi) => vi !== i)}))}
                  className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors">Remove Vehicle</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Accommodations ─── */}
      <div className="border-t border-brand-border dark:border-brand-border-dark pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold font-outfit text-xl">Accommodations</h3>
            <p className="text-xs text-brand-text/50 mt-0.5">Add hotels for this package. Assign each to a group size in the pricing section above.</p>
          </div>
          <button type="button" onClick={addHotel} className="btn-secondary py-1 px-3 text-xs">+ Add Hotel</button>
        </div>
        {formData.hotels.length === 0 && (
          <p className="text-sm text-brand-text/40 italic">No hotels added yet. Click "+ Add Hotel" to include accommodations.</p>
        )}
        {formData.hotels.map((h, i) => (
          <div key={i} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-xl mb-4 bg-surface/50 dark:bg-surface-dark/50">
            {/* Hotel index badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">🏨 Hotel #{i}</span>
              <button type="button" onClick={() => setFormData(p => ({...p, hotels: p.hotels.filter((_, hi) => hi !== i)}))}
                className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors">Remove Hotel</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-2 lg:col-span-2">
                <label className="text-xs font-bold block mb-1">Hotel Name</label>
                <input required className="input-field py-2 text-sm" placeholder="e.g. The Himalayan Retreat" value={h.name} onChange={e => {
                  const arr = [...formData.hotels]; arr[i] = {...arr[i], name: e.target.value}; setFormData({...formData, hotels: arr});
                }} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Star Rating / Type</label>
                <input required className="input-field py-2 text-sm" placeholder="e.g. 4 Star" value={h.rating} onChange={e => {
                  const arr = [...formData.hotels]; arr[i] = {...arr[i], rating: e.target.value}; setFormData({...formData, hotels: arr});
                }} />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <label className="text-xs font-bold block mb-1 relative group">
                  Contact Number <span className="text-red-400">🔒</span>
                  <div className="absolute left-0 bottom-full mb-1 w-48 p-2 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Visible to Admin ONLY</div>
                </label>
                <input type="text" className="input-field py-2 text-sm" placeholder="+91 9876543210" value={h.contactNumber} onChange={e => {
                  const arr = [...formData.hotels]; arr[i] = {...arr[i], contactNumber: e.target.value}; setFormData({...formData, hotels: arr});
                }} />
              </div>
              <div className="col-span-2 lg:col-span-3">
                <label className="text-xs font-bold block mb-1">Hotel Photos</label>
                {h.images && h.images.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {h.images.map((img: string, imgIdx: number) => (
                      <div key={imgIdx} className="relative group">
                        <img src={img} alt="hotel" className="h-16 w-16 rounded object-cover" />
                        <button type="button" onClick={() => {
                          const arr = [...formData.hotels];
                          arr[i].images = arr[i].images.filter((_: any, idx: number) => idx !== imgIdx);
                          setFormData({...formData, hotels: arr});
                        }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => handleUpload(e, 'hotels', i, 'images')} disabled={uploading} className="input-field py-1 text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Roadmap ─── */}
      <div className="border-t border-brand-border dark:border-brand-border-dark pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold font-outfit text-xl">Itinerary Roadmap</h3>
          <button type="button" onClick={addRoadmapPoint} className="btn-secondary py-1 px-3 text-xs">+ Add Day</button>
        </div>
        {formData.roadmap.length === 0 && (
          <p className="text-sm text-brand-text/40 italic">No days added yet. Click "+ Add Day" to build the roadmap.</p>
        )}
        {formData.roadmap.map((point, i) => (
          <div key={i} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-xl mb-4 bg-surface/50 dark:bg-surface-dark/50">
            <div className="text-xs font-bold text-primary mb-3">Day {point.day}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Location Name</label>
                <input required className="input-field py-2 text-sm" placeholder="e.g. Kedarnath Temple" value={point.locationName} onChange={e => {
                  const arr = [...formData.roadmap]; arr[i] = {...arr[i], locationName: e.target.value}; setFormData({...formData, roadmap: arr});
                }} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Location Photo</label>
                {point.image && <img src={point.image} alt="" className="h-12 rounded mb-1 object-cover" />}
                <input type="file" accept="image/*" onChange={e => handleUpload(e, 'roadmap', i, 'image')} disabled={uploading} className="input-field py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Latitude</label>
                <input type="number" step="any" className="input-field py-2 text-sm font-mono" placeholder="e.g. 30.7352"
                  value={point.coords.lat}
                  onChange={e => {
                    const arr = [...formData.roadmap];
                    arr[i] = {...arr[i], coords: {...arr[i].coords, lat: parseFloat(e.target.value) || 0}};
                    setFormData({...formData, roadmap: arr});
                  }} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Longitude</label>
                <input type="number" step="any" className="input-field py-2 text-sm font-mono" placeholder="e.g. 79.0669"
                  value={point.coords.lng}
                  onChange={e => {
                    const arr = [...formData.roadmap];
                    arr[i] = {...arr[i], coords: {...arr[i].coords, lng: parseFloat(e.target.value) || 0}};
                    setFormData({...formData, roadmap: arr});
                  }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold block mb-1">Day Overview</label>
                <textarea required className="input-field py-2 h-16 text-sm" placeholder="Describe the day's activities, timings, food, etc." value={point.overview} onChange={e => {
                  const arr = [...formData.roadmap]; arr[i] = {...arr[i], overview: e.target.value}; setFormData({...formData, roadmap: arr});
                }} />
              </div>
              <div className="col-span-2 flex justify-end">
                <button type="button" onClick={() => setFormData(p => ({
                  ...p, roadmap: p.roadmap.filter((_, ri) => ri !== i).map((r, ri) => ({...r, day: ri + 1}))
                }))} className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors">Remove Day</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex items-center justify-end gap-4 border-t border-brand-border dark:border-brand-border-dark">
        {uploading && <span className="text-sm text-brand-text/50 animate-pulse">Uploading image…</span>}
        <button disabled={loading || uploading} type="submit" className="btn-primary min-w-[180px] justify-center">
          {loading ? (isEditing ? 'Saving…' : 'Publishing…') : isEditing ? '💾 Save Changes' : '🚀 Publish Itinerary'}
        </button>
      </div>
    </form>
  );
}
