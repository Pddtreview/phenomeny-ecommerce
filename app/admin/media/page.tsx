'use client';

import { useState, useEffect, useCallback } from 'react';

const PRIMARY = '#1B3A6B';

type MediaImage = {
  public_id: string;
  secure_url: string;
  filename: string;
  created_at: string | null;
  bytes: number | null;
};

export default function AdminMediaPage() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [copyId, setCopyId] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media/list');
      const data = await res.json();
      if (data.images) setImages(data.images);
      else setImages([]);
    } catch (_) {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const filtered = search.trim()
    ? images.filter((img) =>
        img.filename.toLowerCase().includes(search.trim().toLowerCase())
      )
    : images;

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyId(id);
      setTimeout(() => setCopyId(null), 2000);
    } catch (_) {}
  };

  const handleDelete = async (public_id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch('/api/admin/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });
      const data = await res.json();
      if (data.success) fetchImages();
      else alert(data.error || 'Delete failed');
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress('Uploading...');
    try {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) {
        form.append('files', files[i]);
      }
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        setUploadProgress('Done. Refreshing...');
        await fetchImages();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (_) {
      alert('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Media Library</h1>
        <div className="flex items-center gap-3">
          {uploadProgress && (
            <span className="text-sm text-zinc-500">{uploadProgress}</span>
          )}
          <label
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: PRIMARY }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
            />
            {uploading ? 'Uploading...' : 'Upload'}
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          {search.trim() ? 'No images match your search.' : 'No images yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {filtered.map((img) => (
            <div
              key={img.public_id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="aspect-square bg-zinc-100">
                <img
                  src={img.secure_url}
                  alt={img.filename}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-zinc-900" title={img.filename}>
                  {img.filename}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(img.secure_url, img.public_id)}
                    className="rounded border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    {copyId === img.public_id ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.public_id)}
                    className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
