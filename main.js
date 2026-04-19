// ====== グローバル状態 ======
const messages = [];
let currentSection = "home";

// ====== セクション切り替え ======
document.querySelectorAll(".nb").forEach(btn => {
  btn.addEventListener("click", () => {
    const sec = btn.dataset.s;
    showSection(sec);
  });
});

function showSection(sec) {
  currentSection = sec;
  document.querySelectorAll(".section").forEach(s => {
    s.style.display = "none";
  });
  const target = document.getElementById("sec-" + sec);
  if (target) target.style.display = "block";
}

// ====== 初期表示 ======
document.addEventListener("DOMContentLoaded", () => {
  showSection("home");
  startAI();
});

// ====== AI 初期開始 ======
function startAI() {
  const chat = document.getElementById("chat");
  const choices = document.getElementById("choices");

  chat.innerHTML = "あなたの夢について教えてください。";
  renderChoices(["やりたいことを探したい", "今ある夢を形にしたい"]);
}

// ====== 選択肢描画 ======
function renderChoices(list) {
  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  list.forEach(text => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = text;
    btn.onclick = () => onSendAI(text);
    choices.appendChild(btn);
  });
}

// ====== AI 呼び出し ======
async function onSendAI(text) {
  if (!text) return;

  const chat = document.getElementById("chat");
  const choices = document.getElementById("choices");

  messages.push({ role: "user", content: text });
  chat.innerHTML = "考え中…";
  choices.innerHTML = "";

  const res = await callAI(messages);

  if (res.message) {
    chat.innerHTML = res.message;
    messages.push({ role: "assistant", content: res.message });
  }

  if (res.choices && res.choices.length > 0) {
    renderChoices(res.choices);
  }
}

// ====== AI 本体（Puter + Llama 3.3） ======
async function callAI(messages) {
  const lang = "ja";

  const demoChoices = ["音楽・アート", "スキルアップ", "旅行・冒険", "健康"];

  const systemPrompt = `
You are a Dream Sketch AI helping users turn dreams into projects.

Rules:
1. Start by asking about broad interest areas
2. Narrow down based on responses
3. Finally propose: project name, 3-5 subtasks, shopping list
4. Respond in Japanese
5. Reply ONLY in JSON:
{"message":"...","choices":["a","b"],"project":null}
`;

  // Puter 読み込み待ち
  if (typeof puter === "undefined" || !puter.ai) {
    await new Promise(r => setTimeout(r, 1500));
  }

  if (typeof puter === "undefined" || !puter.ai) {
    return {
      message:
        "⚠️ AIを読み込めませんでした。\n\nネット接続を確認して再読み込みしてください。",
      choices: demoChoices,
      project: null
    };
  }

  const puterMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const response = await puter.ai.chat(puterMessages, {
      model: "meta-llama/llama-3.3-70b-instruct"
    });

    const raw =
      response?.message?.content ||
      response?.toString() ||
      "{}";

    const cleaned = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
  } catch (e) {
    return {
      message: "⚠️ AIエラーが発生しました。選択肢から続けてください。",
      choices: demoChoices,
      project: null
    };
  }
}
