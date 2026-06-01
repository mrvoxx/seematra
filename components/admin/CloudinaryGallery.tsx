'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload, Copy, Check, Folder, Image as ImageIcon,
  RefreshCw, Trash2, X, CloudUpload, Grid3X3, List,
  ChevronDown, ExternalLink, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CloudImage {
  publicId: string;
  url: string;
  filename: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  format: string;
}

const FOLDERS = [
  { value: 'seematra', label: 'General (seematra)' },
  { value: 'blogs',       label: 'Blog Images' },
  { value: 'itineraries', label: 'Itinerary Images' },
  { value: 'hotels',      label: 'Hotel Photos' },
];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CloudinaryGallery() {
  const [folder, setFolder] = useState('seematra');
  const [images, setImages] = useState<CloudImage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; done: boolean }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CloudImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async (f = folder) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/upload/list?folder=${f}&max=80`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setImages(data.images || []);
      setLoaded(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load images');
    } finally {
      setFetching(false);
    }
  }, [folder]);

  const handleFolderChange = (f: string) => {
    setFolder(f);
    setLoaded(false);
    setImages([]);
    fetchImages(f);
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(f => ALLOWED_TYPES.includes(f.type));
    if (validFiles.length === 0) {
      toast.error('Only JPEG, PNG, WebP, GIF, AVIF files are allowed.');
      return;
    }

    setUploading(true);
    setUploadProgress(validFiles.map(f => ({ name: f.name, done: false })));

    const newImages: CloudImage[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Upload failed');
        newImages.push({
          publicId: result.publicId,
          url: result.url,
          filename: file.name.replace(/\.[^.]+$/, ''),
          width: 0, height: 0,
          bytes: file.size,
          createdAt: new Date().toISOString(),
          format: file.type.split('/')[1],
        });
        setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, done: true } : p));
      } catch (err: any) {
        toast.error(`Failed: ${file.name} — ${err.message}`);
      }
    }

    setImages(prev => [...newImages, ...prev]);
    setUploading(false);
    if (newImages.length > 0) toast.success(`${newImages.length} image(s) uploaded!`);
    setTimeout(() => setUploadProgress([]), 2000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) uploadFiles(files);
  };

  const copyUrl = async (img: CloudImage) => {
    try {
      await navigator.clipboard.writeText(img.url);
      setCopiedId(img.publicId);
      toast.success('URL copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy — please copy manually');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-outfit font-extrabold">Media Library</h2>
          <p className="text-sm text-brand-text/60 dark:text-brand-text-dark/60 font-inter mt-0.5">
            Upload photos to Cloudinary, then copy links to use in blogs &amp; guides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2.5 rounded-xl border border-brand-border dark:border-brand-border-dark hover:border-primary/50 text-brand-text/60 hover:text-primary transition-colors"
            title={viewMode === 'grid' ? 'List view' : 'Grid view'}
          >
            {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
          </button>
          <button
            onClick={() => fetchImages(folder)}
            disabled={fetching}
            className="p-2.5 rounded-xl border border-brand-border dark:border-brand-border-dark hover:border-primary/50 text-brand-text/60 hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Folder Selector */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleFolderChange(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-outfit transition-all ${
              folder === f.value
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'bg-brand-card dark:bg-brand-card-dark border border-brand-border dark:border-brand-border-dark text-brand-text/70 hover:border-primary/50 hover:text-primary'
            }`}
          >
            <Folder size={12} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-brand-border dark:border-brand-border-dark hover:border-primary/60 hover:bg-primary/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            dragOver ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
          }`}>
            <CloudUpload size={28} />
          </div>
          <div>
            <p className="font-outfit font-bold text-brand-text dark:text-brand-text-dark">
              {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
            </p>
            <p className="text-xs text-brand-text/50 dark:text-brand-text-dark/50 font-inter mt-1">
              JPEG, PNG, WebP, GIF, AVIF · Max 10MB each · Multiple files OK
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {uploadProgress.map((p, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  p.done
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-primary/10 text-primary animate-pulse'
                }`}
              >
                {p.done ? <Check size={10} /> : <Upload size={10} />}
                {p.name.length > 18 ? p.name.slice(0, 15) + '…' : p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Load Gallery Button */}
      {!loaded && !fetching && (
        <div className="text-center py-4">
          <button
            onClick={() => fetchImages(folder)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ImageIcon size={16} />
            Load Gallery from Cloudinary
          </button>
          <p className="text-xs text-brand-text/40 mt-2 font-inter">
            Fetches all images already in the "{folder}" folder
          </p>
        </div>
      )}

      {/* Loading State */}
      {fetching && (
        <div className="flex items-center justify-center py-12 gap-3 text-brand-text/50">
          <RefreshCw size={18} className="animate-spin text-primary" />
          <span className="font-inter text-sm">Loading images…</span>
        </div>
      )}

      {/* Empty State */}
      {loaded && !fetching && images.length === 0 && (
        <div className="text-center py-16 text-brand-text/40 font-inter">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-outfit font-bold">No images in "{folder}" folder yet</p>
          <p className="text-sm mt-1">Upload images above to see them here</p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-brand-text/50 font-inter">
            <span>{images.length} image{images.length !== 1 ? 's' : ''} in <strong>{folder}</strong></span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map(img => (
                <div
                  key={img.publicId}
                  className="group relative rounded-xl overflow-hidden border border-brand-border dark:border-brand-border-dark bg-brand-card dark:bg-brand-card-dark hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-28 object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); copyUrl(img); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        copiedId === img.publicId
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-900 hover:bg-primary hover:text-white'
                      }`}
                    >
                      {copiedId === img.publicId ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === img.publicId ? 'Copied!' : 'Copy URL'}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); window.open(img.url, '_blank'); }}
                      className="flex items-center gap-1 text-white/80 hover:text-white text-xs"
                    >
                      <ExternalLink size={11} /> Open
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-inter text-brand-text/60 truncate">{img.filename}</p>
                    <p className="text-[10px] text-brand-text/40">{formatBytes(img.bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-brand-border dark:divide-brand-border-dark rounded-2xl border border-brand-border dark:border-brand-border-dark overflow-hidden">
              {images.map(img => (
                <div key={img.publicId} className="flex items-center gap-4 p-3 hover:bg-surface/50 dark:hover:bg-surface-dark/50 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.filename} className="w-14 h-10 object-cover rounded-lg shrink-0" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-outfit truncate">{img.filename}</p>
                    <p className="text-[10px] text-brand-text/50 font-mono truncate">{img.url}</p>
                    <p className="text-[10px] text-brand-text/40">{formatBytes(img.bytes)} · {img.format?.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => copyUrl(img)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                      copiedId === img.publicId
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {copiedId === img.publicId ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === img.publicId ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-brand-card dark:bg-brand-card-dark rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage.url} alt={selectedImage.filename} className="w-full max-h-80 object-contain bg-surface dark:bg-surface-dark" />
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-outfit font-bold truncate">{selectedImage.filename}</p>
                  <p className="text-xs text-brand-text/50 font-inter mt-0.5">
                    {formatBytes(selectedImage.bytes)} · {selectedImage.format?.toUpperCase()}
                    {selectedImage.width > 0 && ` · ${selectedImage.width}×${selectedImage.height}`}
                  </p>
                </div>
                <button onClick={() => setSelectedImage(null)} className="p-2 rounded-lg hover:bg-surface dark:hover:bg-surface-dark text-brand-text/50">
                  <X size={16} />
                </button>
              </div>

              {/* URL field */}
              <div className="flex gap-2">
                <input
                  readOnly
                  value={selectedImage.url}
                  className="input-field flex-1 font-mono text-xs"
                  onFocus={e => e.target.select()}
                />
                <button
                  onClick={() => copyUrl(selectedImage)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors shrink-0 ${
                    copiedId === selectedImage.publicId
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {copiedId === selectedImage.publicId ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === selectedImage.publicId ? 'Copied!' : 'Copy URL'}
                </button>
              </div>

              <p className="text-[11px] text-brand-text/40 font-inter flex items-center gap-1.5">
                <AlertCircle size={11} />
                Paste this URL directly into your blog HTML: <code className="bg-surface dark:bg-surface-dark px-1 py-0.5 rounded text-[10px]">&lt;img src="URL" /&gt;</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
