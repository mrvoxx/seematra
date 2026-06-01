'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/services/api';
import {
  Code2, Eye, EyeOff, Plus, Trash2, ChevronDown,
  Heading2, Heading3, AlignLeft, List, ListOrdered,
  Quote, Bold, Italic, Link2, Image as ImageIcon,
  Table2, Minus, Type, FileCode, MapPin, Sparkles, X
} from 'lucide-react';

interface Props {
  onSuccess: () => void;
  initial?: any;
}

// ── HTML snippet templates inserted at cursor ──────────────────────────────
const TOOLBAR_GROUPS = [
  {
    label: 'Structure',
    items: [
      { icon: Heading2,     label: 'H2',          snippet: '<h2>Section Title</h2>\n' },
      { icon: Heading3,     label: 'H3',          snippet: '<h3>Sub-heading</h3>\n' },
      { icon: AlignLeft,    label: 'Paragraph',   snippet: '<p>Write your paragraph here.</p>\n' },
      { icon: Minus,        label: 'Divider',     snippet: '<hr />\n' },
    ],
  },
  {
    label: 'Lists',
    items: [
      { icon: List,         label: 'Bullet List', snippet: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n' },
      { icon: ListOrdered,  label: 'Numbered',    snippet: '<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n  <li>Step 3</li>\n</ol>\n' },
    ],
  },
  {
    label: 'Inline',
    items: [
      { icon: Bold,         label: 'Bold',        snippet: '<strong>bold text</strong>' },
      { icon: Italic,       label: 'Italic',      snippet: '<em>italic text</em>' },
      { icon: Quote,        label: 'Blockquote',  snippet: '<blockquote>\n  <p>Your quote here.</p>\n</blockquote>\n' },
      { icon: Link2,        label: 'Link',        snippet: '<a href="https://" target="_blank" rel="noopener">Link text</a>' },
    ],
  },
  {
    label: 'Media',
    items: [
      { icon: ImageIcon,    label: 'Image',       snippet: '<img src="PASTE_CLOUDINARY_URL_HERE" alt="Description" style="width:100%;border-radius:12px;margin:1rem 0;" />\n' },
      { icon: Table2,       label: 'Table',       snippet: '<table style="width:100%;border-collapse:collapse;">\n  <thead>\n    <tr style="background:#f3f4f6;">\n      <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Header 1</th>\n      <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="padding:10px;border:1px solid #e5e7eb;">Cell 1</td>\n      <td style="padding:10px;border:1px solid #e5e7eb;">Cell 2</td>\n    </tr>\n  </tbody>\n</table>\n' },
    ],
  },
  {
    label: 'Code',
    items: [
      { icon: Type,         label: 'Inline code', snippet: '<code>inline code</code>' },
      { icon: FileCode,     label: 'Code block',  snippet: '<pre><code>// Your code here\nconst example = true;\n</code></pre>\n' },
    ],
  },
];

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  snippet: string,
  onChange: (val: string) => void,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  const newVal = before + snippet + after;
  onChange(newVal);
  // Restore focus + place cursor after the inserted snippet
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
  });
}

