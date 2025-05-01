console.log("script.js loaded and executing...");

// Add error handling at the global level
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    const debugPanel = document.getElementById('debug-panel');
    const debugOutput = document.getElementById('debug-output');
    if (debugPanel && debugOutput) {
        debugPanel.style.display = 'block';
        debugOutput.textContent += '\n\nERROR: ' + event.message + 
            '\nLine: ' + event.lineno +
            '\nFile: ' + event.filename;
    }
});

// Variabel global untuk menyimpan data file yang dipilih
let selectedFilesData = {};
let currentObjectUrls = { image: null }; // Untuk melacak Object URL

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // <-- Tambahkan log ini juga
    console.log("DOM siap. Mulai memuat data...");
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
        debugOutput.textContent = 'Script.js started execution'; // Reset debug
    }

    // Referensi elemen
    const documentList = document.getElementById('document-list');
    const imageContainer = document.getElementById('image-container');
    const textContent = document.getElementById('text-content');
    const folderInput = document.getElementById('folder-input');
    const browseButton = document.getElementById('browse-button');
    const selectedFolderDisplay = document.getElementById('selected-folder');

    if (debugOutput) {
        debugOutput.textContent += '\n\nElement references obtained:' +
            `\ndocumentList: ${documentList ? 'Found' : 'Missing'}` +
            `\nimageContainer: ${imageContainer ? 'Found' : 'Missing'}` +
            `\ntextContent: ${textContent ? 'Found' : 'Missing'}` +
            `\nfolderInput: ${folderInput ? 'Found' : 'Missing'}` +
            `\nbrowseButton: ${browseButton ? 'Found' : 'Missing'}` +
            `\nselectedFolderDisplay: ${selectedFolderDisplay ? 'Found' : 'Missing'}`;
    }

    // --- Event Listener untuk Tombol Browse ---
    if (browseButton && folderInput) {
        browseButton.addEventListener('click', () => {
            console.log("Browse button clicked!"); // <-- Tambahkan log ini
            folderInput.click(); // Picu input file tersembunyi
        });
    } else {
        console.error("Tombol browse atau input folder tidak ditemukan!");
        if (debugOutput) debugOutput.textContent += '\n\nERROR: Browse button or folder input missing!';
    }

    // --- Event Listener untuk Input Folder ---
    if (folderInput) {
        folderInput.addEventListener('change', handleFolderSelection);
    }

    // --- Fungsi untuk Menangani Pemilihan Folder ---
    function handleFolderSelection(event) {
        const files = event.target.files;
        if (!files || files.length === 0) {
            console.log("Tidak ada folder dipilih atau folder kosong.");
            if (debugOutput) debugOutput.textContent += '\n\nNo folder selected or folder empty.';
            return;
        }

        console.log(`Memproses ${files.length} file...`);
        if (debugOutput) debugOutput.textContent += `\n\nProcessing ${files.length} files...`;
        selectedFilesData = {}; // Reset data sebelumnya
        let folderName = '';

        // Regex untuk mengekstrak ID dokumen dan memeriksa path
        // Contoh path: "arsip/page/ID-ANRI_K66b_005_0526.xml" atau "arsip/ID-ANRI_K66b_005_0526.jpg"
        const xmlRegex = /^([^/]+)\/page\/(.+)\.xml$/i;
        const imgRegex = /^([^/]+)\/(.+)\.jpg$/i; // Asumsi gambar JPG di root folder

        for (const file of files) {
            const path = file.webkitRelativePath;
            if (!folderName && path.includes('/')) {
                folderName = path.substring(0, path.indexOf('/')); // Ambil nama folder utama
            }

            const xmlMatch = path.match(xmlRegex);
            const imgMatch = path.match(imgRegex);

            if (xmlMatch) {
                const docId = xmlMatch[2];
                if (!selectedFilesData[docId]) selectedFilesData[docId] = {};
                selectedFilesData[docId].xmlFile = file;
                selectedFilesData[docId].name = docId; // Gunakan ID sebagai nama sementara
                if (debugOutput) debugOutput.textContent += `\nFound XML: ${path} (ID: ${docId})`;
            } else if (imgMatch) {
                const docId = imgMatch[2];
                if (!selectedFilesData[docId]) selectedFilesData[docId] = {};
                selectedFilesData[docId].imageFile = file;
                 if (debugOutput) debugOutput.textContent += `\nFound Image: ${path} (ID: ${docId})`;
            }
        }

        // Filter hanya dokumen yang memiliki XML dan Gambar
        const validDocIds = Object.keys(selectedFilesData).filter(id => selectedFilesData[id].xmlFile && selectedFilesData[id].imageFile);

        // Buat ulang documents array (opsional, bisa langsung dari selectedFilesData)
        const documents = validDocIds.map(id => ({
            id: id,
            name: selectedFilesData[id].name // atau format nama lain jika perlu
        }));

        if (selectedFolderDisplay) {
            selectedFolderDisplay.textContent = `Folder: ${folderName || 'Tidak Diketahui'} (${documents.length} dok valid)`;
        }
        if (debugOutput) debugOutput.textContent += `\n\nProcessed folder. Found ${documents.length} valid documents in folder "${folderName}".`;

        loadDocumentList(documents); // Muat daftar dengan dokumen yang valid
    }


    // --- Fungsi untuk Memuat Daftar Dokumen (dimodifikasi) ---
    function loadDocumentList(documents = []) { // Terima documents sebagai argumen
        if (!documentList) {
            console.error("Error: documentList element not found!");
            if (debugOutput) debugOutput.textContent += '\n\nERROR: documentList element not found!';
            return;
        }

        documentList.innerHTML = ''; // Kosongkan daftar sebelum memuat

        if (documents.length === 0) {
            documentList.innerHTML = '<li>Tidak ada dokumen valid (XML+Gambar) ditemukan di folder terpilih.</li>';
             if (debugOutput) debugOutput.textContent += '\n\nNo valid documents found to list.';
            return;
        }

        try {
            documents.forEach(doc => {
                const listItem = document.createElement('li');
                listItem.textContent = doc.name;
                listItem.dataset.docId = doc.id; // Simpan ID untuk referensi
                listItem.addEventListener('click', () => loadDocument(doc.id));
                documentList.appendChild(listItem);
            });

            if (debugOutput) {
                debugOutput.textContent += `\n\nDocument list loaded successfully with ${documents.length} items.`;
            }
            // Muat dokumen pertama secara otomatis jika ada
            if (documents.length > 0) {
                 loadDocument(documents[0].id);
                 // Tandai item pertama sebagai aktif (opsional)
                 const firstItem = documentList.querySelector('li');
                 if (firstItem) firstItem.classList.add('active');
            }

        } catch (error) {
            console.error("Error loading document list:", error);
            if (debugOutput) {
                debugOutput.textContent += '\n\nERROR loading document list: ' + error.message;
            }
            documentList.innerHTML = '<li>Gagal memuat daftar dokumen.</li>';
        }
    }

    // --- Fungsi untuk Memuat Gambar dan Teks Dokumen yang Dipilih (dimodifikasi) ---
    async function loadDocument(docId) {
        console.log(`Memuat dokumen: ${docId}`);
         if (debugOutput) debugOutput.textContent += `\n\nLoading document: ${docId}`;

        // Hapus highlight dari item list sebelumnya dan tambahkan ke yang baru
        documentList.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));
        const currentLi = documentList.querySelector(`li[data-doc-id="${docId}"]`);
        if (currentLi) currentLi.classList.add('active');


        imageContainer.innerHTML = '<p>Memuat gambar...</p>';
        textContent.innerHTML = '<p>Memuat teks...</p>';

        // Hapus Object URL sebelumnya jika ada
        if (currentObjectUrls.image) {
            URL.revokeObjectURL(currentObjectUrls.image);
            currentObjectUrls.image = null;
             if (debugOutput) debugOutput.textContent += `\nRevoked previous image Object URL.`;
        }
         // Hapus highlight layer lama jika ada
         removeHighlight();
         const oldLayer = document.getElementById('highlight-layer');
         if (oldLayer) oldLayer.remove();


        const docData = selectedFilesData[docId];
        if (!docData || !docData.imageFile || !docData.xmlFile) {
            console.error(`Data tidak lengkap untuk dokumen ${docId}`);
            imageContainer.innerHTML = '<p>Gagal memuat: Data file tidak ditemukan.</p>';
            textContent.innerHTML = '<p>Gagal memuat: Data file tidak ditemukan.</p>';
             if (debugOutput) debugOutput.textContent += `\n\nERROR: Missing file data for doc ID ${docId}`;
            return;
        }

        const imageFile = docData.imageFile;
        const xmlFile = docData.xmlFile;

        try {
            // 1. Buat Object URL untuk gambar dan tampilkan
            const imageUrl = URL.createObjectURL(imageFile);
            currentObjectUrls.image = imageUrl; // Simpan untuk di-revoke nanti
            if (debugOutput) debugOutput.textContent += `\nCreated image Object URL for ${imageFile.name}`;

            const img = document.createElement('img');
            img.alt = `Gambar ${docId}`;
            // Handler error dan load dipasang SEBELUM src di-set
             img.onerror = () => {
                console.error(`Gagal memuat gambar dari Object URL untuk ${docId}`);
                imageContainer.innerHTML = '<p>Gagal memuat gambar.</p>';
                 if (debugOutput) debugOutput.textContent += `\n\nERROR: Failed to load image from Object URL.`;
                URL.revokeObjectURL(imageUrl); // Bersihkan jika error
                currentObjectUrls.image = null;
            };

            // 2. Ambil dan proses file XML (langsung dari File object)
            const xmlText = await xmlFile.text();
            if (debugOutput) debugOutput.textContent += `\nSuccessfully read XML content for ${xmlFile.name}`;

            // --- Parsing XML (Sama seperti sebelumnya) ---
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const pageElement = xmlDoc.getElementsByTagName('Page')[0];
            const originalWidth = pageElement ? parseInt(pageElement.getAttribute('imageWidth')) : null;
            const originalHeight = pageElement ? parseInt(pageElement.getAttribute('imageHeight')) : null;

             if (!originalWidth || !originalHeight) {
                 console.warn(`Dimensi gambar asli tidak ditemukan di XML untuk ${docId}`);
                 if (debugOutput) debugOutput.textContent += `\n\nWARN: Original image dimensions not found in XML for ${docId}. Highlighting might be inaccurate.`;
             } else {
                  if (debugOutput) debugOutput.textContent += `\nFound original dimensions: ${originalWidth}x${originalHeight}`;
             }


            // Tunggu gambar dimuat SETELAH parsing XML (agar dimensi asli ada)
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    imageContainer.innerHTML = ''; // Hapus pesan loading
                    imageContainer.appendChild(img);
                    // Simpan dimensi asli ke dataset SETELAH gambar dimuat
                    if (originalWidth) img.dataset.originalWidth = originalWidth;
                    if (originalHeight) img.dataset.originalHeight = originalHeight;
                    if (debugOutput) debugOutput.textContent += `\nImage ${docId} loaded successfully. Dimensions stored.`;
                    resolve();
                };
                 // Pastikan onerror juga me-reject promise jika perlu
                 img.onerror = () => {
                     console.error(`Gagal memuat gambar dari Object URL (dalam promise) untuk ${docId}`);
                     imageContainer.innerHTML = '<p>Gagal memuat gambar.</p>';
                     if (debugOutput) debugOutput.textContent += `\n\nERROR: Failed to load image from Object URL (within promise).`;
                     URL.revokeObjectURL(imageUrl);
                     currentObjectUrls.image = null;
                     reject(new Error("Image load failed")); // Reject promise
                 };
                img.src = imageUrl; // Set src untuk memulai pemuatan
            });


            // --- Proses Teks (Sama seperti sebelumnya) ---
            const textRegions = xmlDoc.getElementsByTagName('TextRegion');
            textContent.innerHTML = ''; // Kosongkan sebelum menambahkan span
            let lineNumber = 1;

            for (const region of textRegions) {
                const textLines = region.getElementsByTagName('TextLine');
                for (const line of textLines) {
                    const coordsElement = line.getElementsByTagName('Coords')[0];
                    const textEquiv = line.querySelector(':scope > TextEquiv');
                    let lineText = "";
                    let coordsPoints = "";

                    if (textEquiv) {
                        const unicode = textEquiv.getElementsByTagName('Unicode')[0];
                        if (unicode) {
                            lineText = unicode.textContent.trim();
                        }
                    }
                    if (coordsElement) {
                        coordsPoints = coordsElement.getAttribute('points');
                    }

                    if (lineText) { // Tampilkan baris meskipun tidak ada koordinat
                        const span = document.createElement('span');
                        span.textContent = `${lineNumber}. ${lineText}`;
                        span.dataset.lineNumber = lineNumber;
                        span.classList.add('text-line');
                        if (coordsPoints) {
                             span.dataset.coords = coordsPoints; // Hanya tambahkan jika ada
                        }
                        textContent.appendChild(span);
                        textContent.appendChild(document.createTextNode('\n'));
                        lineNumber++;
                    }
                }
                 textContent.appendChild(document.createTextNode('\n')); // Spasi antar region
            }
             if (textContent.innerHTML.trim() === '') {
                 textContent.textContent = "Tidak ada teks ditemukan di XML.";
                  if (debugOutput) debugOutput.textContent += `\nNo text content found in XML for ${docId}.`;
             } else {
                  if (debugOutput) debugOutput.textContent += `\nText content parsed and displayed for ${docId}.`;
             }


            // 3. Panggil setupHighlighting setelah parsing selesai dan gambar dimuat
            // Pastikan gambar ada di DOM dan memiliki dimensi
             const displayedImg = imageContainer.querySelector('img');
            if (displayedImg && displayedImg.complete && displayedImg.dataset.originalWidth) {
                 setupHighlighting(displayedImg);
                  if (debugOutput) debugOutput.textContent += `\nCalling setupHighlighting for ${docId}.`;
            } else {
                console.warn("Gambar belum siap atau dimensi asli tidak ditemukan saat setupHighlighting seharusnya dipanggil.");
                 if (debugOutput) debugOutput.textContent += `\n\nWARN: Image not ready or dimensions missing when setupHighlighting was expected for ${docId}.`;
                 // Coba panggil lagi jika gambar baru saja selesai load setelah check ini (jarang terjadi dengan await)
                 if (displayedImg) {
                    displayedImg.addEventListener('load', () => {
                         if (displayedImg.dataset.originalWidth) {
                             setupHighlighting(displayedImg);
                             if (debugOutput) debugOutput.textContent += `\nCalling setupHighlighting for ${docId} after delayed load event.`;
                         } else {
                              if (debugOutput) debugOutput.textContent += `\n\nWARN: Dimensions still missing after delayed load event for ${docId}. Cannot setup highlighting.`;
                         }
                    }, { once: true });
                 }
            }


        } catch (error) {
            console.error(`Error memuat dokumen ${docId}:`, error);
             if (debugOutput) debugOutput.textContent += `\n\nERROR loading document ${docId}: ${error.message}\nStack: ${error.stack}`;
            imageContainer.innerHTML = `<p>Gagal memuat gambar untuk ${docId}.</p>`;
            textContent.innerHTML = `<p>Gagal memuat teks transkripsi untuk ${docId}. Lihat konsol untuk detail.</p>`;
             // Pastikan URL dibersihkan jika terjadi error di tengah proses
             if (currentObjectUrls.image) {
                 URL.revokeObjectURL(currentObjectUrls.image);
                 currentObjectUrls.image = null;
             }
        }
    }

    // --- Fungsi setupHighlighting, getOrCreateHighlightLayer, removeHighlight, drawHighlightShape ---
    // Tidak perlu diubah secara fundamental, pastikan mereka menggunakan
    // imageElement.dataset.originalWidth dan imageElement.dataset.originalHeight
    // yang sudah di-set di loadDocument.

    // --- (Salin fungsi setupHighlighting, getOrCreateHighlightLayer, removeHighlight, drawHighlightShape dari kode Anda sebelumnya ke sini) ---
    // Pastikan drawHighlightShape memeriksa keberadaan originalWidth/Height dari dataset
    function setupHighlighting(imageElement) {
        // ... (Sama seperti sebelumnya, pastikan menggunakan dataset) ...
        console.log("Setup highlighting untuk:", imageElement.alt);
        if (!imageElement.dataset.originalWidth || !imageElement.dataset.originalHeight) {
            console.warn("Dimensi asli tidak tersedia di dataset gambar. Highlighting mungkin tidak akurat.");
             if (debugOutput) debugOutput.textContent += `\n\nWARN: Original dimensions missing in dataset for ${imageElement.alt}. Highlighting may be inaccurate.`;
            // Optionally disable highlighting or proceed with caution
            // return;
        }
        const highlightLayer = getOrCreateHighlightLayer(imageElement); // Pass imageElement
        const originalWidth = parseFloat(imageElement.dataset.originalWidth);
        const originalHeight = parseFloat(imageElement.dataset.originalHeight);

        // Hapus listener lama jika ada
        textContent.removeEventListener('mouseover', handleTextMouseOver);
        textContent.removeEventListener('mouseout', handleTextMouseOut);

        // Definisikan handler di dalam scope agar bisa akses variabel luar
        function handleTextMouseOver(event) {
            if (event.target.classList.contains('text-line') && event.target.dataset.coords) {
                removeHighlight();
                const coordsStr = event.target.dataset.coords;
                const lineNumber = event.target.dataset.lineNumber;
                // Pastikan originalWidth dan originalHeight valid sebelum menggambar
                if (!isNaN(originalWidth) && !isNaN(originalHeight)) {
                    drawHighlightShape(coordsStr, imageElement, highlightLayer, originalWidth, originalHeight, lineNumber);
                    event.target.classList.add('highlight-text');
                } else {
                     console.warn("Tidak dapat menggambar highlight: dimensi asli tidak valid.");
                      if (debugOutput) debugOutput.textContent += `\n\nWARN: Cannot draw highlight for line ${lineNumber} - invalid original dimensions.`;
                }
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
         if (debugOutput) debugOutput.textContent += `\nHighlighting event listeners attached for ${imageElement.alt}.`;
    }

    function getOrCreateHighlightLayer(imageElement) { // Terima imageElement
        let layer = document.getElementById('highlight-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'highlight-layer';
            layer.style.position = 'absolute';
            layer.style.pointerEvents = 'none';
            layer.style.overflow = 'hidden'; // Cegah overflow nomor baris/highlight
             // Penting: Masukkan layer sebagai saudara dari gambar, BUKAN di dalamnya
             // dan pastikan parentnya (imageContainer) memiliki position relative/absolute/fixed
             imageContainer.style.position = 'relative'; // Pastikan container adalah positioning context
             imageContainer.appendChild(layer); // Tambahkan layer ke container
             if (debugOutput) debugOutput.textContent += `\nCreated highlight layer.`;
        }
         // Reset posisi dan ukuran setiap kali dipanggil (karena gambar bisa berubah ukuran)
         const imgRect = imageElement.getBoundingClientRect();
         const containerRect = imageContainer.getBoundingClientRect();
         layer.style.top = `${imgRect.top - containerRect.top + imageContainer.scrollTop}px`; // Posisi relatif thd container
         layer.style.left = `${imgRect.left - containerRect.left + imageContainer.scrollLeft}px`;
         layer.style.width = `${imgRect.width}px`;
         layer.style.height = `${imgRect.height}px`;
         layer.innerHTML = ''; // Pastikan layer kosong saat memulai
        return layer;
    }

     function removeHighlight() {
        const layer = document.getElementById('highlight-layer');
        if (layer) {
            layer.innerHTML = ''; // Hapus semua SVG/div highlight di dalam layer
        }
        textContent.querySelectorAll('.highlight-text').forEach(el => {
            el.classList.remove('highlight-text');
        });
    }


    function drawHighlightShape(coordsStr, imageElement, layer, originalWidth, originalHeight, lineNumber) {
        // ... (Validasi input sama seperti sebelumnya) ...
         if (!coordsStr || isNaN(originalWidth) || isNaN(originalHeight) || !imageElement.complete || imageElement.naturalWidth === 0) {
             console.warn("Data tidak lengkap atau gambar belum siap untuk menggambar highlight shape.");
              if (debugOutput) debugOutput.textContent += `\n\nWARN: Incomplete data or image not ready for drawing highlight shape (Line ${lineNumber}). Coords: ${coordsStr}, Original: ${originalWidth}x${originalHeight}, ImgComplete: ${imageElement.complete}`;
             return;
        }

        const pointsList = coordsStr.split(' ').map(p => {
            const xy = p.split(',');
            if (xy.length === 2 && !isNaN(parseFloat(xy[0])) && !isNaN(parseFloat(xy[1]))) {
                return { x: parseFloat(xy[0]), y: parseFloat(xy[1]) };
            }
            return null;
        }).filter(p => p !== null);

        if (pointsList.length < 3) {
             console.warn("Koordinat tidak cukup untuk membentuk poligon (perlu minimal 3 titik). Coords:", coordsStr);
              if (debugOutput) debugOutput.textContent += `\n\nWARN: Not enough points for polygon (Line ${lineNumber}). Coords: ${coordsStr}`;
             return;
        }

        // Dapatkan ukuran gambar yang ditampilkan saat ini (gunakan ukuran layer yg sudah dihitung)
        const displayWidth = parseFloat(layer.style.width);
        const displayHeight = parseFloat(layer.style.height);

        // Hitung faktor skala
        const scaleX = displayWidth / originalWidth;
        const scaleY = displayHeight / originalHeight;

        // Skalakan titik-titik poligon
        const scaledPointsStr = pointsList.map(p => `${p.x * scaleX},${p.y * scaleY}`).join(' ');

        // Buat elemen SVG container (relative to the layer)
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('width', '100%'); // SVG mengisi layer
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.overflow = 'visible';

        // Buat elemen poligon
        const polygon = document.createElementNS(svgNS, "polygon");
        polygon.setAttribute("points", scaledPointsStr);
        polygon.setAttribute("class", "highlight-polygon");
        // Style fallback (lebih baik di CSS)
        polygon.setAttribute("fill", "rgba(255, 255, 0, 0.4)");
        polygon.setAttribute("stroke", "rgba(230, 230, 0, 0.8)");
        polygon.setAttribute("stroke-width", "1");

        svg.appendChild(polygon);

        // --- Add Line Number Display (relative to the layer) ---
        if (lineNumber && pointsList.length > 0) {
            const numberDiv = document.createElement('div');
            numberDiv.className = 'highlight-line-number';
            numberDiv.textContent = lineNumber;
            // Style (lebih baik di CSS)
            numberDiv.style.position = 'absolute';
            const numLeft = pointsList[0].x * scaleX - 5;
            const numTop = pointsList[0].y * scaleY - 8;
            numberDiv.style.left = `${Math.max(0, numLeft)}px`; // Pastikan tidak keluar kiri
            numberDiv.style.top = `${Math.max(0, numTop)}px`;   // Pastikan tidak keluar atas
            numberDiv.style.backgroundColor = 'rgba(255, 255, 0, 0.8)';
            numberDiv.style.color = 'black';
            numberDiv.style.padding = '1px 3px';
            numberDiv.style.fontSize = '10px';
            numberDiv.style.fontWeight = 'bold';
            numberDiv.style.borderRadius = '3px';
            numberDiv.style.zIndex = '10';
            numberDiv.style.pointerEvents = 'none';

            // Tambahkan nomor ke layer, BUKAN ke SVG
            layer.appendChild(numberDiv);
        }
        // --- End Line Number Display ---

        // Tambahkan SVG ke layer
        layer.appendChild(svg);
         // Debug log
         // if (debugOutput) debugOutput.textContent += `\nDrew highlight shape for line ${lineNumber}. Scaled points: ${scaledPointsStr.substring(0, 50)}...`;

    }


    // --- Inisialisasi Awal ---
    // Tidak memuat daftar dokumen secara otomatis, tunggu pemilihan folder
    console.log("Menunggu pemilihan folder...");
    if (debugOutput) debugOutput.textContent += '\n\nInitialization complete. Waiting for folder selection.';
    if (documentList) documentList.innerHTML = '<li>Silakan pilih folder arsip menggunakan tombol di atas.</li>';


    // Optional: Bersihkan Object URL saat halaman ditutup
    window.addEventListener('beforeunload', () => {
        if (currentObjectUrls.image) {
            URL.revokeObjectURL(currentObjectUrls.image);
             console.log("Revoked image Object URL on page unload.");
        }
    });

});
