# 2026B — Supabase + GitHub Pages

Versi ini sudah dikonfigurasi menggunakan project Supabase yang diberikan pengguna:
- Project URL: https://vijujeyhttorxokqdkds.supabase.co
- Client key: legacy public `anon` key

## File
- `index.html` — UI utama
- `style.css` — styling / responsive / theme
- `script.js` — CRUD + weekly override + realtime
- `config.js` — konfigurasi Supabase (sudah diisi)
- `schema.sql` — tabel, seed data, RPC, dan policy database
- `.nojekyll` — untuk GitHub Pages

## Supabase setup
1. Buka Supabase Dashboard.
2. SQL Editor → New query.
3. Jalankan seluruh `schema.sql` satu kali.
4. Pastikan tabel `pj`, `courses`, dan `meeting_changes` ada.
5. Pastikan Realtime untuk `courses` dan `meeting_changes` aktif jika ingin update langsung antar-browser.

## GitHub Pages
Upload semua file ke root repository GitHub. Pastikan `index.html` ada di root.
Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Catatan keamanan
`config.js` berisi public `anon` key karena frontend browser membutuhkannya. Jangan pernah memasukkan `service_role` atau secret key.
Untuk deployment public yang lebih aman, login PJ sebaiknya dipindahkan ke Supabase Auth + role/RLS.

## Test multi-device
1. Buka website dari laptop.
2. Login sebagai PJ.
3. Edit Pertemuan Hukum Bisnis dan simpan.
4. Buka website yang sama di HP.
5. Perubahan harus berasal dari Supabase, bukan dari localStorage.

`localStorage` hanya dipakai untuk menyimpan preferensi tema light/dark.
