# Virtual Pre-Lab AI: Momentum Fisika

Website statis untuk pembelajaran pre-lab materi momentum fisika. Proyek ini dapat langsung diunggah dan dideploy melalui GitHub Pages.

## Fitur Utama

- Halaman petunjuk pemakaian.
- Materi momentum, impuls, hukum kekekalan momentum, dan jenis tumbukan.
- Animasi praktikum interaktif:
  1. Tumbukan satu dimensi.
  2. Benda jatuh pada permukaan keras, sedang, dan lunak.
  3. Ledakan dua benda.
  4. Recoil atau tolakan.
- Setting variabel praktikum: massa, kecepatan, ketinggian, koefisien restitusi, energi ledakan, dan jenis permukaan.
- AI Tutor responsif berbasis aturan lokal di browser, sehingga tidak memerlukan API key.
- Kuis akhir 15 soal: 10 pilihan ganda dan 5 uraian singkat.
- Desain responsif untuk laptop dan ponsel.

## Struktur File

```text
virtual-prelab-momentum-ai/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Cara Menjalankan di Komputer

1. Ekstrak file ZIP.
2. Buka folder proyek.
3. Klik dua kali `index.html`, atau buka dengan browser.
4. Jika ingin lebih nyaman, gunakan ekstensi Live Server di Visual Studio Code.

## Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `virtual-prelab-momentum-ai`.
2. Upload semua file dalam folder ini ke repository tersebut.
3. Buka menu **Settings** pada repository.
4. Pilih **Pages**.
5. Pada bagian **Build and deployment**, pilih:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Klik **Save**.
7. Tunggu beberapa saat sampai GitHub memberikan link website.

## Catatan Pengembangan

AI Tutor pada versi ini menggunakan logika lokal berbasis kata kunci. Keunggulannya adalah aman untuk GitHub Pages dan tidak membutuhkan server. Jika ingin menghubungkan ke AI API sungguhan, tambahkan backend terpisah agar API key tidak terbuka di browser.

## Saran Penggunaan di Kelas

- Gunakan bagian materi sebagai kegiatan pre-lab.
- Minta siswa mengubah variabel massa dan kecepatan, lalu mencatat perubahan momentum.
- Bandingkan gaya benturan pada permukaan keras dan lunak.
- Gunakan AI Tutor untuk refleksi mandiri.
- Gunakan kuis sebagai evaluasi awal sebelum praktikum nyata.
