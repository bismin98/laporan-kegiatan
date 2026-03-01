'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { Activity } from '@/types/activity';

export default function AdminPage() {
  const [tanggal, setTanggal] = useState('');
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formattedActivities, setFormattedActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editData, setEditData] = useState<Partial<Activity> | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      router.push('/');
      return;
    }

    fetchActivities();
  }, [router]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data.activities);
      setFormattedActivities(
        data.activities.map((activity: Activity) => ({
          ...activity,
          tanggalStr: new Date(activity.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          }),
          createdAtStr: new Date(activity.createdAt).toLocaleString('id-ID'),
        }))
      );
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        import('heic2any').then(heic2any => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const conversionResult = await heic2any.default({
                blob: new Blob([reader.result as ArrayBuffer]),
                toType: 'image/jpeg',
                quality: 0.8,
              });
              const convertedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
              const url = URL.createObjectURL(convertedBlob);
              setFoto(url);
            } catch (err) {
              setFoto('');
              alert('Gagal konversi HEIC. Silakan upload file JPEG/PNG.');
            }
          };
          reader.readAsArrayBuffer(file);
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal,
          namaKegiatan,
          keterangan,
          foto,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Kegiatan berhasil ditambahkan!');
        setTanggal('');
        setNamaKegiatan('');
        setKeterangan('');
        setFoto('');
        fetchActivities();
        
        // Clear the file input
        const fileInput = document.getElementById('foto') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage('Gagal menambahkan kegiatan.');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Kegiatan berhasil dihapus!');
        fetchActivities();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    router.push('/');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-fuchsia-600 via-purple-600 to-cyan-500">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-400/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />

      <nav className="relative border-b border-white/30 bg-white/15 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-rose-500 px-4 py-2 text-white shadow-lg transition hover:bg-rose-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl">
            <h2 className="mb-6 text-xl font-bold text-slate-800">
              Tambah Kegiatan Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tanggal" className="mb-2 block text-sm font-medium text-slate-700">
                  Tanggal Kegiatan
                </label>
                <input
                  type="date"
                  id="tanggal"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="namaKegiatan" className="mb-2 block text-sm font-medium text-slate-700">
                  Nama Kegiatan
                </label>
                <input
                  type="text"
                  id="namaKegiatan"
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="Masukkan nama kegiatan"
                  required
                />
              </div>

              <div>
                <label htmlFor="keterangan" className="mb-2 block text-sm font-medium text-slate-700">
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="Masukkan keterangan kegiatan"
                  required
                />
              </div>

              <div>
                <label htmlFor="foto" className="mb-2 block text-sm font-medium text-slate-700">
                  Foto Kegiatan
                </label>
                <input
                  type="file"
                  id="foto"
                  accept="image/jpeg,image/jpg,image/png,image/heic"
                  onChange={handleImageUpload}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-100 file:px-3 file:py-1.5 file:text-fuchsia-700 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                  required
                />
                {foto && (
                  <img
                    src={foto}
                    alt="Preview"
                    className="mt-4 h-48 w-full rounded-xl object-cover"
                  />
                )}
              </div>

              {message && (
                <div className={`rounded-xl p-3 text-sm ${
                  message.includes('berhasil') 
                    ? 'bg-green-50 border border-green-200 text-green-600'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-linear-to-r from-fuchsia-600 to-cyan-500 py-3 font-semibold text-white shadow-lg transition hover:from-fuchsia-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
              >
                {loading ? 'Menambahkan...' : 'Tambah Kegiatan'}
              </button>
            </form>
          </div>

          {/* Activities List Section */}
          <div className="rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full bg-linear-to-br from-fuchsia-400 via-cyan-400 to-pink-400 p-2 shadow-lg">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a1 1 0 0 1 1 1v14.586l4.293-4.293a1 1 0 0 1 1.414 1.414l-6 6a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 1.414-1.414L11 17.586V3a1 1 0 0 1 1-1Z"/></svg>
              </span>
              <h2 className="text-2xl font-extrabold text-fuchsia-700 drop-shadow tracking-wide">Daftar Kegiatan</h2>
              <span className="ml-auto text-xs font-bold text-cyan-600 bg-cyan-100 rounded-full px-3 py-1">{activities.length} Kegiatan</span>
            </div>

            <div className="max-h-150 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="py-8 text-center text-slate-500 font-sans">
                  Belum ada kegiatan yang ditambahkan
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {formattedActivities.map((activity, idx) => (
                    <div
                      key={activity.id}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className={`overflow-hidden rounded-lg border-2 transition-shadow duration-300 hover:shadow-2xl animate-fade-slide-in font-sans cursor-pointer w-full text-xs flex flex-col justify-between min-w-0 sm:min-w-35 sm:max-w-42.5 aspect-square ${[
                        'bg-linear-to-br from-pink-100 via-fuchsia-100 to-cyan-100 border-fuchsia-300',
                        'bg-linear-to-br from-cyan-100 via-indigo-100 to-pink-100 border-cyan-300',
                        'bg-linear-to-br from-yellow-100 via-orange-100 to-pink-100 border-yellow-300',
                        'bg-linear-to-br from-green-100 via-teal-100 to-cyan-100 border-green-300',
                        'bg-linear-to-br from-purple-100 via-fuchsia-100 to-blue-100 border-purple-300',
                      ][idx % 5]}`}
                      onClick={() => setSelectedActivity(activity)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Lihat detail ${activity.namaKegiatan}`}
                    >
                      <div className="p-2 sm:p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white shadow" style={{background: ['#e879f9','#06b6d4','#fbbf24','#22c55e','#a78bfa'][idx%5]}}>
                            {(() => {
                              const d = new Date(activity.tanggal);
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = (d.getMonth() + 1).toString().padStart(2, '0');
                              const year = d.getFullYear();
                              return `${day}/${month}/${year}`;
                            })()}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(activity.id); }}
                            className="ml-2 p-1 rounded-full hover:bg-rose-100"
                            aria-label="Hapus kegiatan"
                          >
                            <Icon icon="mdi:delete-circle-outline" width={18} height={18} className="text-rose-500" />
                          </button>
                        </div>
                        <h3 className="mb-1 text-[13px] font-bold text-slate-800 leading-tight line-clamp-1">
                          {activity.namaKegiatan}
                        </h3>
                        <p className="line-clamp-2 text-[11px] text-slate-600 leading-tight">
                          {activity.keterangan}
                        </p>
                        {activity.foto && (
                          <div className="relative h-16 w-full overflow-hidden rounded-t-lg bg-slate-200 mt-2">
                            <img
                              src={activity.foto}
                              alt={activity.namaKegiatan}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="mt-2 border-t border-slate-200 pt-2">
                          <p className="text-xs text-slate-400">
                            Ditambahkan: {activity.createdAtStr}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                      {/* Popup Detail Modal */}
                      {selectedActivity && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-slide-in">
                            <button
                              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                              onClick={() => { setSelectedActivity(null); setEditData(null); setEditMessage(''); }}
                              aria-label="Tutup detail"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <h2 className="mb-4 text-xl font-bold text-slate-800">Edit Kegiatan</h2>
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (!editData) return;
                                setEditLoading(true);
                                setEditMessage('');
                                try {
                                  const response = await fetch(`/api/activities?id=${selectedActivity.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(editData),
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    setEditMessage('Berhasil mengedit kegiatan!');
                                    setSelectedActivity(null);
                                    setEditData(null);
                                    fetchActivities();
                                  } else {
                                    setEditMessage('Gagal mengedit kegiatan.');
                                  }
                                } catch (err) {
                                  setEditMessage('Terjadi kesalahan.');
                                } finally {
                                  setEditLoading(false);
                                }
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
                                <input
                                  type="date"
                                  value={editData?.tanggal ?? selectedActivity.tanggal}
                                  onChange={e => setEditData({ ...selectedActivity, ...editData, tanggal: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                                  required
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Nama Kegiatan</label>
                                <input
                                  type="text"
                                  value={editData?.namaKegiatan ?? selectedActivity.namaKegiatan}
                                  onChange={e => setEditData({ ...selectedActivity, ...editData, namaKegiatan: e.target.value })}
                                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                                  required
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Keterangan</label>
                                <textarea
                                  value={editData?.keterangan ?? selectedActivity.keterangan}
                                  onChange={e => setEditData({ ...selectedActivity, ...editData, keterangan: e.target.value })}
                                  rows={3}
                                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                                  required
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Foto</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setEditData({ ...selectedActivity, ...editData, foto: reader.result as string });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-100 file:px-3 file:py-1.5 file:text-fuchsia-700 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
                                />
                                {(editData?.foto ?? selectedActivity.foto) && (
                                  <img
                                    src={editData?.foto ?? selectedActivity.foto}
                                    alt="Preview"
                                    className="mt-4 h-40 w-full rounded-xl object-cover border"
                                  />
                                )}
                              </div>
                              {editMessage && (
                                <div className={`rounded-xl p-3 text-sm ${editMessage.includes('Berhasil') ? 'bg-green-50 border border-green-200 text-green-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>{editMessage}</div>
                              )}
                              <button
                                type="submit"
                                disabled={editLoading}
                                className="w-full rounded-xl bg-linear-to-r from-fuchsia-600 to-cyan-500 py-3 font-semibold text-white shadow-lg transition hover:from-fuchsia-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                              >
                                {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                            </form>
                            <p className="mt-4 text-xs text-slate-400">
                              Waktu input: {formattedActivities.find(a => a.id === selectedActivity.id)?.createdAtStr}
                            </p>
                          </div>
                        </div>
                      )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
