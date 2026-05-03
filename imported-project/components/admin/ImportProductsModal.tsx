'use client';

import { useState, useRef } from 'react';

const PRIMARY = '#1B3A6B';

type ValidationResult = {
  valid: boolean;
  totalRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
  preview?: Array<Record<string, unknown>>;
};

export default function ImportProductsModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: number;
    failed?: number;
    errors?: Array<{ row: number; sku: string; message: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setResult(null);
    setImportResult(null);
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/products/validate-import', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      setResult(data);
    } catch (_) {
      setResult({
        valid: false,
        totalRows: 0,
        errors: [{ row: 0, field: 'file', message: 'Request failed' }],
        warnings: [],
      });
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !result?.valid) return;
    setImporting(true);
    setImportResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      setImportResult(data);
      if (data.success && data.imported > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (_) {
      setImportResult({ success: false });
    } finally {
      setImporting(false);
    }
  };

  const close = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        Import Products
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3">
              <h2 className="text-lg font-semibold text-zinc-900">Import Products</h2>
              <button
                type="button"
                onClick={close}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 text-sm text-zinc-600">Upload .xlsx file only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-zinc-600 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={!file || validating}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {validating ? 'Validating...' : 'Validate'}
                </button>
              </div>

              {result && (
                <div className="space-y-3">
                  {result.errors.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="mb-2 text-sm font-medium text-red-800">Errors (fix in Excel and re-upload)</p>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-red-700">
                              <th className="py-1 pr-2">Row</th>
                              <th className="py-1 pr-2">Field</th>
                              <th className="py-1">Message</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.errors.map((e, i) => (
                              <tr key={i} className="border-t border-red-100">
                                <td className="py-1 pr-2">{e.row}</td>
                                <td className="py-1 pr-2">{e.field}</td>
                                <td className="py-1">{e.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {result.valid && result.errors.length === 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                      <p>All rows valid. Import {result.totalRows} products?</p>
                      <button
                        type="button"
                        onClick={handleImport}
                        disabled={importing}
                        className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        {importing ? 'Importing...' : 'Import ' + result.totalRows + ' Products'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {importResult && (
                <div
                  className={
                    'rounded-lg border p-3 text-sm ' +
                    (importResult.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-800')
                  }
                >
                  {importResult.success ? (
                    <p>
                      {importResult.imported ?? 0} products imported successfully.
                      {importResult.failed ? ' ' + (importResult.failed as number) + ' failed.' : ''}
                    </p>
                  ) : (
                    <p>{importResult.errors?.length ? 'Some rows failed.' : 'Import failed.'}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
