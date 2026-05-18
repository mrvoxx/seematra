'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/services/api';

interface Props {
  onSuccess: () => void;
  initial?: any;
}

export default function BlogForm({ onSuccess, initial }: Props) {
  const isEdit = !!initial;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [itineraries, setItineraries] = useState<{ _id: string; title: string }[]>([]);

  const [formData, setFormData] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    content: initial?.content ?? '',
    thumbnail: initial?.thumbnail ?? '',
    tags: (initial?.tags ?? []).join(', '),
    author: initial?.author ?? 'Seematra Editorial',
    isRecommended: initial?.isRecommended ?? false,
    videoUrl: initial?.videoUrl ?? '',
    relatedItinerary: initial?.relatedItinerary ?? '',
    sections: initial?.sections ?? [],
  });

  useEffect(() => {
    api.get('/itineraries?limit=50').then((res: any) => {
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItineraries(list.map((it: any) => ({ _id: it._id, title: it.title })));
    }).catch(() => {});
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setFormData(p => ({ ...p, thumbnail: result.url }));
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSectionUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      const newSections = [...formData.sections];
      newSections[index].image = result.url;
      setFormData(p => ({ ...p, sections: newSections }));
      toast.success('Section image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addSection = () => {
    setFormData(p => ({ ...p, sections: [...p.sections, { header: '', paragraph: '', image: '' }] }));
  };

  const updateSection = (index: number, key: string, value: string) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [key]: value };
    setFormData(p => ({ ...p, sections: newSections }));
  };

  const removeSection = (index: number) => {
    const newSections = [...formData.sections];
    newSections.splice(index, 1);
    setFormData(p => ({ ...p, sections: newSections }));
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) =>
    title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        tags: formData.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
      };

      // Fix Mongoose CastError by converting empty string to null for ObjectId fields
      if (!payload.relatedItinerary) {
        payload.relatedItinerary = null;
      }

      if (isEdit) {
        await api.put(`/blogs/${initial.slug}`, payload);
        toast.success('Blog updated!');
      } else {
        await api.post('/blogs', payload);
        toast.success('Blog published!');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Title</label>
          <input required type="text" className="input-field" placeholder="Ultimate Guide to Kedarnath Trek"
            value={formData.title}
            onChange={e => setFormData(p => ({ ...p, title: e.target.value, slug: isEdit ? p.slug : generateSlug(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Slug <span className="text-brand-text/40 font-normal">(URL path)</span></label>
          <input required type="text" className="input-field font-mono text-sm" placeholder="ultimate-guide-to-kedarnath"
            value={formData.slug}
            onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Author</label>
          <input type="text" className="input-field" value={formData.author}
            onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Video URL (Reels / Facebook) <span className="text-brand-text/40 font-normal">(Optional)</span></label>
          <input type="text" className="input-field" placeholder="https://www.instagram.com/reel/..."
            value={formData.videoUrl}
            onChange={e => setFormData(p => ({ ...p, videoUrl: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Tags <span className="text-brand-text/40 font-normal">(comma separated)</span></label>
          <input type="text" className="input-field" placeholder="Kedarnath, Trek, Guide"
            value={formData.tags}
            onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Thumbnail</label>
          {formData.thumbnail && <img src={formData.thumbnail} alt="thumb" className="h-16 rounded mb-2 object-cover" />}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="input-field py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Content <span className="text-brand-text/40 font-normal">(HTML supported)</span></label>
          <textarea className="input-field h-64 font-mono text-sm"
            placeholder="<p>Write your guide here…</p><h2>Section Title</h2><p>More content...</p>"
            value={formData.content}
            onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} />
        </div>

        {/* Dynamic Sections */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-border-dark pb-2">
            <h3 className="text-lg font-outfit font-bold">Dynamic Sections</h3>
            <button type="button" onClick={addSection} className="btn-secondary text-sm py-1.5 px-3">
              + Add Section
            </button>
          </div>
          {formData.sections.map((sec: any, idx: number) => (
            <div key={idx} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-xl space-y-4 bg-brand-surface dark:bg-brand-surface-dark/50 relative">
              <button type="button" onClick={() => removeSection(idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-600 text-sm font-bold">
                Remove
              </button>
              
              <div>
                <label className="block text-sm font-bold mb-1">Section Header (Optional)</label>
                <input type="text" className="input-field" placeholder="E.g. Day 1: Arrival"
                  value={sec.header || ''}
                  onChange={e => updateSection(idx, 'header', e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Paragraph (Optional)</label>
                <textarea className="input-field h-32" placeholder="Write the paragraph here..."
                  value={sec.paragraph || ''}
                  onChange={e => updateSection(idx, 'paragraph', e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Image (Optional)</label>
                {sec.image && <img src={sec.image} alt="section image" className="h-24 rounded mb-2 object-cover" />}
                <input type="file" accept="image/*" onChange={e => handleSectionUpload(idx, e)} disabled={uploading} className="input-field py-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">
            Link to Itinerary <span className="text-brand-text/40 font-normal">(optional — shows roadmap + Book Now on blog page)</span>
          </label>
          <select
            className="input-field"
            value={formData.relatedItinerary}
            onChange={e => setFormData(p => ({ ...p, relatedItinerary: e.target.value }))}
          >
            <option value="">— No linked itinerary —</option>
            {itineraries.map(it => (
              <option key={it._id} value={it._id}>{it.title}</option>
            ))}
          </select>
          <p className="text-xs text-brand-text/40 mt-1">When linked, a floating "Book Now" button and an animated day-by-day roadmap will appear on this blog.</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.isRecommended}
            onChange={e => setFormData(p => ({ ...p, isRecommended: e.target.checked }))} />
          <span className="text-sm font-bold">Mark as Featured</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-brand-border dark:border-brand-border-dark">
        {uploading && <span className="text-sm text-brand-text/50 animate-pulse">Uploading…</span>}
        <button disabled={loading || uploading} type="submit" className="btn-primary min-w-[160px] justify-center">
          {loading ? 'Saving…' : isEdit ? '✓ Update Blog' : '🚀 Publish Blog'}
        </button>
      </div>
    </form>
  );
}
