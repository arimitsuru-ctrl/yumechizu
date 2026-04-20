// ===== グローバル状態 =====
let aiMessages = [];

// ===== セクション切り替え =====
document.querySelectorAll(".nb").forEach(btn => {
  btn.addEventListener("click", () => {
    const s = btn.dataset.s;
    document.querySelectorAll(".section").forEach(sec => {
      sec.style.display = sec.id === "sec-" + s ? "block" : "none";
    });
  });
});

// ===== AI UI 初期描画 =====
document.addEventListener("DOMContentLoaded", () => {
  renderAI();
});

// ===== AI UI 描画 =====
function renderAI() {
  const chat = document.getElementById("chat");
  const choices = document.getElementById("choices");

  if (!chat || !choices) return;

  chat.innerHTML = `
    <div class="ai-msg">🌱 どんな夢や、やってみたいことがありますか？</div>
    <input id="aiInput" placeholder="例：新しいことを始めたい" />
    <button id="aiSend">送信</button>
  `;

  choices.innerHTML = "";

  document.getElementById("aiSend").onclick = onSendAI;
}

// ===== AI 送信処理 =====
async function onSendAI() {
  const input = document.getElementById("aiInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  aiMessages.push({ role: "user", content: text });
  appendMessage("🧑‍💭 " + text);

  const res = await callAI(aiMessages);

  if (res.message) {
    aiMessages.push({ role: "assistant", content: res.message });
    appendMessage("🤖 " + res.message);
  }

  renderChoices(res.choices || []);

  if (res.project) {
    renderProject(res.project);
  }
}

// ===== AI 呼び出し（Worker） =====
async function callAI(messages) {
  const res = await fetch("https://yumechizu.arimitsuru.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lang: "ja",
      messages
    })
  });

  return await res.json();
}

// ===== 表示補助 =====
function appendMessage(text) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "ai-msg";
  div.textContent = text;
  chat.appendChild(div);
}

function renderChoices(list) {
  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  list.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => {
      aiMessages.push({ role: "user", content: c });
      appendMessage("🧑‍💭 " + c);
      onSendAI();
    };
    choices.appendChild(b);
  });
}

function renderProject(p) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");

  div.innerHTML = `
    <h3>📌 ${p.name}</h3>
    <b>📝 タスク</b>
    <ul>${p.tasks.map(t => `<li>${t}</li>`).join("")}</ul>
    <b>🛒 買い物リスト</b>
    <ul>${p.shopping.map(s => `<li>${s}</li>`).join("")}</ul>
  `;

  chat.appendChild(div);
}
