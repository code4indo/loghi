document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM siap. Mulai memuat data...");

    const documentList = document.getElementById('document-list');
    const imageContainer = document.getElementById('image-container');
    const textContent = document.getElementById('text-content');

    // --- Contoh Data (Ganti dengan logika pemuatan data sebenarnya) ---
    // Anda perlu logika untuk membaca direktori `arsip/page` atau sumber data lain
    // dan mendapatkan daftar file gambar (.png) dan XML (.xml).
    const documents = [
        { id: "ID-ANRI_K66b_005_0526", name: "K66b_005_0526" },
        { id: "ID-ANRI_K66c_01_0001", name: "K66c_01_0001" },
        // Tambahkan dokumen lain di sini
    ];

    // --- Fungsi untuk Memuat Daftar Dokumen ---
    function loadDocumentList() {
        documentList.innerHTML = ''; // Kosongkan daftar sebelum memuat
        if (documents.length === 0) {
            documentList.innerHTML = '<li>Tidak ada dokumen ditemukan.</li>';
            return;
        }

        documents.forEach(doc => {
            const listItem = document.createElement('li');
            listItem.textContent = doc.name;
            listItem.dataset.docId = doc.id; // Simpan ID untuk referensi
            listItem.addEventListener('click', () => loadDocument(doc.id));
            documentList.appendChild(listItem);
        });
    }

    // --- Fungsi untuk Memuat Gambar dan Teks Dokumen yang Dipilih ---
    async function loadDocument(docId) {
        console.log(`Memuat dokumen: ${docId}`);
        imageContainer.innerHTML = '<p>Memuat gambar...</p>';
        textContent.innerHTML = '<p>Memuat teks...</p>';

        // Ganti path ini sesuai dengan struktur direktori Anda
        // const imagePath = `../arsip/page/${docId}.png`; // Path lama
        const imagePath = `../arsip/${docId}.jpg`; // Path baru ke gambar asli
        const xmlPath = `../arsip/page/${docId}.xml`;

        try {
            // 1. Muat dan tampilkan gambar
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `Gambar ${docId}`;
            // Pindahkan img.onload utama ke bawah setelah XML diambil
            // img.onload = () => { ... };
            img.onerror = () => {
                imageContainer.innerHTML = '<p>Gagal memuat gambar.</p>';
            };

            // 2. Ambil dan proses file XML
            const response = await fetch(xmlPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const xmlText = await response.text();

            // --- Parsing XML (Lebih Detail) ---
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            // Dapatkan dimensi asli gambar dari XML untuk penskalaan
            const pageElement = xmlDoc.getElementsByTagName('Page')[0];
            const originalWidth = pageElement ? parseInt(pageElement.getAttribute('imageWidth')) : null;
            const originalHeight = pageElement ? parseInt(pageElement.getAttribute('imageHeight')) : null;

            // Tunggu gambar benar-benar dimuat sebelum melanjutkan
            await new Promise(resolve => {
                // Jika gambar sudah ada di cache dan dimuat
                if (img.complete && img.naturalWidth !== 0) {
                    imageContainer.innerHTML = ''; // Hapus pesan loading
                    imageContainer.appendChild(img);
                    img.dataset.originalWidth = originalWidth;
                    img.dataset.originalHeight = originalHeight;
                    resolve();
                } else {
                    // Jika belum, set onload handler
                    img.onload = () => {
                        imageContainer.innerHTML = ''; // Hapus pesan loading
                        imageContainer.appendChild(img);
                        img.dataset.originalWidth = originalWidth; // Simpan setelah gambar ada
                        img.dataset.originalHeight = originalHeight;
                        resolve();
                    };
                     img.onerror = () => { // Handle error jika terjadi saat menunggu
                        imageContainer.innerHTML = '<p>Gagal memuat gambar (saat parsing XML).</p>';
                        resolve(); // Tetap resolve agar tidak menggantung
                    };
                    // Pastikan src di-set jika belum (seharusnya sudah, tapi untuk keamanan)
                    if (!img.src) img.src = imagePath;
                }
            });


            const textRegions = xmlDoc.getElementsByTagName('TextRegion');
            textContent.innerHTML = ''; // Kosongkan sebelum menambahkan span
            let lineNumber = 1; // Initialize line number counter

            for (const region of textRegions) {
                const textLines = region.getElementsByTagName('TextLine');
                for (const line of textLines) {
                    const coordsElement = line.getElementsByTagName('Coords')[0];
                    // const textEquiv = line.getElementsByTagName('TextEquiv')[0]; // Old way
                    const textEquiv = line.querySelector(':scope > TextEquiv'); // More specific selector
                    let lineText = "";
                    let coordsPoints = "";

                    if (textEquiv) {
                        const unicode = textEquiv.getElementsByTagName('Unicode')[0]; // Get Unicode within the correct TextEquiv
                        if (unicode) {
                            lineText = unicode.textContent.trim(); // Extract the full text
                        }
                    }
                    if (coordsElement) {
                        coordsPoints = coordsElement.getAttribute('points');
                    }

                    if (lineText && coordsPoints) {
                        const span = document.createElement('span');
                        span.textContent = `${lineNumber}. ${lineText}`; // Prepend line number
                        span.dataset.coords = coordsPoints;
                        span.dataset.lineNumber = lineNumber; // Store line number
                        span.classList.add('text-line');
                        textContent.appendChild(span);
                        textContent.appendChild(document.createTextNode('\n'));
                        lineNumber++; // Increment line number
                    } else if (lineText) { // Also add line number for text without coords
                        const span = document.createElement('span');
                        span.textContent = `${lineNumber}. ${lineText}`; // Prepend line number
                        span.dataset.lineNumber = lineNumber; // Store line number (optional here, but consistent)
                        textContent.appendChild(span);
                        textContent.appendChild(document.createTextNode('\n'));
                        lineNumber++; // Increment line number
                    }
                }
                 textContent.appendChild(document.createTextNode('\n'));
            }
             if (textContent.innerHTML === '') {
                 textContent.textContent = "Tidak ada teks atau koordinat valid ditemukan di XML.";
             }


            // 3. Panggil setupHighlighting setelah parsing selesai dan gambar dimuat
            if (img.complete && img.dataset.originalWidth) { // Pastikan gambar ada dan punya dimensi
                 setupHighlighting(img); // Hanya perlu elemen gambar sekarang
            } else {
                console.warn("Gambar belum siap atau dimensi asli tidak ditemukan saat setupHighlighting dipanggil.");
                 // Coba panggil lagi jika gambar baru saja selesai load setelah check ini
                 img.addEventListener('load', () => setupHighlighting(img), { once: true });
            }


        } catch (error) {
            console.error("Error memuat dokumen:", error);
            imageContainer.innerHTML = '<p>Gagal memuat gambar.</p>';
            textContent.innerHTML = '<p>Gagal memuat teks transkripsi.</p>';
        }
    }

    // --- Fungsi untuk Setup Highlighting --- (Modifikasi event listener handling)
    function setupHighlighting(imageElement) {
        console.log("Setup highlighting untuk:", imageElement.alt);
        const highlightLayer = getOrCreateHighlightLayer();
        const originalWidth = parseFloat(imageElement.dataset.originalWidth);
        const originalHeight = parseFloat(imageElement.dataset.originalHeight);

        // Gunakan event delegation pada parent (textContent) daripada cloneNode
        // Hapus listener lama jika ada (lebih bersih)
        textContent.removeEventListener('mouseover', handleTextMouseOver);
        textContent.removeEventListener('mouseout', handleTextMouseOut);

        // Definisikan handler di luar agar bisa di-remove
        function handleTextMouseOver(event) {
            if (event.target.classList.contains('text-line') && event.target.dataset.coords) {
                removeHighlight(); // Hapus highlight sebelumnya
                const coordsStr = event.target.dataset.coords;
                const lineNumber = event.target.dataset.lineNumber; // Get line number
                // Pass line number to drawHighlightShape (previously drawHighlightBox)
                drawHighlightShape(coordsStr, imageElement, highlightLayer, originalWidth, originalHeight, lineNumber);
                event.target.classList.add('highlight-text'); // Highlight teks juga
            }
        }

        function handleTextMouseOut(event) {
            if (event.target.classList.contains('text-line')) {
                removeHighlight();
                 event.target.classList.remove('highlight-text');
            }
        }

        // Tambahkan listener baru
        textContent.addEventListener('mouseover', handleTextMouseOver);
        textContent.addEventListener('mouseout', handleTextMouseOut);
    }

    function getOrCreateHighlightLayer() {
        let layer = document.getElementById('highlight-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'highlight-layer';
            layer.style.position = 'absolute';
            layer.style.top = '0'; // Akan disesuaikan
            layer.style.left = '0'; // Akan disesuaikan
            layer.style.width = '0'; // Akan disesuaikan
            layer.style.height = '0'; // Akan disesuaikan
            layer.style.pointerEvents = 'none'; // Biarkan klik tembus ke gambar
            // Masukkan layer SEBELUM gambar agar posisi absolut relatif ke imageContainer
            // Pastikan imageContainer tidak kosong sebelum insert
            if (imageContainer.firstChild) {
                 imageContainer.insertBefore(layer, imageContainer.firstChild);
            } else {
                imageContainer.appendChild(layer); // Fallback jika container kosong
            }
        }
        // Pastikan layer kosong saat memulai
        layer.innerHTML = '';
        return layer;
    }

    function removeHighlight() {
        const layer = document.getElementById('highlight-layer');
        if (layer) {
            layer.innerHTML = ''; // Hapus semua SVG/kotak highlight
        }
         // Hapus highlight dari semua teks
        textContent.querySelectorAll('.highlight-text').forEach(el => {
            el.classList.remove('highlight-text');
        });
    }


    // Renamed from drawHighlightBox to drawHighlightShape and modified to use SVG polygon
    function drawHighlightShape(coordsStr, imageElement, layer, originalWidth, originalHeight, lineNumber) {
        if (!coordsStr || !originalWidth || !originalHeight || !imageElement.complete || imageElement.naturalWidth === 0) {
             console.warn("Data tidak lengkap atau gambar belum siap untuk menggambar highlight shape.");
             return;
        }

        const pointsList = coordsStr.split(' ').map(p => {
            const xy = p.split(',');
            // Pastikan ada dua nilai (x dan y) dan keduanya adalah angka
            if (xy.length === 2 && !isNaN(parseFloat(xy[0])) && !isNaN(parseFloat(xy[1]))) {
                return { x: parseFloat(xy[0]), y: parseFloat(xy[1]) };
            }
            return null; // Kembalikan null jika format tidak valid
        }).filter(p => p !== null); // Hapus entri null

        if (pointsList.length < 3) {
             console.warn("Koordinat tidak cukup untuk membentuk poligon (perlu minimal 3 titik). Coords:", coordsStr);
             return; // Perlu setidaknya 3 titik untuk poligon
        }

        // Dapatkan ukuran gambar yang ditampilkan saat ini
        const displayRect = imageElement.getBoundingClientRect();
        const displayWidth = displayRect.width;
        const displayHeight = displayRect.height;

        // Hitung faktor skala
        const scaleX = displayWidth / originalWidth;
        const scaleY = displayHeight / originalHeight;

        // Skalakan titik-titik poligon
        const scaledPointsStr = pointsList.map(p => `${p.x * scaleX},${p.y * scaleY}`).join(' ');

        // Buat elemen SVG container
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('width', displayWidth.toString()); // Set lebar SVG sama dengan gambar
        svg.setAttribute('height', displayHeight.toString()); // Set tinggi SVG sama dengan gambar
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.overflow = 'visible'; // Pastikan poligon tidak terpotong oleh batas SVG

        // Buat elemen poligon
        const polygon = document.createElementNS(svgNS, "polygon");
        polygon.setAttribute("points", scaledPointsStr);
        polygon.setAttribute("class", "highlight-polygon"); // Gunakan class untuk styling
        // Style fallback jika CSS tidak dimuat
        polygon.setAttribute("fill", "rgba(255, 255, 0, 0.4)"); // Kuning semi-transparan
        polygon.setAttribute("stroke", "rgba(230, 230, 0, 0.8)"); // Stroke sedikit lebih gelap
        polygon.setAttribute("stroke-width", "1");

        // Tambahkan poligon ke SVG
        svg.appendChild(polygon);


        // --- Add Line Number Display (position relative to the first point) ---
        if (lineNumber && pointsList.length > 0) {
            const numberDiv = document.createElement('div');
            numberDiv.className = 'highlight-line-number'; // Add class for styling
            numberDiv.textContent = lineNumber;
            // Basic styling (can be moved to CSS)
            numberDiv.style.position = 'absolute';
            // Position near the first point of the polygon
            const numLeft = pointsList[0].x * scaleX - 5; // Sedikit ke kiri dari titik pertama
            const numTop = pointsList[0].y * scaleY - 8; // Sedikit di atas titik pertama
            numberDiv.style.left = `${numLeft}px`;
            numberDiv.style.top = `${numTop}px`;
            numberDiv.style.backgroundColor = 'rgba(255, 255, 0, 0.8)'; // Yellow background
            numberDiv.style.color = 'black';
            numberDiv.style.padding = '1px 3px';
            numberDiv.style.fontSize = '10px';
            numberDiv.style.fontWeight = 'bold';
            numberDiv.style.borderRadius = '3px';
            numberDiv.style.zIndex = '10'; // Ensure it's above the SVG polygon
            numberDiv.style.pointerEvents = 'none'; // Jangan menangkap event mouse

            // Tambahkan nomor ke layer, bukan ke dalam SVG agar styling div berfungsi
             layer.appendChild(numberDiv);
        }
        // --- End Line Number Display ---


        // Tambahkan SVG ke layer overlay
        layer.appendChild(svg);

         // Sesuaikan ukuran layer dengan gambar yang ditampilkan
        layer.style.width = `${displayWidth}px`;
        layer.style.height = `${displayHeight}px`;
         // Sesuaikan posisi layer relatif ke imageContainer (posisi gambar di dalam container)
        layer.style.top = `${imageElement.offsetTop}px`;
        layer.style.left = `${imageElement.offsetLeft}px`;
    }

    // --- Inisialisasi ---
    loadDocumentList();

});
