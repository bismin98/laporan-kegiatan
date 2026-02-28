# Website Laporan Kegiatan Humas Protokol

Website untuk mengelola dan menampilkan laporan kegiatan Humas Protokol dengan fitur real-time updates.

## Fitur

- ✅ **Sistem Autentikasi**: Login untuk Admin dan User
- ✅ **Dashboard Admin**: Form untuk menambah kegiatan (tanggal, nama, keterangan, foto)
- ✅ **Dashboard User**: Menampilkan semua kegiatan secara real-time
- ✅ **Upload Foto**: Mendukung upload foto kegiatan
- ✅ **Real-time Updates**: Data yang ditambahkan admin langsung muncul di dashboard user (polling setiap 2 detik)
- ✅ **Pencarian**: User dapat mencari kegiatan berdasarkan nama atau keterangan
- ✅ **Responsive Design**: Tampilan yang optimal di semua ukuran layar

## Teknologi

- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **App Router** - Next.js Routing

## Cara Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser dan akses: `http://localhost:3000`

## Kredensial Login

### Admin
- Username: `admin`
- Password: `admin123`

### User
- Username: `user`
- Password: `user123`

## Cara Menggunakan

### Sebagai Admin:
1. Login dengan kredensial admin
2. Isi form dengan data kegiatan:
   - Pilih tanggal kegiatan
   - Masukkan nama kegiatan
   - Masukkan keterangan/deskripsi
   - Upload foto kegiatan
3. Klik "Tambah Kegiatan"
4. Kegiatan akan langsung muncul di daftar dan di dashboard user

### Sebagai User:
1. Login dengan kredensial user
2. Lihat semua kegiatan yang telah ditambahkan admin
3. Data akan ter-update secara otomatis setiap 2 detik (real-time)
4. Gunakan fitur pencarian untuk menemukan kegiatan tertentu

## Struktur Folder

```
laporan-kegiatan/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Dashboard Admin
│   ├── user/
│   │   └── page.tsx           # Dashboard User
│   ├── api/
│   │   └── activities/
│   │       └── route.ts       # API Routes untuk CRUD
│   ├── page.tsx               # Login Page
│   ├── layout.tsx             # Root Layout
│   └── globals.css            # Global Styles
├── types/
│   └── activity.ts            # TypeScript Types
└── public/                    # Static Assets
```

## Catatan

- Data disimpan di memory (in-memory storage), sehingga akan hilang jika server direstart
- Untuk production, gunakan database seperti PostgreSQL, MongoDB, atau Firebase
- Real-time updates menggunakan polling (2 detik). Untuk performa lebih baik, gunakan WebSockets atau Server-Sent Events
- Foto disimpan sebagai base64 string. Untuk production, upload ke cloud storage seperti AWS S3 atau Cloudinary

## Development

Build untuk production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## License

MIT
