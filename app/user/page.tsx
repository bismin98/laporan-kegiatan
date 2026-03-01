'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { Activity } from '@/types/activity';
import ExcelJS from 'exceljs';

export default function UserPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formattedActivities, setFormattedActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'user') {
      router.push('/');
      return;
    }

    fetchActivities();

    // Set up real-time polling (every 2 seconds)
    const intervalId = setInterval(() => {
      fetchActivities();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [router]);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data.activities);
      // Format tanggal di client
      setFormattedActivities(
        data.activities.map((activity: Activity) => ({
          ...activity,
          tanggalStr: new Date(activity.tanggal).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          }),
          tanggalShort: new Date(activity.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
          }),
          createdAtStr: new Date(activity.createdAt).toLocaleString('id-ID'),
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    router.push('/');
  };

  const filteredActivities = formattedActivities.filter(
    (activity) =>
      activity.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = async () => {
    if (!selectedMonth || !selectedYear) {
      alert('Silakan pilih bulan dan tahun terlebih dahulu!');
      return;
    }

    // Filter activities by selected month and year
    const filteredByMonth = activities.filter((activity) => {
      const activityDate = new Date(activity.tanggal);
      const activityMonth = activityDate.getMonth() + 1; // 0-indexed
      const activityYear = activityDate.getFullYear();
      return activityMonth === parseInt(selectedMonth) && activityYear === parseInt(selectedYear);
    });

    if (filteredByMonth.length === 0) {
      alert('Tidak ada kegiatan pada bulan dan tahun yang dipilih');
      return;
    }

    // Get month name
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = monthNames[parseInt(selectedMonth) - 1];

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Kegiatan');

    // Add title headers
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'CATATAN KINERJA KHUSUS FOTOGRAFER';
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = 'BAGIAN HUMAS DAN PROTOKOL SETDAKOT BALIKPAPAN';
    worksheet.getCell('A2').font = { bold: true, size: 12 };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = `${monthName.toUpperCase()} ${selectedYear}`;
    worksheet.getCell('A3').font = { bold: true, size: 12 };
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    // Define columns (starting from row 5)
    const headerRow = worksheet.getRow(5);
    headerRow.values = ['No', 'Tanggal', 'Nama Kegiatan', 'Keterangan', 'Foto'];
    
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'tanggal', width: 15 },
      { key: 'namaKegiatan', width: 30 },
      { key: 'keterangan', width: 40 },
      { key: 'foto', width: 20 },
    ];

    // Style header row (row 5)
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data and images
    for (let i = 0; i < filteredByMonth.length; i++) {
      const activity = filteredByMonth[i];
      const rowNumber = i + 6; // Start from row 6 (after title headers and column header)

      // Add row data
      worksheet.addRow({
        no: i + 1,
        tanggal: new Date(activity.tanggal).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        namaKegiatan: activity.namaKegiatan,
        keterangan: activity.keterangan,
        foto: '', // Empty cell for image
      });

      // Set row height for image
      worksheet.getRow(rowNumber).height = 80;

      // Add alignment for text cells
      worksheet.getRow(rowNumber).alignment = { 
        vertical: 'middle', 
        wrapText: true 
      };

      // Add image if exists
      if (activity.foto) {
        try {
          // Convert base64 to buffer
          const base64Data = activity.foto.split(',')[1] || activity.foto;
          
          // Convert base64 to binary string
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Add image to workbook
          const imageId = workbook.addImage({
            buffer: bytes as any,
            extension: 'png',
          });

          // Add image to worksheet
          worksheet.addImage(imageId, {
            tl: { col: 4, row: rowNumber - 1 }, // Top-left position (0-indexed)
            ext: { width: 100, height: 75 }, // Image size
            editAs: 'oneCell'
          });
        } catch (error) {
          console.error('Error adding image:', error);
          worksheet.getCell(`E${rowNumber}`).value = 'Foto tidak tersedia';
        }
      } else {
        worksheet.getCell(`E${rowNumber}`).value = 'Tidak ada foto';
      }
    }

    // Generate filename
    const fileName = `Laporan_Kegiatan_${monthName}_${selectedYear}.xlsx`;

    // Write to file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate years array (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-fuchsia-600 via-purple-600 to-cyan-500">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-400/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />

      <nav className="relative border-b border-white/30 bg-white/15 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Dashboard User - Laporan Kegiatan
            </h1>
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
        <div className="rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Daftar Kegiatan Humas Protokol
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Total: {filteredActivities.length} kegiatan
                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time
                </span>
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
              />
            </div>
          </div>

          {/* Download Excel Section */}
          <div className="mb-6 rounded-2xl border-2 p-4 shadow-xl bg-linear-to-br from-fuchsia-100 via-cyan-100 to-pink-100 border-fuchsia-300">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 mb-2 lg:mb-0">
                <span className="inline-flex items-center justify-center rounded-full bg-linear-to-br from-fuchsia-400 via-cyan-400 to-pink-400 p-2 shadow-lg">
                  <Icon icon="mdi:file-download-outline" width={24} height={24} className="text-white" />
                </span>
                <div>
                  <h3 className="mb-1 text-base font-bold text-fuchsia-700 drop-shadow">
                    Download Rekap Bulanan
                  </h3>
                  <p className="text-xs text-slate-600">
                    Pilih bulan dan tahun untuk download laporan dalam format Excel
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full lg:flex-row lg:ml-auto lg:w-auto">
                <div className="flex flex-col gap-3 w-full sm:flex-row">
                  <div className="relative w-full sm:w-40">
                    <Icon icon="mdi:calendar-month-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400 pointer-events-none" width={20} height={20} />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-xl border-2 border-fuchsia-200 bg-white text-sm text-slate-700 shadow focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 transition w-full appearance-none"
                    >
                      <option value="">Pilih Bulan</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-400 pointer-events-none" width={18} height={18} />
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Icon icon="mdi:calendar-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" width={20} height={20} />
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="pl-10 pr-10 py-2 rounded-xl border-2 border-cyan-200 bg-white text-sm text-slate-700 shadow focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition w-full appearance-none"
                    >
                      <option value="">Pilih Tahun</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      <Icon icon="mdi:chevron-down" width={18} height={18} className="text-cyan-400" />
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleExportToExcel}
                  disabled={!selectedMonth || !selectedYear}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-linear-to-r from-fuchsia-500 to-cyan-500 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:from-fuchsia-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                >
                  <Icon icon="mdi:file-download-outline" width={20} height={20} className="text-white" />
                  Download Excel
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-fuchsia-600"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">
                Tidak ada kegiatan
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm
                  ? 'Tidak ditemukan kegiatan yang sesuai dengan pencarian'
                  : 'Belum ada kegiatan yang ditambahkan oleh admin'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className={`overflow-hidden rounded-xl border-2 transition-shadow duration-300 hover:shadow-2xl animate-fade-slide-in font-sans cursor-pointer w-full max-w-xs mx-auto text-sm ${[
                    'bg-linear-to-br from-pink-100 via-fuchsia-100 to-cyan-100 border-fuchsia-300',
                    'bg-linear-to-br from-cyan-100 via-indigo-100 to-pink-100 border-cyan-300',
                    'bg-linear-to-br from-yellow-100 via-orange-100 to-pink-100 border-yellow-300',
                    'bg-linear-to-br from-green-100 via-teal-100 to-cyan-100 border-green-300',
                    'bg-linear-to-br from-purple-100 via-fuchsia-100 to-blue-100 border-purple-300',
                  ][idx % 5]}`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => setSelectedActivity(activity)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Lihat detail ${activity.namaKegiatan}`}
                >
                  {activity.foto && (
                    <div className="relative h-32 w-full overflow-hidden rounded-t-xl bg-slate-200">
                      <img
                        src={activity.foto}
                        alt={activity.namaKegiatan}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold text-white shadow" style={{background: ['#e879f9','#06b6d4','#fbbf24','#22c55e','#a78bfa'][idx%5]}}>
                        {activity.tanggalShort}
                      </span>
                    </div>
                    <h3 className="mb-1 text-base font-bold text-slate-800">
                      {activity.namaKegiatan}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-600">
                      {activity.keterangan}
                    </p>
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
                          onClick={() => setSelectedActivity(null)}
                          aria-label="Tutup detail"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <h2 className="mb-2 text-xl font-bold text-slate-800">{selectedActivity.namaKegiatan}</h2>
                        <p className="mb-1 text-sm text-slate-500">
                          {formattedActivities.find(a => a.id === selectedActivity.id)?.tanggalStr}
                        </p>
                        <p className="mb-2 text-sm text-slate-600">{selectedActivity.keterangan}</p>
                        {selectedActivity.foto && (
                          <img
                            src={selectedActivity.foto}
                            alt={selectedActivity.namaKegiatan}
                            className="mb-4 max-h-60 w-full rounded-xl object-contain border"
                          />
                        )}
                        <p className="text-xs text-slate-400">
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
  );
}
