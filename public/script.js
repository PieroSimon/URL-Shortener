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

    // TRUCO: Construimos la URL completa usando el dominio actual
    const baseUrl = window.location.origin; 
    const finalShortUrl = `${baseUrl}/${data.shortCode}`;

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
      alert("Enlace copiado 🚀");
    };
  } catch (error) {
    resultDiv.innerHTML = `<p class="error-text">❌ Error de conexión</p>`;
  }
}

// Actualiza la llamada en updateGlobalReports para pasar el searchTerm
// onclick="toggleDetails('${url.original_url}', ${index}, '${searchTerm}')"

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

    if (searchTerm.trim() !== "") {
      codes.sort((a, b) => {
        if (a.short_code.toLowerCase() === searchTerm.toLowerCase()) return -1;
        if (b.short_code.toLowerCase() === searchTerm.toLowerCase()) return 1;
        return 0;
      });
    }

    const urlHeader = `
      <div class="detail-header">
        <p class="detail-label">URL COMPLETA:</p>
        <a href="${url}" target="_blank" class="detail-link">${url} 🔗</a>
      </div>
    `;

    const codesList = codes.map(c => {
      const isMatch = c.short_code.toLowerCase() === searchTerm.toLowerCase();
      const fechaCreacion = new Date(c.created_at).toLocaleDateString();
      const ultimoClic = c.last_click 
        ? new Date(c.last_click).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : "Sin actividad";

      return `
        <div class="code-item ${isMatch ? 'highlighted-code' : ''}">
          <div class="code-col-main">
            <span class="code-text">${isMatch ? ''  : ''}${c.short_code}</span>
          </div>
          <div class="code-col-stats">
            <span class="click-count">${c.clicks} clics</span>
          </div>
          <div class="code-col-dates">
            <div> Fecha de creación: ${fechaCreacion}</div>
            <div class="${c.last_click ? 'status-active' : 'status-inactive'}">
               Último click: ${ultimoClic}
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

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="empty-state">No se encontraron resultados</td></tr>`;
      return;
    }

    data.forEach((url, index) => {
      tableBody.innerHTML += `
        <tr onclick="toggleDetails('${url.original_url}', ${index})" class="report-row">
          <td title="${url.original_url}" class="truncate-text">
            ${url.original_url}
          </td>
          <td class="text-center muted-text">
            ${url.versions_count} códigos ▾
          </td>
          <td class="click-total">
            ${url.total_clicks}
          </td>
        </tr>
        <tr id="details-${index}" class="hidden-row">
          <td colspan="3" id="container-${index}" class="no-padding"></td>
        </tr>
      `;
    });
    if (data.length === 1 && searchTerm.length >= 4) {
    toggleDetails(data[0].original_url, 0, searchTerm);
    }
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="3" class="error-text">Error de servidor</td></tr>`;
  }
}

function toggleReports() {
  const section = document.getElementById("globalReportsSection");
  const isHidden = section.style.display === "none" || section.style.display === "";
  section.style.display = isHidden ? "block" : "none";
  if (isHidden) {
    updateGlobalReports();
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// CSV (EN PRUEBA)
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
        
        // LIMPIEZA DE FECHA: Usamos un formato ISO o limpiamos los caracteres no deseados
        let ultimoClic = "Sin actividad";
        if (c.last_click) {
          const dateObj = new Date(c.last_click);
          // Formato: DD/MM/YYYY HH:mm:ss (Evitamos el a.m./p.m. problemático)
          const dia = String(dateObj.getDate()).padStart(2, '0');
          const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
          const anio = dateObj.getFullYear();
          const hora = String(dateObj.getHours()).padStart(2, '0');
          const min = String(dateObj.getMinutes()).padStart(2, '0');
          ultimoClic = `${dia}/${mes}/${anio} ${hora}:${min}`;
        }

        csvRows.push(`"${originalUrl.replace(/"/g, '""')}";"${c.short_code}";"${c.clicks}";"${fechaCreacion}";"${ultimoClic}"`);
      });
    } catch (error) {
      console.error("Error al exportar:", originalUrl);
    }
  }

  // BOM y SEP para que Excel no tenga excusas
  const BOM = "\uFEFF"; 
  const SEP = "sep=;\n"; 
  const csvContent = BOM + SEP + headers.join(";") + "\n" + csvRows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `Reportes_${fechaHoy}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}