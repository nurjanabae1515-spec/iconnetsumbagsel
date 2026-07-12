document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelectorAll(".menu a");

    menu.forEach(item => {
        item.addEventListener("click", function(){
            menu.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");
        });
    });

    const coordinateInput = document.getElementById("coordinateInput");
    const checkBtn = document.getElementById("checkBtn");
    const myLocationBtn = document.getElementById("myLocationBtn");
    const resultBox = document.getElementById("resultBox");
    const coverageGrid = document.getElementById("coverageGrid");

    const fatData = window.COVERAGE_DATA || [];
    const MAX_DISTANCE = 200;

    function showResult(type, title, message){
        if(!resultBox) return;

        resultBox.className = "result-box";

        if(type){
            resultBox.classList.add(type);
        }

        resultBox.innerHTML = `
            <h3>${title}</h3>
            ${message}
        `;
    }

    function parseCoordinate(text){
        const parts = text.trim().replace(/\s+/g, "").split(",");

        if(parts.length !== 2){
            return null;
        }

        const lat = Number(parts[0]);
        const lon = Number(parts[1]);

        if(isNaN(lat) || isNaN(lon)){
            return null;
        }

        return { lat, lon };
    }

    function getLat(item){
        return Number(item.latitude || item.Latitude || item.lat || item.LAT);
    }

    function getLon(item){
        return Number(item.longitude || item.Longitude || item.lng || item.lon || item.LNG || item.LON);
    }

    function getProvince(item){
        return item.provinsi || item.Provinsi || item.province || item.Province || "Tidak diketahui";
    }

    function getFatName(item){
        return item.id_fat || item["ID FAT"] || item.fat || item.FAT || item.nama || item.Nama || item.name || item.Name || "FAT tidak diketahui";
    }

    function getOlt(item){
        return item.hostname_olt || item["Hostname OLT"] || item.olt || item.OLT || "-";
    }

    function getCapacity(item){
        return item.capacity || item.Capacity || item.kapasitas || item.Kapasitas || "-";
    }

    function getUtilisasi(item){
        return item.utilisasi || item.Utilisasi || "-";
    }

    function haversineDistance(lat1, lon1, lat2, lon2){
        const R = 6371000;
        const toRad = value => value * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    function formatMeter(meter){
        if(meter >= 1000){
            return (meter / 1000).toFixed(2) + " km";
        }

        return Math.round(meter) + " meter";
    }

    function renderCoverageGrid(){
        if(!coverageGrid) return;

        if(fatData.length === 0){
            coverageGrid.innerHTML = `
                <div class="coverage-item">
                    <h3>Data belum terbaca</h3>
                    <p>Pastikan file coverage-data.js sudah tersambung.</p>
                </div>
            `;
            return;
        }

        const provinceCount = {};

        fatData.forEach(item => {
            const province = getProvince(item);
            provinceCount[province] = (provinceCount[province] || 0) + 1;
        });

        coverageGrid.innerHTML = Object.entries(provinceCount)
            .map(([province, total]) => `
                <div class="coverage-item">
                    <h3>${province}</h3>
                    <p>${total.toLocaleString("id-ID")} titik FAT</p>
                </div>
            `)
            .join("");
    }

    function checkCoverage(){
        if(!coordinateInput) return;

        const coordinate = parseCoordinate(coordinateInput.value);

        if(!coordinate){
            showResult("error", "Format koordinat salah", `
                <p>Masukkan koordinat dengan format: <b>latitude, longitude</b></p>
                <p>Contoh: <b>-5.397140, 105.266789</b></p>
            `);
            return;
        }

        if(fatData.length === 0){
            showResult("error", "Data FAT belum terbaca", `
                <p>File <b>coverage-data.js</b> belum terbaca.</p>
                <p>Pastikan file tersebut ada satu folder dengan covarage.html.</p>
            `);
            return;
        }

        let nearest = null;

        fatData.forEach(item => {
            const lat = getLat(item);
            const lon = getLon(item);

            if(isNaN(lat) || isNaN(lon)){
                return;
            }

            const distance = haversineDistance(
                coordinate.lat,
                coordinate.lon,
                lat,
                lon
            );

            if(nearest === null || distance < nearest.distance){
                nearest = {
                    item,
                    lat,
                    lon,
                    distance
                };
            }
        });

        if(!nearest){
            showResult("error", "Data FAT tidak valid", `
                <p>Tidak ada data FAT yang memiliki latitude dan longitude.</p>
            `);
            return;
        }

        if(nearest.distance <= MAX_DISTANCE){
            showResult("success", "ICONNET tersedia di area kamu", `
                <p><b>FAT terdekat:</b> ${getFatName(nearest.item)}</p>
                <p><b>Provinsi:</b> ${getProvince(nearest.item)}</p>
                <p><b>Jarak:</b> ${formatMeter(nearest.distance)}</p>
                <p><b>Koordinat FAT:</b> ${nearest.lat}, ${nearest.lon}</p>
                <p><b>OLT:</b> ${getOlt(nearest.item)}</p>
                <p><b>Capacity:</b> ${getCapacity(nearest.item)}</p>
                <p><b>Utilisasi:</b> ${getUtilisasi(nearest.item)}</p>
            `);
        }else{
            showResult("warning", "Belum tersedia dalam radius 200 meter", `
                <p><b>FAT terdekat:</b> ${getFatName(nearest.item)}</p>
                <p><b>Provinsi:</b> ${getProvince(nearest.item)}</p>
                <p><b>Jarak:</b> ${formatMeter(nearest.distance)}</p>
                <p><b>Koordinat FAT:</b> ${nearest.lat}, ${nearest.lon}</p>
                <p>Status: <b>Perlu survey lanjutan</b></p>
            `);
        }
    }

    function useMyLocation(){
        if(!navigator.geolocation){
            showResult("error", "Lokasi tidak didukung", `
                <p>Browser kamu tidak mendukung fitur lokasi.</p>
            `);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                if(coordinateInput){
                    coordinateInput.value = `${lat}, ${lon}`;
                }

                checkCoverage();
            },
            () => {
                showResult("error", "Gagal mengambil lokasi", `
                    <p>Izinkan akses lokasi di browser, lalu coba lagi.</p>
                `);
            }
        );
    }

    if(checkBtn){
        checkBtn.addEventListener("click", checkCoverage);
    }

    if(myLocationBtn){
        myLocationBtn.addEventListener("click", useMyLocation);
    }

    if(coordinateInput){
        coordinateInput.addEventListener("keydown", function(event){
            if(event.key === "Enter"){
                checkCoverage();
            }
        });
    }

    renderCoverageGrid();

    const paketData = {
        "reguler-20": ["20 Mbps (Reguler)", "Rp 259.000", "Rp 259.000/bulan", "Rp 50.000", "Rp 309.000", "• Paket bulanan reguler", "", "4 HANDPHONE", "2 LAPTOP"],
        "reguler-35": ["35 Mbps (Reguler)", "Rp 269.000", "Rp 269.000/bulan", "Rp 50.000", "Rp 319.000", "• Paket bulanan reguler", "", "6 HANDPHONE", "3 LAPTOP"],
        "reguler-50": ["50 Mbps (Reguler)", "Rp 319.000", "Rp 319.000/bulan", "Rp 50.000", "Rp 369.000", "• Paket bulanan reguler", "", "8 HANDPHONE", "4 LAPTOP"],
        "reguler-100": ["100 Mbps (Reguler)", "Rp 499.000", "Rp 499.000/bulan", "Rp 50.000", "Rp 549.000", "• Paket bulanan reguler", "", "10 HANDPHONE", "6 LAPTOP"],

        "hebat3-20": ["20 Mbps (Hebat 3)", "Rp 777.000", "Rp 259.000/bulan", "Rp 50.000", "Rp 827.000", "• Bayar 3 bulan", "", "4 HANDPHONE", "2 LAPTOP"],
        "hebat3-35": ["35 Mbps (Hebat 3)", "Rp 807.000", "Rp 269.000/bulan", "Rp 50.000", "Rp 857.000", "• Bayar 3 bulan", "", "6 HANDPHONE", "3 LAPTOP"],
        "hebat3-50": ["50 Mbps (Hebat 3)", "Rp 957.000", "Rp 319.000/bulan", "Rp 50.000", "Rp 1.007.000", "• Bayar 3 bulan", "", "8 HANDPHONE", "4 LAPTOP"],
        "hebat3-100": ["100 Mbps (Hebat 3)", "Rp 1.497.000", "Rp 499.000/bulan", "Rp 50.000", "Rp 1.547.000", "• Bayar 3 bulan", "", "10 HANDPHONE", "6 LAPTOP"],

        "hebat6-20": ["20 Mbps (Hebat 6)", "Rp 1.295.000", "Rp 215.833/bulan", "Rp 50.000", "Rp 1.345.000", "• Bayar 5 bulan + gratis 1 bulan", "", "4 HANDPHONE", "2 LAPTOP"],
        "hebat6-35": ["35 Mbps (Hebat 6)", "Rp 1.345.000", "Rp 224.167/bulan", "Rp 50.000", "Rp 1.395.000", "• Bayar 5 bulan + gratis 1 bulan", "", "6 HANDPHONE", "3 LAPTOP"],
        "hebat6-50": ["50 Mbps (Hebat 6)", "Rp 1.595.000", "Rp 265.833/bulan", "Rp 50.000", "Rp 1.645.000", "• Bayar 5 bulan + gratis 1 bulan", "", "8 HANDPHONE", "4 LAPTOP"],
        "hebat6-100": ["100 Mbps (Hebat 6)", "Rp 2.495.000", "Rp 415.833/bulan", "Rp 50.000", "Rp 2.545.000", "• Bayar 5 bulan + gratis 1 bulan", "", "10 HANDPHONE", "6 LAPTOP"],

        "hebat12-20": ["20 Mbps (Hebat 12)", "Rp 2.331.000", "Rp 194.250/bulan", "GRATIS", "Rp 2.331.000", "• Bayar 9 bulan + gratis 3 bulan", "• biaya instalasi gratis", "4 HANDPHONE", "2 LAPTOP"],
        "hebat12-35": ["35 Mbps (Hebat 12)", "Rp 2.421.000", "Rp 201.750/bulan", "GRATIS", "Rp 2.421.000", "• Bayar 9 bulan + gratis 3 bulan", "• biaya instalasi gratis", "6 HANDPHONE", "3 LAPTOP"],
        "hebat12-50": ["50 Mbps (Hebat 12)", "Rp 2.871.000", "Rp 239.250/bulan", "GRATIS", "Rp 2.871.000", "• Bayar 9 bulan + gratis 3 bulan", "• biaya instalasi gratis", "8 HANDPHONE", "4 LAPTOP"],
        "hebat12-100": ["100 Mbps (Hebat 12)", "Rp 4.491.000", "Rp 374.250/bulan", "GRATIS", "Rp 4.491.000", "• Bayar 9 bulan + gratis 3 bulan", "• biaya instalasi gratis", "10 HANDPHONE", "6 LAPTOP"],

        "hebat24-20": ["20 Mbps (Hebat 24)", "Rp 4.403.000", "Rp 183.458/bulan", "GRATIS", "Rp 4.403.000", "• Bayar 17 bulan + gratis 7 bulan", "• biaya instalasi gratis", "4 HANDPHONE", "2 LAPTOP"],
        "hebat24-35": ["35 Mbps (Hebat 24)", "Rp 4.573.000", "Rp 190.542/bulan", "GRATIS", "Rp 4.573.000", "• Bayar 17 bulan + gratis 7 bulan", "• biaya instalasi gratis", "6 HANDPHONE", "3 LAPTOP"],
        "hebat24-50": ["50 Mbps (Hebat 24)", "Rp 5.423.000", "Rp 225.958/bulan", "GRATIS", "Rp 5.423.000", "• Bayar 17 bulan + gratis 7 bulan", "• biaya instalasi gratis", "8 HANDPHONE", "4 LAPTOP"],
        "hebat24-100": ["100 Mbps (Hebat 24)", "Rp 8.483.000", "Rp 353.458/bulan", "GRATIS", "Rp 8.483.000", "• Bayar 17 bulan + gratis 7 bulan", "• biaya instalasi gratis", "10 HANDPHONE", "6 LAPTOP"]
    };

    const paketButtons = document.querySelectorAll(".page-paket .paket-btn[data-key]");
    const detailModal = document.getElementById("detailModal");
    const detailClose = document.getElementById("detailClose");

    function setText(id, value){
        const element = document.getElementById(id);

        if(element){
            element.textContent = value;
        }
    }

    function openDetailPaket(key){
        const data = paketData[key];

        if(!data || !detailModal){
            return;
        }

        setText("detailTitle", data[0]);
        setText("detailPackagePrice", data[1]);
        setText("detailMonthly", data[2]);
        setText("detailInstall", data[3]);
        setText("detailTotal", data[4]);
        setText("detailExtra", data[5]);
        setText("detailInstallNote", data[6] || " ");
        setText("detailPhone", data[7]);
        setText("detailLaptop", data[8]);

        detailModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeDetailPaket(){
        if(!detailModal){
            return;
        }

        detailModal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    paketButtons.forEach(button => {
        button.addEventListener("click", function(){
            openDetailPaket(this.dataset.key);
        });
    });

    if(detailClose){
        detailClose.addEventListener("click", closeDetailPaket);
    }

    if(detailModal){
        detailModal.addEventListener("click", function(event){
            if(event.target === detailModal || event.target.classList.contains("detail-overlay")){
                closeDetailPaket();
            }
        });
    }

    const openBrosurBtn = document.getElementById("openBrosurBtn");
    const brosurModal = document.getElementById("brosurModal");
    const closeBrosurBtn = document.getElementById("closeBrosurBtn");

    function openBrosur(){
        if(!brosurModal){
            return;
        }

        brosurModal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeBrosur(){
        if(!brosurModal){
            return;
        }

        brosurModal.classList.add("hidden");
        document.body.style.overflow = "";
    }

    if(openBrosurBtn){
        openBrosurBtn.addEventListener("click", openBrosur);
    }

    if(closeBrosurBtn){
        closeBrosurBtn.addEventListener("click", closeBrosur);
    }

    if(brosurModal){
        brosurModal.addEventListener("click", function(event){
            if(event.target === brosurModal || event.target.classList.contains("brosur-overlay")){
                closeBrosur();
            }
        });
    }

    document.addEventListener("keydown", function(event){
        if(event.key === "Escape"){
            closeDetailPaket();
            closeBrosur();
        }
    });

    console.log("Jumlah data FAT:", fatData.length);
});

