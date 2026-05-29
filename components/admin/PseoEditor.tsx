'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Props {
  initial: any;
  onSuccess: () => void;
}

export default function PseoEditor({ initial, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'published',
    seo: { meta_description: '', primary_keyword: '' },
    contentStr: '{}',
    faqStr: '[]'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setFormData({
        title: initial.title || '',
        slug: initial.slug || '',
        status: initial.status || 'published',
        seo: initial.seo || { meta_description: '', primary_keyword: '' },
        contentStr: JSON.stringify(initial.content || {}, null, 2),
        faqStr: JSON.stringify(initial.faq || [], null, 2),
      });
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let parsedContent, parsedFaq;
      try {
        parsedContent = JSON.parse(formData.contentStr);
        parsedFaq = JSON.parse(formData.faqStr);
      } catch (err) {
        toast.error('Invalid JSON in Content or FAQ');
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        status: formData.status,
        seo: formData.seo,
        content: parsedContent,
        faq: parsedFaq,
      };

      await api.put(`/admin/pseo/${initial.slug}`, payload);
      toast.success('Travel Guide updated');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onSuccess} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        <Link href={`/explore/${initial.slug}`} target="_blank" className="text-primary hover:underline text-sm flex items-center gap-1 font-medium">
          View Live <ExternalLink size={14} />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text/70 dark:text-brand-text-dark/70">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface-dark/5 dark:bg-black/20 border border-brand-border dark:border-brand-border-dark rounded-xl px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text/70 dark:text-brand-text-dark/70">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-surface-dark/5 dark:bg-black/20 border border-brand-border dark:border-brand-border-dark rounded-xl px-4 py-2.5"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* SEO Info */}
        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-brand-border dark:border-brand-border-dark">
          <h4 className="font-outfit font-bold text-lg">SEO Information</h4>
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text/70 dark:text-brand-text-dark/70">Meta Description</label>
            <textarea 
              rows={2}
              value={formData.seo.meta_description}
              onChange={e => setFormData({ ...formData, seo: { ...formData.seo, meta_description: e.target.value } })}
              className="w-full bg-surface-dark/5 dark:bg-black/20 border border-brand-border dark:border-brand-border-dark rounded-xl px-4 py-2.5"
            />
          </div>
        </div>

        {/* JSON Content Editors */}
        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-brand-border dark:border-brand-border-dark">
          <h4 className="font-outfit font-bold text-lg">Page Content (JSON)</h4>
          <p className="text-xs text-brand-text/50">Edit the raw structured data for this page.</p>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text/70 dark:text-brand-text-dark/70">Content Object</label>
            <textarea 
              rows={15}
              value={formData.contentStr}
              onChange={e => setFormData({ ...formData, contentStr: e.target.value })}
              className="w-full bg-surface-dark/5 dark:bg-black/20 border border-brand-border dark:border-brand-border-dark rounded-xl px-4 py-2.5 font-mono text-sm whitespace-pre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text/70 dark:text-brand-text-dark/70">FAQ Array</label>
            <textarea 
              rows={10}
              value={formData.faqStr}
              onChange={e => setFormData({ ...formData, faqStr: e.target.value })}
              className="w-full bg-surface-dark/5 dark:bg-black/20 border border-brand-border dark:border-brand-border-dark rounded-xl px-4 py-2.5 font-mono text-sm whitespace-pre"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-brand-border dark:border-brand-border-dark">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
