// ===== 設定 =====
const AI_URL = "https://yumechizu-ai.arimitsuru.workers.dev";

// アプリの言語コード（既存の取得ロジックがあれば差し替えてOK）
function getLang() {
  // 例: navigator.language から簡易取得
  const l = (navigator.language || "en").slice(0, 2);
  const map = {
    ja: "Japanese",
    en: "English",
    zh: "Chinese",
    ko: "Korean",
    es: "Spanish",
    pt: "Portuguese",
    de: "German",
    ar: "Arabic",
    ru: "Russian",
    id: "Indonesian",
    hi: "Hindi"
  };
  return map[l] || "English";
}

// ===== UI 要素 =====
const chatEl = document.getElementById("chat");
const choicesEl = document.getElementById("choices");

// 入力UI（無ければ自動生成）
let inputEl = document.getElementById("ai-input");
let sendBtn = document.getElementById("ai-send");
if (!inputEl) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.gap = "8px";
  wrap.style.marginTop = "12px";

  inputEl = document.createElement("input");
  inputEl.id = "ai-input";
  inputEl.placeholder = "やりたいこと・夢を入力…";
  inputEl.style.flex = "1";

  sendBtn = document.createElement("button");
  sendBtn.id = "ai-send";
  sendBtn.textContent = "送信";

  wrap.appendChild(inputEl);
  wrap.appendChild(sendBtn);
  chatEl.after(wrap);
}

// ===== 表示ヘルパー =====
function appendMessage(text, who = "ai") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function renderChoices(choices = []) {
  choicesEl.innerHTML = "";
  choices.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => sendToAI(c);
    choicesEl.appendChild(b);
  });
}

function renderProject(project) {
  if (!project) return;
  const box = document.createElement("div");
  box.className = "project";

  const h = document.createElement("h3");
  h.textContent = project.name;
  box.appendChild(h);

  const ulT = document.createElement("ul");
  project.tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    ulT.appendChild(li);
  });
  box.appendChild(ulT);

  if (project.shopping && project.shopping.length) {
    const ulS = document.createElement("ul");
    project.shopping.forEach(s => {
      const li = document.createElement("li");
      li.textContent = "🛒 " + s;
      ulS.appendChild(li);
    });
    box.appendChild(ulS);
  }

  chatEl.appendChild(box);
}

// ===== AI 呼び出し =====
async function callAI(prompt) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lang: getLang(),
      prompt
    })
  });

  const data = await res.json();

  // ★ 重要：answer は JSON文字列 → パースする
  const ai = typeof data.answer === "string"
    ? JSON.parse(data.answer)
    : data.answer;

  return ai;
}

// ===== 送信処理 =====
async function sendToAI(text) {
  if (!text) return;

  appendMessage(text, "user");
  inputEl.value = "";
  choicesEl.innerHTML = "";

  try {
    const ai = await callAI(text);

    if (ai.message) appendMessage(ai.message, "ai");
    if (ai.choices) renderChoices(ai.choices);
    if (ai.project) renderProject(ai.project);

  } catch (e) {
    appendMessage("⚠️ AIとの通信に失敗しました。", "ai");
    console.error(e);
  }
}

// ===== イベント =====
sendBtn.onclick = () => sendToAI(inputEl.value);
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") sendToAI(inputEl.value);
});

// 初期メッセージ
appendMessage("やりたいこと・夢を教えてください。", "ai");
