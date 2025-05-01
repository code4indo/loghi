Untuk memulai HTR, lakukan langkah-langkah berikut:

1.  Buat direktori yang berisi gambar dokumen.
2.  Direkomendasikan format gambar yang menjadi input adalah `.jpg`.
    *   Misalnya: buat direktori `arsip` pada root direktori.
3.  Jalankan perintah berikut:
    *   *Catatan: Pastikan Docker pada Windows sudah berjalan.*
    ```bash
    ./scripts/inference-pipeline.sh /arsip
    ```
4.  Setelah perintah inference dijalankan, akan terbentuk direktori `page` dengan struktur berikut:
    ```
    page/
    ├── layout/ [gambar input]
    ├── xml/ [gambar input].xml
    └── [gambar input]
    ```
5.  Untuk melihat hasil transkripsi, gunakan web interface dengan menjalankan Python web server:
    ```bash
    python3 -m http.server
    ```
6.  Buka browser Anda dan arahkan ke server lokal, lalu pilih folder yang berisi gambar dokumen.
git reset --hard HEAD
git clean -fd