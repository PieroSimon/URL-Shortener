async function shorten() { 
    const url = document.getElementById("urlInput").value; 
    const resultDiv = document.getElementById("result");

    try {
        const response = await fetch("/api/shorten", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalUrl: url })
        });

        const data = await response.json();
        if (!response.ok) {
            resultDiv.innerHTML = `<p class="error-text">❌ ${data.error}</p>`;
            return;
        }

        const baseUrl = window.location.origin;
        const code = data.shortCode || data.short_code;
        const finalShortUrl = `${baseUrl}/${code}`;

        resultDiv.innerHTML = `
            <p>URL Corta:</p>
            <a href="${finalShortUrl}" target="_blank" class="short-url-link">${finalShortUrl}</a>
            <br><br>
            <button id="copyBtn" class="btn-primary">Copiar</button>
            <br><br>
            <img src="${data.qr}" class="qr-code-img" alt="QR Code"/>
        `; 

        document.getElementById("copyBtn").onclick = () => { 
            navigator.clipboard.writeText(finalShortUrl);
            alert("Enlace copiado ");
        };
    } catch (error) {
        resultDiv.innerHTML = `<p class="error-text">❌ Error de conexión</p>`;
    }
}

// --- Funciones de Reportes ---

async function toggleDetails(url, rowId, searchTerm = "") {
    const detailRow = document.getElementById(`details-${rowId}`);
    if (detailRow.style.display === "table-row") {
        detailRow.style.display = "none";
        return;
    }

    try {
        const res = await fetch(`/api/url-details?url=${encodeURIComponent(url)}`);
        let codes = await res.json();
        const detailsContainer = document.getElementById(`container-${rowId}`);

        const urlHeader = `
            <div class="detail-header">
                <p class="detail-label">URL COMPLETA:</p>
                <a href="${url}" target="_blank" class="detail-link">${url} </a>
            </div>
        `;

        const codesList = codes.map(c => {
            const fechaCreacion = new Date(c.created_at).toLocaleDateString();
            const ultimoClic = c.last_click 
                ? new Date(c.last_click).toLocaleString()
                : "Sin actividad";

            return `
                <div class="code-item">
                    <div class="code-col-main">
                        <span class="code-text">${c.short_code}</span>
                        <button onclick="event.stopPropagation(); showQR('${c.short_code}')" class="btn-qr-small">
                            VER QR
                        </button>
                    </div>
                    <div class="code-col-stats">
                        <span class="click-count">${c.clicks} clics</span>
                    </div>
                    <div class="code-col-dates">
                        <div>Fecha: ${fechaCreacion}</div>
                        <div class="${c.last_click ? 'status-active' : 'status-inactive'}">
                            Último: ${ultimoClic}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        detailsContainer.innerHTML = urlHeader + codesList;
        detailRow.style.display = "table-row";
    } catch (error) {
        console.error("Error en detalles:", error);
    }
}

async function updateGlobalReports() {
    const sortBy = document.getElementById("sortSelect").value;
    const searchTerm = document.getElementById("searchInput").value;
    const tableBody = document.getElementById("reportsTableBody");
    
    try {
        const res = await fetch(`/api/global-stats?sortBy=${sortBy}&search=${searchTerm}`);
        const data = await res.json();
        tableBody.innerHTML = ""; 

        data.forEach((url, index) => {
            tableBody.innerHTML += `
                <tr onclick="toggleDetails('${url.original_url}', ${index})" class="report-row">
                    <td class="truncate-text">${url.original_url}</td>
                    <td class="text-center">${url.versions_count} códigos ▾</td>
                    <td>${url.total_clicks}</td>
                </tr>
                <tr id="details-${index}" class="hidden-row">
                    <td colspan="3" id="container-${index}" class="no-padding"></td>
                </tr>
            `;
        });
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3">Error de servidor</td></tr>`;
    }
}

function toggleReports() {
    const section = document.getElementById("globalReportsSection");
    const isHidden = section.style.display === "none" || section.style.display === "";
    section.style.display = isHidden ? "block" : "none";
    if (isHidden) updateGlobalReports();
}

// --- Funciones del Modal QR ---

async function showQR(shortCode) {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/${shortCode}`;
    const modal = document.getElementById("qrModal");
    const container = document.getElementById("qrModalContainer");
    const downloadLink = document.getElementById("downloadQRLink");

    try {
        const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`;
        container.innerHTML = `<img src="${qrDataUrl}" alt="QR Code" class="qr-preview">`;
        downloadLink.href = qrDataUrl;
        downloadLink.download = `QR_${shortCode}.png`;
        modal.style.display = "block";
    } catch (error) {
        alert("Error al generar el QR");
    }
}

function closeQRModal() {
    document.getElementById("qrModal").style.display = "none";
}

// --- Exportación CSV ---

async function downloadCSV() {
    const tableBody = document.getElementById("reportsTableBody");
    const rows = Array.from(tableBody.querySelectorAll(".report-row"));
    const headers = ["URL ORIGINAL", "CODIGO CORTO", "CLICS", "FECHA CREACION", "ULTIMO CLIC"];
    const csvRows = [];

    for (const row of rows) {
        const originalUrl = row.cells[0].innerText.trim();
        try {
            const res = await fetch(`/api/url-details?url=${encodeURIComponent(originalUrl)}`);
            const details = await res.json();
            details.forEach(c => {
                const fechaCreacion = new Date(c.created_at).toLocaleDateString();
                const ultimoClic = c.last_click ? new Date(c.last_click).toLocaleString() : "Sin actividad";
                csvRows.push(`"${originalUrl}";"${c.short_code}";"${c.clicks}";"${fechaCreacion}";"${ultimoClic}"`);
            });
        } catch (e) { console.error(e); }
    }

    const BOM = "\uFEFF"; 
    const SEP = "sep=;\n"; 
    const csvContent = BOM + SEP + headers.join(";") + "\n" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Insights.csv`;
    link.click();
}