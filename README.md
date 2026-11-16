# GIZICAM — AI Food Scanner & Personal Nutrition Assistant

Website edukasi nutrisi dengan HTML, CSS, JavaScript Vanilla, Netlify Functions, Groq Vision API, dan LocalStorage.

## Fitur
- Biodata dan profil preferensi.
- Register/login demonstrasi lokal.
- Dashboard dan ringkasan riwayat.
- Scanner foto dari galeri serta kamera perangkat.
- Estimasi nutrisi dari Groq Vision API melalui backend Netlify Function.
- Riwayat scan dan ide rekomendasi makanan.

## Catatan penting
- Hasil kalori dan nutrisi adalah perkiraan visual, bukan pengukuran laboratorium.
- GIZICAM bukan alat diagnosis dan tidak menggantikan tenaga kesehatan.
- Kamera memerlukan izin browser serta HTTPS atau localhost.
- Data akun, biodata, dan riwayat disimpan di LocalStorage perangkat/browser yang sama. Data dapat hilang jika penyimpanan browser dihapus dan tidak tersinkron ke perangkat lain.
- Login ini hanya demonstrasi. Hash SHA-256 tanpa salt dan autentikasi di sisi browser tidak cukup aman untuk aplikasi publik. Jangan gunakan password penting atau data sensitif.
- Jangan mengumpulkan atau memasukkan informasi kesehatan yang tidak diperlukan. Pastikan pengguna memahami bahwa data tersimpan di perangkat.

## Menjalankan lokal
1. Instal Node.js versi LTS.
2. Ekstrak project.
3. Buka terminal pada folder project.
4. Jalankan `npm install`.
5. Jalankan `npx netlify dev`.
6. Buka alamat lokal yang ditampilkan Netlify CLI (umumnya `http://localhost:8888`).

Jangan membuka `scanner.html` langsung melalui `file://` karena Netlify Function tidak akan tersedia.

## Menyiapkan Groq API
1. Buat akun di situs resmi Groq: https://console.groq.com/
2. Buat API key dari halaman API Keys.
3. Periksa daftar model yang tersedia dan mendukung input gambar/vision di dokumentasi atau console Groq.
4. Salin API key dengan aman. Jangan menaruhnya di HTML, CSS, JavaScript frontend, GitHub, atau LocalStorage.

Model default pada project ini adalah `meta-llama/llama-4-scout-17b-16e-instruct`. Ketersediaan model dapat berubah; jika tidak tersedia untuk akun/endpoint, ganti `GROQ_MODEL` dengan model vision yang saat itu tersedia di Groq.

## Environment variables di Netlify
1. Buka dashboard Netlify dan pilih site.
2. Masuk ke **Site configuration → Environment variables** (nama menu dapat berubah).
3. Tambahkan `GROQ_API_KEY` dengan nilai API key.
4. Tambahkan `GROQ_MODEL` dengan nama model vision yang tersedia.
5. Simpan lalu lakukan redeploy agar perubahan environment diterapkan.

API key hanya dibaca oleh `netlify/functions/scan.mjs` di server.

## Menguji Function
Dengan `npx netlify dev`, buka website dan pilih foto di halaman AI Food Scanner. Upload dikirim sebagai `multipart/form-data` ke `/.netlify/functions/scan`. Function memeriksa metode, tipe, dan ukuran gambar, memberi timeout, memanggil endpoint Groq, lalu memvalidasi JSON respons.

## Deploy ke Netlify
1. Buat repository GitHub baru.
2. Upload seluruh isi folder project (jangan upload `.env` atau API key).
3. Di Netlify pilih **Add new site → Import an existing project**.
4. Hubungkan repository GitHub.
5. Build command dapat dikosongkan; publish directory gunakan `.`. Konfigurasi fungsi sudah ada di `netlify.toml`.
6. Tambahkan environment variables seperti langkah di atas.
7. Deploy site.
8. Setelah mengganti environment variables, lakukan redeploy.

## Error umum
- **API key belum diatur:** tambahkan `GROQ_API_KEY` di Netlify.
- **401:** API key salah atau sudah dicabut.
- **404/model tidak ditemukan:** pilih model vision yang masih tersedia lalu ubah `GROQ_MODEL`.
- **429:** batas penggunaan Groq tercapai; tunggu atau periksa kuota akun.
- **Kamera tidak muncul:** izinkan akses kamera dan gunakan HTTPS/localhost.
- **Function 404 saat lokal:** jalankan melalui `npx netlify dev`, bukan `file://`.
- **Respons AI tidak valid:** coba foto makanan yang lebih jelas dan tidak terlalu ramai.

## Struktur folder
```text
GIZICAM/
├── index.html
├── biodata.html
├── login.html
├── register.html
├── dashboard.html
├── scanner.html
├── history.html
├── profile.html
├── recommendations.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── scanner.js
│   │   ├── history.js
│   │   └── profile.js
│   └── images/
├── netlify/functions/scan.mjs
├── netlify.toml
├── package.json
├── .gitignore
└── README.md
```
