document.addEventListener("DOMContentLoaded", () => {
  const brInput = document.getElementById("brManual");
  const rotaInput = document.getElementById("rotaManual");
  const cidadeSelect = document.getElementById("cidadeManual");
  const atInput = document.getElementById("atManual");
  const modalSelect = document.getElementById("modalManual");
  const motivoSelect = document.getElementById("motivo");

  const salvarBtn = document.getElementById("salvarManual");
  const limparBtn = document.getElementById("limparManual");

  salvarBtn.addEventListener("click", async () => {
    const br = (brInput.value || "").trim();
    const rota = (rotaInput.value || "").trim();
    const cidade = (cidadeSelect.value || "").trim();
    const at = (atInput.value || "").trim();
    const modal = (modalSelect.value || "").trim();
    const motivo = (motivoSelect.value || "").trim();

    if (!br) { alert("O BR é obrigatório."); return; }
    if (!rota) { alert("A Rota é obrigatória."); return; }
    if (!cidade) { alert("A Cidade é obrigatória."); return; }
    if (!motivo) { alert("Selecione um motivo."); return; }

    await window.electronAPI.saveLog({
      tipo: "MANUAL",
      entrada: "MANUAL",
      br,
      rota,
      cidade,
      at,
      modal,
      motivo,
      cep: ""
    });

    alert("Registro manual salvo!");
    limparCampos();
  });

  limparBtn.addEventListener("click", limparCampos);

  function limparCampos() {
    brInput.value = "";
    rotaInput.value = "";
    cidadeSelect.value = "";
    atInput.value = "";
    modalSelect.value = "";
    motivoSelect.value = "";
    brInput.focus();
  }
});
