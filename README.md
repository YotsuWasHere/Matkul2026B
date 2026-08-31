# 2026B — Sistem Manajemen Jadwal Kuliah

Web ini merupakan sistem manajemen dan monitoring jadwal kuliah untuk kelas **2026B**. Website dibuat untuk memudahkan mahasiswa dalam melihat jadwal perkuliahan terbaru, sekaligus membantu PJ (Penanggung Jawab) dalam mengelola perubahan jadwal secara terstruktur.

## Tentang Website

Sistem ini menggunakan konsep **jadwal original** dan **perubahan jadwal per minggu**.

Jadwal original berfungsi sebagai jadwal dasar perkuliahan. Apabila terdapat perubahan untuk pertemuan tertentu, perubahan tersebut dapat dicatat tanpa mengubah jadwal original.

Dengan sistem ini, mahasiswa dapat tetap melihat jadwal terbaru tanpa perlu login, sedangkan PJ memiliki akses khusus untuk mengelola jadwal.

## Fitur Utama

### 📅 Jadwal Mingguan
Menampilkan jadwal perkuliahan berdasarkan minggu yang sedang dipilih.

Mahasiswa dapat berpindah antara:
- Minggu sebelumnya
- Minggu berjalan
- Minggu berikutnya

Jadwal ditampilkan berdasarkan hari dan waktu perkuliahan.

### 🔄 Perubahan Jadwal per Minggu
PJ dapat melakukan perubahan pada pertemuan tertentu tanpa mengubah jadwal original.

Perubahan dapat mencakup:
- Tanggal pertemuan
- Jam mulai dan selesai
- Ruangan
- Mode perkuliahan
- Status pertemuan
- Catatan tambahan

Perubahan tersebut hanya berlaku pada minggu yang dipilih.

### 🟠 Indikator Perubahan
Mata kuliah yang memiliki perubahan pada minggu aktif akan mendapatkan penanda visual sehingga lebih mudah dikenali.

Perubahan biasa ditampilkan dengan indikator **oranye**, sedangkan jadwal yang dipindahkan memiliki indikator yang lebih menonjol.

### 👤 Login PJ
PJ dapat login menggunakan nama yang terdaftar dan kode verifikasi yang sesuai.

Setelah login, PJ mendapatkan akses untuk:
- Mengubah jadwal original
- Mengubah pertemuan tertentu
- Melihat data pengelolaan kelas

### 📋 Riwayat Perubahan
Website menyediakan bagian riwayat perubahan untuk melihat jadwal original dan perubahan yang berlaku pada minggu tertentu.

Informasi yang ditampilkan mencakup perubahan waktu, tanggal, mode perkuliahan, ruangan, serta pihak yang melakukan perubahan.

### 📱 Responsive Design
Tampilan dirancang agar dapat digunakan pada berbagai ukuran layar, baik desktop maupun perangkat mobile.

### 🌙 Light / Dark Mode
Website mendukung tema terang dan gelap agar pengguna dapat memilih tampilan yang lebih nyaman.

## Cara Kerja Sistem

Secara umum, sistem bekerja dengan membedakan dua jenis data:

**Jadwal Original**
> Jadwal dasar mata kuliah yang menjadi acuan utama.

**Weekly Meeting Override**
> Perubahan khusus yang hanya berlaku untuk minggu tertentu.

Contohnya:

```text
Jadwal Original
Senin, 10:00–12:00
        ↓
Ada perubahan pada minggu tertentu
        ↓
Jadwal minggu tersebut
Selasa, 13:00–15:00
