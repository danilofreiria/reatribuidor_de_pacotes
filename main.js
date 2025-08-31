const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

let historicoData = [];
let diaData = [];
let relatorioLogs = [];
let manualWin = null;

function normalizeHeaderKey(h) {
  if (!h) return "";
  return h.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function mapRowToCanonical(row) {
  const out = {
    spx_tn: "",
    zipcode: "",
    destination_address: "",
    city: "",
    neighborhood: "",
    planned_at: "",
    corridor_cage: "",
  };

  Object.keys(row).forEach((rawKey) => {
    const v = row[rawKey] == null ? "" : String(row[rawKey]).trim();
    const k = normalizeHeaderKey(rawKey);

    if (k.includes("spx") && k.includes("tn")) out.spx_tn = v;
    else if (k.includes("codigo") && k.includes("br")) out.spx_tn = v;
    else if (k === "spx tn" || k === "spx" || k === "br") out.spx_tn = v;
    else if (k.includes("zip") || k.includes("cep") || k.includes("zipcode")) out.zipcode = v;
    else if (k.includes("destination") || k.includes("address")) out.destination_address = v;
    else if (k.includes("city")) out.city = v;
    else if (k.includes("neighborhood") || k.includes("bairro")) out.neighborhood = v;
    else if ((k.includes("planned") && k.includes("at")) || k === "at") out.planned_at = v;
    else if (k.includes("corridor") || k.includes("cage")) {
        out.corridor_cage = v;
    } 
    else if (k.includes("rota")) {
        if (!out.corridor_cage) {
            out.corridor_cage = v;
        }
    }
  });

  return out;
}

function parseCSVNormalized(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results.map(mapRowToCanonical)))
      .on("error", (err) => reject(err));
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "public", "index.html"));
}

function createManualWindow() {
  if (manualWin && !manualWin.isDestroyed()) {
    manualWin.focus();
    return;
  }
  manualWin = new BrowserWindow({
    width: 900,
    height: 700,
    resizable: false,
    title: "Atribuição Manual",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  manualWin.loadFile(path.join(__dirname, "public", "manual.html"));
  manualWin.on("closed", () => (manualWin = null));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/* ===== Upload CSV ===== */
ipcMain.handle("upload-csv", async (_event, tipo) => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
    });

    if (canceled || filePaths.length === 0) return { sucesso: false, linhas: 0 };

    const filePath = filePaths[0];
    const rows = await parseCSVNormalized(filePath);

    if (tipo === "historico") historicoData = rows;
    if (tipo === "dia") diaData = rows;

    console.log(`[MAIN] CSV ${tipo} carregado: ${rows.length} linhas`);
    return { sucesso: true, linhas: rows.length };
  } catch (err) {
    console.error("[MAIN] Erro ao processar CSV:", err);
    return { sucesso: false, linhas: 0, erro: err.message };
  }
});

/* ===== Busca por BR ===== */
ipcMain.handle("search-by-br", async (_event, br) => {
  if (!historicoData.length || !diaData.length) return [];

  const brUpper = String(br || "").toUpperCase().trim();

  const registroHistorico = historicoData.find(
    (r) => (r.spx_tn || "").toUpperCase() === brUpper
  );
  if (!registroHistorico) return [];

  const cep = (registroHistorico.zipcode || "").replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) return [];

  const resultadosDia = diaData.filter(
    (r) => (r.zipcode || "").replace(/\D/g, "") === cep
  );

  if (resultadosDia.length === 0) return [];

  const vistos = new Set();
  const unicos = resultadosDia.filter((r) => {
    const at = (r.planned_at || "").trim();
    if (!at || vistos.has(at)) return false;
    vistos.add(at);
    return true;
  });

  return unicos.slice(0, 3).map((r) => ({
    ROTA: r.corridor_cage || "",
    AT: r.planned_at || "",
    CIDADE: r.city || "",
  }));
});



/* ===== Busca por CEP ===== */
ipcMain.handle("search-by-cep", async (_event, cep) => {
  if (!diaData.length) return [];

  const cleanCep = String(cep || "").replace(/\D/g, "");
  if (!/^\d{8}$/.test(cleanCep)) return [];

  const resultados = diaData.filter(
    (r) => (r.zipcode || "").replace(/\D/g, "") === cleanCep
  );

  if (resultados.length === 0) return [];

  const vistos = new Set();
  const unicos = resultados.filter((r) => {
    const at = (r.planned_at || "").trim();
    if (!at || vistos.has(at)) return false;
    vistos.add(at);
    return true;
  });

  return unicos.slice(0, 3).map((r) => ({
    ROTA: r.corridor_cage || "",
    AT: r.planned_at || "",
    CIDADE: r.city || "",
  }));
});


/* ===== Abrir janela manual ===== */
ipcMain.handle("open-manual-window", () => {
  createManualWindow();
});



/* ===== Salvar log (principal e manual) ===== */
ipcMain.handle("save-log", (_event, dados) => {
  const dataHora = new Date().toLocaleString("pt-BR");
  
  // Cria uma cópia dos dados para o log
  const logData = { ...dados };

  // Lógica para definir o tipo de entrada para o relatório
  if (logData.entrada !== "MANUAL") {
    if (logData.br && String(logData.br).trim() !== "") {
      logData.entrada = "BR";
    } else if (logData.cep && String(logData.cep).trim() !== "") {
      logData.entrada = "CEP";
    }
  }
  
  relatorioLogs.push({ ...logData, dataHora: dataHora });
  
  console.log("[MAIN] Log salvo:", logData);

  // A janela da etiqueta ainda usa os dados originais
  createEtiquetaWindow(dados);

  return { ok: true };
});



/* ===== Gerar etiqueta para a impressão ===== */
function createEtiquetaWindow(dados) {
  const etiquetaWin = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const query = new URLSearchParams({
    rota: dados.rota || "",
    cidade: dados.cidade || "",
    at: dados.at || "",
    br: dados.br || "",
    motivo: dados.motivo || "",
  }).toString();

  etiquetaWin.loadFile(path.join(__dirname, "public", "etiqueta.html"), {
    search: `?${query}`,
  });
}


/* ===== Exportar relatório ===== */
ipcMain.handle("exportar-relatorio", async () => {
  if (relatorioLogs.length === 0) return { ok: false, msg: "Nenhum registro." };

  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const yyyy = String(hoje.getFullYear());
  const nomeArquivo = `RELATORIO_DE_REATRIBUICAO_${dd}-${mm}-${yyyy}.csv`;

  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: nomeArquivo,
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });

  if (canceled || !filePath) return { ok: false, msg: "Cancelado" };

  // Cabeçalho do CSV 
  const header = "Entrada,BR,CEP,Rota,Cidade,AT,Modal,Motivo,Data e Hora\n";
  const linhas = relatorioLogs
    .map((l) =>
      [
        
        l.entrada ?? "",
        l.br ?? "",
        l.cep ?? "",
        l.rota ?? "",
        l.cidade ?? "",
        l.at ?? "",
        l.modal ?? "", 
        l.motivo ?? "",
        l.dataHora ?? "", 
      ]
         .map((v) => String(v).toUpperCase().replace(/"/g, '""')) // Converte para string, depois para maiúsculas e escapa aspas
        .map((v) => `"${v}"`)
        .join(",")
    )
    .join("\n");

  fs.writeFileSync(filePath, header + linhas, "utf-8");
  console.log("[MAIN] Relatório exportado:", filePath);
  return { ok: true, filePath };
});

