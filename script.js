// URL base do backend
const BACKEND_URL = "https://SEU_SERVICE.onrender.com";

const emailText = document.getElementById("email-text");
const analyzeTextBtn = document.getElementById("analyze-text-btn");
const emailFileInput = document.getElementById("email-file");
const analyzeFileBtn = document.getElementById("analyze-file-btn");

const statusArea = document.getElementById("status-area");
const categoryEl = document.getElementById("result-category");
const responseEl = document.getElementById("result-response");
const resultTimeEl = document.getElementById("result-time");

document.getElementById("backend-url-label").textContent = BACKEND_URL;

// Tabs
document.querySelectorAll(".tab-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-button")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((tab) => tab.classList.remove("active"));

    btn.classList.add("active");
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});

function setStatus(message, type = "info") {
  statusArea.textContent = message;
  statusArea.classList.remove("hidden", "info", "error", "success");
  statusArea.classList.add(type);
}

function clearStatus() {
  statusArea.classList.add("hidden");
}

function setResult(category, response) {
  if (!category) {
    categoryEl.textContent = "Aguardando análise...";
    categoryEl.className = "category-badge category-empty";
  } else {
    categoryEl.textContent = category;

    if (category === "Produtivo") {
      categoryEl.className = "category-badge category-prod";
    } else if (category === "Improdutivo") {
      categoryEl.className = "category-badge category-improd";
    } else {
      categoryEl.className = "category-badge category-empty";
    }
  }

  responseEl.textContent = response || "Nenhuma resposta gerada.";
  const now = new Date();
  resultTimeEl.textContent = `Última análise: ${now.toLocaleString("pt-BR")}`;
}

async function analyzeText() {
  const texto = emailText.value.trim();
  if (!texto) {
    setStatus(
      "Por favor, preencha o texto do email antes de analisar.",
      "error"
    );
    return;
  }

  setStatus("Analisando email de texto...", "info");
  setResult(null, "Processando...");

  try {
    const res = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texto }),
    });

    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    setStatus("Análise concluída com sucesso.", "success");
    setResult(data.categoria, data.resposta_sugerida);
  } catch (err) {
    console.error(err);
    setStatus(
      "Erro ao comunicar com o backend. Verifique se a API está rodando.",
      "error"
    );
    setResult(null, "Não foi possível obter a resposta.");
  }
}

async function analyzeFile() {
  const file = emailFileInput.files[0];
  if (!file) {
    setStatus("Selecione um arquivo .txt ou .pdf para analisar.", "error");
    return;
  }

  setStatus(`Enviando arquivo "${file.name}" para análise...`, "info");
  setResult(null, "Processando...");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${BACKEND_URL}/analyze_file`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erro backend:", errorText);
      throw new Error(`Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    setStatus("Análise de arquivo concluída com sucesso.", "success");
    setResult(data.categoria, data.resposta_sugerida);
  } catch (err) {
    console.error(err);
    setStatus(
      "Erro ao enviar o arquivo. Verifique se o backend está disponível.",
      "error"
    );
    setResult(null, "Não foi possível obter a resposta.");
  }
}

analyzeTextBtn.addEventListener("click", analyzeText);
analyzeFileBtn.addEventListener("click", analyzeFile);