export default function BlogForm({ onSuccess, initial }: Props) {
  const isEdit = !!initial;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [itineraries, setItineraries] = useState<{ _id: string; title: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmbedPicker, setShowEmbedPicker] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const embedPickerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title:              initial?.title       ?? '',
    slug:               initial?.slug        ?? '',
    content:            initial?.content     ?? '',
    thumbnail:          initial?.thumbnail   ?? '',
    thumbnailUrl:       initial?.thumbnail   ?? '',   // for manual URL input
    tags:               (initial?.tags ?? []).join(', '),
    author:             initial?.author      ?? 'Seematra Editorial',
    isRecommended:      initial?.isRecommended ?? false,
    videoUrl:           initial?.videoUrl    ?? '',
    relatedItinerary:   initial?.relatedItinerary ?? '',
    sections:           initial?.sections    ?? [],
    faqs:               initial?.faqs        ?? [],
  });

  useEffect(() => {
    api.get('/itineraries?limit=50').then((res: any) => {
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setItineraries(list.map((it: any) => ({ _id: it._id, title: it.title })));
    }).catch(() => {});
  }, []);

  // Close embed picker on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (embedPickerRef.current && !embedPickerRef.current.contains(e.target as Node)) {
        setShowEmbedPicker(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const setContent = useCallback((val: string) => {
    setFormData(p => ({ ...p, content: val }));
  }, []);

  const handleSnippet = useCallback((snippet: string) => {
    if (contentRef.current) insertAtCursor(contentRef.current, snippet, setContent);
  }, [setContent]);

  const embedItinerary = (it: { _id: string; title: string }) => {
    const snippet = `\n<!-- Itinerary Embed: ${it.title} -->\n<div data-itinerary-embed="${it._id}"></div>\n`;
    if (contentRef.current) insertAtCursor(contentRef.current, snippet, setContent);
    setShowEmbedPicker(false);
    toast.success(`Embedded "${it.title}" — it will appear as a scrollable card on the blog!`);
  };

  // ── Thumbnail upload (file) ────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'blogs');
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setFormData(p => ({ ...p, thumbnail: result.url, thumbnailUrl: result.url }));
      toast.success('Thumbnail uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Section helpers ───────────────────────────────────────────────────────
  const handleSectionUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'blogs');
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

  const addSection = () => setFormData(p => ({ ...p, sections: [...p.sections, { header: '', paragraph: '', image: '' }] }));
  const updateSection = (i: number, key: string, v: string) => {
    const s = [...formData.sections]; s[i] = { ...s[i], [key]: v };
    setFormData(p => ({ ...p, sections: s }));
  };
  const removeSection = (i: number) => {
    const s = [...formData.sections]; s.splice(i, 1);
    setFormData(p => ({ ...p, sections: s }));
  };

  const addFaq = () => setFormData(p => ({ ...p, faqs: [...p.faqs, { question: '', answer: '' }] }));
  const updateFaq = (i: number, key: string, v: string) => {
    const f = [...formData.faqs]; f[i] = { ...f[i], [key]: v };
    setFormData(p => ({ ...p, faqs: f }));
  };
  const removeFaq = (i: number) => {
    const f = [...formData.faqs]; f.splice(i, 1);
    setFormData(p => ({ ...p, faqs: f }));
  };

  const generateSlug = (t: string) =>
    t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        thumbnail: formData.thumbnailUrl || formData.thumbnail,
        tags: formData.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      if (!payload.relatedItinerary) payload.relatedItinerary = null;

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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto text-left">

      {/* ═══ META FIELDS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">Title *</label>
          <input
            required type="text" className="input-field"
            placeholder="Ultimate Guide to Kedarnath Trek"
            value={formData.title}
            onChange={e => setFormData(p => ({ ...p, title: e.target.value, slug: isEdit ? p.slug : generateSlug(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Slug <span className="text-brand-text/40 font-normal">(URL path)</span></label>
          <input
            required type="text" className="input-field font-mono text-sm"
            placeholder="ultimate-guide-to-kedarnath"
            value={formData.slug}
            onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Author</label>
          <input type="text" className="input-field" value={formData.author}
            onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">
            Video URL <span className="text-brand-text/40 font-normal">(Reels / Facebook — Optional)</span>
          </label>
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

        {/* ── Thumbnail ── */}
        <div>
          <label className="block text-sm font-bold mb-1">Thumbnail</label>
          {(formData.thumbnailUrl || formData.thumbnail) && (
            <div className="mb-2 relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={formData.thumbnailUrl || formData.thumbnail} alt="thumb" className="h-20 rounded-xl object-cover border border-brand-border dark:border-brand-border-dark" />
            </div>
          )}
          <div className="space-y-2">
            <input
              type="text" className="input-field text-sm font-mono"
              placeholder="Paste Cloudinary URL (from Media Library)"
              value={formData.thumbnailUrl}
              onChange={e => setFormData(p => ({ ...p, thumbnailUrl: e.target.value, thumbnail: e.target.value }))}
            />
            <div className="flex items-center gap-2 text-xs text-brand-text/50 font-inter">
              <div className="flex-1 h-px bg-brand-border dark:bg-brand-border-dark" />
              <span>or upload a new file</span>
              <div className="flex-1 h-px bg-brand-border dark:bg-brand-border-dark" />
            </div>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="input-field py-2 text-sm" />
          </div>
        </div>

        {/* ── Related Itinerary ── */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold mb-1">
            Link to Itinerary{' '}
            <span className="text-brand-text/40 font-normal">(shows roadmap + floating Book Now on blog)</span>
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
          <p className="text-xs text-brand-text/40 mt-1">
            You can also embed specific itineraries <em>inline</em> inside the HTML content using the toolbar below.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.isRecommended}
            onChange={e => setFormData(p => ({ ...p, isRecommended: e.target.checked }))} />
          <span className="text-sm font-bold">Mark as Featured</span>
        </label>
      </div>

      {/* ═══ HTML CONTENT EDITOR ═══ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-outfit font-bold flex items-center gap-2">
              <Code2 size={18} className="text-primary" />
              HTML Content Editor
            </h3>
            <p className="text-xs text-brand-text/50 font-inter mt-0.5">
              Paste full HTML from AI assistants. Supports all HTML tags.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
              showPreview
                ? 'bg-primary text-white'
                : 'border border-brand-border dark:border-brand-border-dark text-brand-text/70 hover:border-primary hover:text-primary'
            }`}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? 'Hide Preview' : 'Live Preview'}
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-xl p-2 flex flex-wrap gap-1 items-center">
          {TOOLBAR_GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-center gap-1">
              {gi > 0 && <div className="w-px h-5 bg-brand-border dark:bg-brand-border-dark mx-1" />}
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    title={item.label}
                    onClick={() => handleSnippet(item.snippet)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-brand-text/70 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-brand-border dark:bg-brand-border-dark mx-1" />

          {/* Embed Itinerary Picker */}
          <div className="relative" ref={embedPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmbedPicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
            >
              <MapPin size={13} />
              Embed Itinerary
              <ChevronDown size={11} className={`transition-transform ${showEmbedPicker ? 'rotate-180' : ''}`} />
            </button>
            {showEmbedPicker && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <p className="text-[10px] text-brand-text/50 font-inter px-2 pb-1.5 font-medium">
                    Select itinerary to embed inline:
                  </p>
                  {itineraries.length === 0 && (
                    <p className="text-xs text-brand-text/40 px-2 py-3 font-inter">No itineraries found</p>
                  )}
                  {itineraries.map(it => (
                    <button
                      key={it._id}
                      type="button"
                      onClick={() => embedItinerary(it)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-outfit font-semibold text-brand-text dark:text-brand-text-dark hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <MapPin size={12} className="text-secondary shrink-0" />
                      {it.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-xs text-brand-text/40 font-inter">
            <Sparkles size={11} />
            All HTML tags supported
          </div>
        </div>

        {/* Editor + Preview split */}
        <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Code editor */}
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] text-brand-text/30 font-mono z-10 pointer-events-none">
              <Code2 size={10} />
              HTML
            </div>
            <textarea
              ref={contentRef}
              className="w-full h-[500px] bg-[#0d1117] text-[#c9d1d9] font-mono text-sm p-4 pt-8 rounded-xl border border-brand-border dark:border-brand-border-dark resize-y leading-relaxed focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-[#4d5566]"
              placeholder={`<h2>Introduction</h2>\n<p>Write your guide here...</p>\n\n<h2>Day 1: Arrival</h2>\n<p>Your content...</p>\n\n<!-- Paste full AI-generated HTML articles here -->`}
              value={formData.content}
              onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
              spellCheck={false}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-brand-text/30 font-mono pointer-events-none">
              {formData.content.length.toLocaleString()} chars
            </div>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] text-brand-text/40 font-mono z-10 pointer-events-none">
                <Eye size={10} />
                PREVIEW
              </div>
              <div
                className="h-[500px] overflow-y-auto p-4 pt-8 rounded-xl border border-primary/30 bg-surface dark:bg-surface-dark prose prose-sm md:prose-base dark:prose-invert max-w-none font-inter prose-headings:font-outfit prose-headings:font-bold prose-headings:text-primary prose-strong:text-primary prose-img:rounded-xl prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400 text-sm italic">Start writing HTML to see the preview…</p>' }}
              />
            </div>
          )}
        </div>

        {/* Hint banner */}
        <div className="flex items-start gap-2 p-3 bg-secondary/5 border border-secondary/20 rounded-xl text-xs font-inter text-brand-text/60 dark:text-brand-text-dark/60">
          <Sparkles size={13} className="text-secondary mt-0.5 shrink-0" />
          <span>
            <strong className="font-bold text-secondary">Pro tip:</strong>{' '}
            Copy a full HTML article from ChatGPT or Gemini, paste it here. Use the toolbar buttons to insert headings, images, lists and more. 
            Upload images via the <strong>Media Library</strong> tab on the left, then copy the URL and use it in{' '}
            <code className="bg-surface dark:bg-surface-dark px-1 rounded">&lt;img src="URL"&gt;</code>.
          </span>
        </div>
      </div>

      {/* ═══ DYNAMIC SECTIONS ═══ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-border-dark pb-3">
          <div>
            <h3 className="text-lg font-outfit font-bold">Dynamic Sections</h3>
            <p className="text-xs text-brand-text/50 font-inter">Optional structured sections displayed after the HTML content.</p>
          </div>
          <button type="button" onClick={addSection} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
            <Plus size={14} /> Add Section
          </button>
        </div>
        {formData.sections.map((sec: any, idx: number) => (
          <div key={idx} className="p-5 border border-brand-border dark:border-brand-border-dark rounded-xl space-y-4 bg-surface/50 dark:bg-surface-dark/50 relative">
            <button type="button" onClick={() => removeSection(idx)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <Trash2 size={14} />
            </button>
            <div>
              <label className="block text-sm font-bold mb-1">Section Header</label>
              <input type="text" className="input-field" placeholder="E.g. Day 1: Arrival"
                value={sec.header || ''} onChange={e => updateSection(idx, 'header', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Paragraph</label>
              <textarea className="input-field h-28" placeholder="Write the paragraph…"
                value={sec.paragraph || ''} onChange={e => updateSection(idx, 'paragraph', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Image</label>
              {sec.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sec.image} alt="section" className="h-24 rounded-xl mb-2 object-cover" />
              )}
              <input
                type="text" className="input-field text-sm font-mono mb-2"
                placeholder="Paste Cloudinary URL"
                value={sec.image || ''}
                onChange={e => updateSection(idx, 'image', e.target.value)}
              />
              <input type="file" accept="image/*" onChange={e => handleSectionUpload(idx, e)} disabled={uploading} className="input-field py-2 text-sm" />
            </div>
          </div>
        ))}
        {formData.sections.length === 0 && (
          <p className="text-sm text-brand-text/40 font-inter text-center py-4">
            No sections yet. Add structured image+text blocks if needed.
          </p>
        )}
      </div>

      {/* ═══ FAQS ═══ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-border-dark pb-3">
          <h3 className="text-lg font-outfit font-bold">Frequently Asked Questions</h3>
          <button type="button" onClick={addFaq} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
            <Plus size={14} /> Add FAQ
          </button>
        </div>
        {formData.faqs.map((faq: any, idx: number) => (
          <div key={idx} className="p-5 border border-brand-border dark:border-brand-border-dark rounded-xl space-y-3 bg-surface/50 dark:bg-surface-dark/50 relative">
            <button type="button" onClick={() => removeFaq(idx)} className="absolute top-4 right-4 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <Trash2 size={14} />
            </button>
            <div>
              <label className="block text-sm font-bold mb-1">Question</label>
              <input type="text" className="input-field pr-20" placeholder="E.g. What is the best time to visit?"
                value={faq.question || ''} onChange={e => updateFaq(idx, 'question', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Answer</label>
              <textarea className="input-field h-24" placeholder="Write the answer…"
                value={faq.answer || ''} onChange={e => updateFaq(idx, 'answer', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      {/* ═══ SUBMIT ═══ */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-brand-border dark:border-brand-border-dark">
        {uploading && <span className="text-sm text-brand-text/50 animate-pulse">Uploading…</span>}
        <button disabled={loading || uploading} type="submit" className="btn-primary min-w-[180px] justify-center">
          {loading ? 'Saving…' : isEdit ? '✓ Update Blog' : '🚀 Publish Blog'}
        </button>
      </div>
    </form>
  );
}
