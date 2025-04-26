---
tools: ['copilot_readFile', 'copilot_runInTerminal']
---

bagaimana cara mencoba aplikasi loghi ini 

> Copilot: Untuk mengetahui cara mencoba aplikasi Loghi ini, saya perlu melihat isi dari file README.md. Saya akan membacanya sekarang.Untuk mencoba aplikasi Loghi, Anda dapat mengikuti langkah-langkah berikut berdasarkan dokumentasi README.md:
> 
> 1.  **Kloning Repositori**: Pertama, kloning repositori Loghi ke komputer Anda menggunakan Git:
>     ```bash
>     git clone git@github.com:knaw-huc/loghi.git
>     cd loghi
>     ```
> 2.  **Gunakan Docker**: Cara termudah adalah menggunakan Docker. Tarik *image* Docker yang sudah dibuat sebelumnya:
>     ```bash
>     docker pull loghi/docker.laypa
>     docker pull loghi/docker.htr
>     docker pull loghi/docker.loghi-tooling
>     ```
>     Jika Anda belum menginstal Docker, ikuti petunjuk instalasi [di sini](https://docs.docker.com/engine/install/).
> 3.  **Unduh Model**: Unduh model Laypa (untuk deteksi *baseline*) dan model Loghi-HTR (untuk HTR) dari tautan berikut:
>     [https://surfdrive.surf.nl/files/index.php/s/YA8HJuukIUKznSP](https://surfdrive.surf.nl/files/index.php/s/YA8HJuukIUKznSP)
>     *   Saran model Laypa: `general`
>     *   Saran model Loghi-HTR: `generic-2023-02-15` (model ini baik untuk memulai, terutama untuk tulisan tangan Belanda abad ke-17 dan ke-18). Ekstrak file zip jika Anda mengunduhnya dalam format zip.
> 4.  **Konfigurasi Skrip**: Edit file inference-pipeline.sh menggunakan editor teks (misalnya, nano):
>     ```bash
>     nano scripts/inference-pipeline.sh
>     ```
>     Cari baris berikut dan perbarui path agar sesuai dengan lokasi model yang Anda unduh:
>     ```bash
>     LAYPABASELINEMODEL=INSERT_FULL_PATH_TO_YAML_HERE
>     LAYPABASELINEMODELWEIGHTS=INSERT_FULLPATH_TO_PTH_HERE
>     HTRLOGHIMODEL=INSERT_FULL_PATH_TO_LOGHI_HTR_MODEL_HERE
>     ```
>     Jika Anda tidak memiliki GPU NVIDIA, ubah `GPU=0` menjadi `GPU=-1` untuk menjalankan pada CPU (ini akan lebih lambat). Jika menggunakan CPU, pastikan mengunduh model Loghi-HTR yang namanya dimulai dengan "float32-".
> 5.  **Jalankan Inferensi**: Simpan file skrip dan jalankan dengan perintah berikut, ganti `/PATH_TO_FOLDER_CONTAINING_IMAGES` dengan path ke direktori yang berisi gambar yang ingin Anda proses:
>     ```bash
>     ./scripts/inference-pipeline.sh /PATH_TO_FOLDER_CONTAINING_IMAGES
>     ```
> 6.  **Periksa Hasil**: Setelah skrip selesai berjalan tanpa kesalahan, folder baru bernama `page` akan dibuat di direktori gambar Anda. Folder ini berisi output dalam format PageXML.
> 
> Selain itu, ada demo Gradio yang tersedia di direktori gradio yang menyediakan antarmuka grafis untuk mencoba Loghi. Anda bisa mengikuti instruksi di README.md untuk menjalankannya.

buat program untuk memeriksa / membaca apakah GPU Nvidia yang ada dapat digunakan 

> Copilot: Untuk memeriksa apakah GPU NVIDIA Anda dapat digunakan dan dikenali oleh sistem, Anda dapat menggunakan utilitas baris perintah `nvidia-smi` yang disertakan dengan driver NVIDIA.
> 
> Saya akan menjalankan perintah berikut di terminal untuk Anda:
> ```powershell
> nvidia-smi
> ```
> Perintah ini akan menampilkan informasi tentang GPU NVIDIA yang terdeteksi, termasuk model, penggunaan, dan versi driver. Jika perintah ini berhasil dijalankan dan menampilkan informasi GPU, berarti GPU Anda dapat digunakan oleh aplikasi yang mendukung akselerasi GPU NVIDIA.
> 
> Perintah `nvidia-smi` berhasil dijalankan. Outputnya menunjukkan bahwa ada GPU NVIDIA yang terdeteksi pada sistem Anda (NVIDIA GeForce RTX 3080) beserta detail seperti versi driver, versi CUDA, penggunaan memori, dan proses yang sedang berjalan di GPU.
> 
> Ini mengonfirmasi bahwa GPU NVIDIA Anda dapat digunakan oleh aplikasi yang mendukung akselerasi GPU, seperti Loghi (jika dikonfigurasi dengan benar untuk menggunakan GPU).

apakah jika saya sudah download image docker tidak perlu lagi download model lagi 

> Copilot: Tidak, Anda **masih perlu** mengunduh model Laypa dan Loghi-HTR secara terpisah meskipun Anda sudah mengunduh *image* Docker.
> 
> *   **Image Docker** berisi *perangkat lunak* Loghi dan semua dependensinya yang diperlukan untuk menjalankan aplikasi (seperti pustaka Python, TensorFlow/PyTorch, dll.). Ini memastikan lingkungan eksekusi yang konsisten.
> *   **Model** (file `.pth`, `.yaml`, `.pt`, dll.) berisi *bobot* (weights) yang telah dilatih sebelumnya yang digunakan oleh perangkat lunak untuk melakukan tugas spesifik seperti analisis tata letak (Laypa) dan pengenalan teks tulisan tangan (Loghi-HTR).
> 
> Dokumentasi README.md secara eksplisit menyatakan bahwa setelah menarik *image* Docker, Anda harus mengunduh model dari URL yang disediakan (Surfdrive) dan kemudian mengkonfigurasi path ke model-model tersebut dalam skrip `inference-pipeline.sh`.
> 
> Jadi, mengunduh *image* Docker adalah langkah pertama untuk menyiapkan lingkungan, tetapi mengunduh model adalah langkah kedua yang penting untuk benar-benar dapat menjalankan inferensi.
