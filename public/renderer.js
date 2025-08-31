let rotasAtuais = [];
let rotaSelecionada = null;

const inputBR = document.getElementById("codigoBr");
const inputCEP = document.getElementById("cep");
const modal = document.getElementById("modalFallback");
const confirmBtn = document.getElementById("confirmFallback");
const cancelBtn = document.getElementById("cancelFallback");
const fallbackInput = document.getElementById("fallbackBR");

const uploadHistoricoBtn = document.getElementById("uploadHistorico");
const uploadDiaBtn = document.getElementById("uploadDia");
const labelHistorico = document.getElementById("labelHistorico");
const labelDia = document.getElementById("labelDia");

let pendingSave = null;

// Upload handlers
uploadHistoricoBtn.addEventListener("click", async () => {
  const res = await window.electronAPI.uploadCSV("historico");
  labelHistorico.textContent = res?.sucesso ? `Carregado: ${res.linhas} linhas` : "Nenhum arquivo selecionado";
});
uploadDiaBtn.addEventListener("click", async () => {
  const res = await window.electronAPI.uploadCSV("dia");
  labelDia.textContent = res?.sucesso ? `Carregado: ${res.linhas} linhas` : "Nenhum arquivo selecionado";
});

// abrir janela manual
document.getElementById("abrirManual")?.addEventListener("click", () => {
  window.electronAPI.openManualWindow();
});

// mantém apenas um campo ativo
inputBR.addEventListener("focus", () => (inputCEP.value = ""));
inputCEP.addEventListener("focus", () => (inputBR.value = ""));

// busca por BR
inputBR.addEventListener("change", async () => {
  const br = inputBR.value.trim();
  if (!br) return;
  renderRotas([], true);
  rotasAtuais = await window.electronAPI.searchByBR(br);
  rotaSelecionada = null;
  renderRotas(rotasAtuais, false, rotasAtuais.length ? null : "Nenhuma rota disponível");
});

// busca por CEP (apenas números)
inputCEP.addEventListener("change", async () => {
  const cepNums = inputCEP.value.replace(/\D/g, "");
  if (cepNums.length !== 8) {
    renderRotas([], false, "CEP inválido");
    return;
  }
  // formata visualmente
  inputCEP.value = cepNums.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  renderRotas([], true);
  rotasAtuais = await window.electronAPI.searchByCEP(cepNums);
  rotaSelecionada = null;
  renderRotas(rotasAtuais, false, rotasAtuais.length ? null : "Nenhuma rota disponível");
});

// renderizar rotas
function renderRotas(rotas, pesquisando = false, msg = null) {
  const campos = document.querySelectorAll(".rota-opcao");
  campos.forEach((campo) => campo.classList.remove("selecionada"));

  if (pesquisando) {
    campos.forEach((campo) => (campo.innerText = "Aguarde..."));
    return;
  }
  if (msg) {
    campos.forEach((campo) => (campo.innerText = msg));
    return;
  }
  campos.forEach((campo, i) => {
    campo.innerText = rotas[i]
      ? `${rotas[i].ROTA} - ${rotas[i].CIDADE} - ${rotas[i].AT}`
      : "(RETORNO DO SISTEMA)";
  });
}

// selecionar rota clicando
document.querySelectorAll(".rota-opcao").forEach((campo) => {
  campo.addEventListener("click", () => {
    document.querySelectorAll(".rota-opcao").forEach((c) => c.classList.remove("selecionada"));
    campo.classList.add("selecionada");
    const index = Number(campo.dataset.index || 0);
    rotaSelecionada = rotasAtuais[index] || { ROTA: "NÃO ATRIBUIDO", CIDADE: "NÃO ATRIBUIDO", AT: "" };
  });
});

// Salvar escolha (principal). Se veio por CEP e não há BR, abre modal fallback.
document.getElementById("salvarEscolha").addEventListener("click", async () => {
  const motivo = document.getElementById("motivo").value;
  const entradaRaw = inputBR.value.trim() || inputCEP.value.trim();

  if (!entradaRaw) return alert("Informe um BR ou CEP.");
  if (!motivo) return alert("Selecione um motivo.");

  if (!rotaSelecionada) rotaSelecionada = { ROTA: "NÃO ATRIBUIDO", CIDADE: "NÃO ATRIBUIDO", AT: "" };

  // Se entrou CEP (campo CEP preenchido) e não tem BR digitado → pedir BR no modal
  if (inputCEP.value && !inputBR.value) {
    pendingSave = {
      motivo,
      rotaSelecionada,
      cep: inputCEP.value.replace(/\D/g, ""),
    };
    modal.style.display = "flex";
    fallbackInput.focus();
    return;
  }

  // Caso BR preenchido: salva direto (entrada será BR)
  await salvarLog({
    tipo: inputBR.value ? "BR" : "CEP",
    entrada: inputBR.value ? inputBR.value.trim() : inputCEP.value.trim(),
    br: inputBR.value ? inputBR.value.trim() : "",
    rotaObj: rotaSelecionada,
    motivo,
    cep: inputCEP.value ? inputCEP.value.replace(/\D/g, "") : ""
  });
});

// modal confirmar
confirmBtn.addEventListener("click", async () => {
  if (!pendingSave) return;
  const brDigitado = fallbackInput.value.trim() || "NÃO INFORMADO";

  await salvarLog({
    tipo: "CEP",
    entrada: pendingSave.cep,
    br: brDigitado,
    rotaObj: pendingSave.rotaSelecionada,
    motivo: pendingSave.motivo || document.getElementById("motivo").value,
    cep: pendingSave.cep,
  });

  pendingSave = null;
  fallbackInput.value = "";
  modal.style.display = "none";
});

// modal cancelar
cancelBtn.addEventListener("click", () => {
  pendingSave = null;
  fallbackInput.value = "";
  modal.style.display = "none";
});

// função utilitária de salvar (sempre usa electronAPI.saveLog)
async function salvarLog({ tipo, entrada, br, rotaObj, motivo, cep = "" }) {
  await window.electronAPI.saveLog({
    tipo,
    entrada,
    br,
    rota: rotaObj?.ROTA ?? "NÃO ATRIBUIDO",
    cidade: rotaObj?.CIDADE ?? "NÃO ATRIBUIDO",
    at: rotaObj?.AT ?? "",
    motivo,
    cep,
  });

  // limpa UI
  inputBR.value = "";
  inputCEP.value = "";
  document.getElementById("motivo").value = "";
  renderRotas([], false, "(RETORNO DO SISTEMA)");
  rotaSelecionada = null;
}

// exportar relatório
document.getElementById("exportarRelatorio").addEventListener("click", async () => {
  await window.electronAPI.exportarRelatorio();
});
