
# CARI SPOT

## 1. Deskripsi

Cari Spot adalah aplikasi web untuk membantu mahasiswa
menemukan tempat nongkrong dan mengerjakan tugas di
sekitar kampus berdasarkan kondisi pengunjung terkini.

Pengguna dapat melihat tingkat keramaian, ketersediaan
colokan, dan kecepatan WiFi berdasarkan laporan
pengunjung yang sedang check-in.

## 2. Masalah yang Diselesaikan

Informasi tempat nongkrong pada aplikasi peta umumnya
tidak menggambarkan kondisi secara langsung.

Cari Spot menyediakan informasi yang berasal dari
pengunjung aktif dengan masa berlaku laporan 30 menit
dan minimal dua pelapor berbeda.

## 3. Fitur Utama

- Registrasi dan login.
- Check-in dan check-out.
- Laporan kondisi tempat.
- Status kondisi terkini.
- Filter tempat sepi dan memiliki colokan.
- Sistem poin pengguna.
- Riwayat poin yang tidak dapat diubah.
- Audit log aktivitas.

## 4. Tech Stack

Frontend:
- React
- Vite
- JavaScript
- CSS

Backend:
- Node.js
- Express.js
- node-oracledb Thin

Database:
- Oracle Database XE 21c
- PL/SQL

## 5. Fitur Database

- ERD dengan 8 tabel.
- Index dan EXPLAIN PLAN.
- Trigger.
- Stored procedure.
- Transaction COMMIT dan ROLLBACK.
- View.
- Settings untuk konfigurasi sistem.
- Audit log.

## 6. Diagram Arsitektur

React + Vite
       |
       v
REST API Express.js
       |
       v
node-oracledb Thin
       |
       v
Oracle Database XE 21c

## 7. Prasyarat

- Node.js LTS
- npm
- Oracle Database XE 21c
- DBeaver
- Visual Studio Code
- Postman

## 8. Instalasi

Clone repository:

git clone <repository-url>

Masuk ke backend:

cd backend
npm install

Buat file .env berdasarkan .env.example.

Jalankan backend:

npm run dev

Masuk ke frontend:

cd ../frontend
npm install
npm run dev

Jalankan script SQL dalam folder database
secara berurutan pada schema Oracle yang disiapkan.

## 9. Environment Variables

DB_USER
DB_PASSWORD
DB_CONNECT_STRING
JWT_SECRET
PORT

## 10. Tantangan dan Pembelajaran

- Menjaga validitas laporan berdasarkan check-in aktif.
- Memastikan hanya laporan segar yang digunakan.
- Menjaga konsistensi transaksi dan riwayat poin.
- Mengoptimalkan pencarian menggunakan index.

## 11. Roadmap

- Integrasi peta lokasi.
- Notifikasi perubahan kondisi.
- Peningkatan sistem reputasi.
- Dashboard analisis tempat.

## 12. Penggunaan AI

ChatGPT digunakan untuk membantu memahami konsep
database, memberikan contoh SQL dan kode backend,
menjelaskan error, serta membantu dokumentasi.

Seluruh kode diperiksa, dipahami, disalin, dan diuji
secara manual oleh anggota kelompok.
