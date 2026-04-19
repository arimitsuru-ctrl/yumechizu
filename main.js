/* =========
   夢の地図 main.js
   Groq AI 版（Llama 3）
   ========= */

const GROQ_API_KEY = "YOUR_GROQ_API_KEY";

/* ---------- 画面切り替え ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nb");
  const sections = document.querySelectorAll(".section");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.s;
      sections.forEach(sec => sec.style.display = "none");
      const show = document.getElementById("sec-" + target);
      if (show) show.style.display = "block";
    });
  });

  renderAI();
});

/* ---------- AI UI ---------- */
let messages = [];

function renderAI() {
  const chat = document.getElementById("chat");
  const choices = document.getElementById("choices");

  if (!chat || !choices) return;

  chat.innerText =
    "🌱 こんにちは。\n" +
    "あなたの「夢」をプロジェクトに変えるお手伝いをします。\n\n" +
    "まずは興味のある分野を選んでください。";

  const firstChoices = [
    "音楽・アート",
    "スキルアップ",
    "旅行・冒険",
    "健康"
  ];

  choices.innerHTML = "";
  firstChoices.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = c;
    btn.onclick = () => onSendAI(c);
    choices.appendChild(btn);
  });
}

/* ---------- ユーザー入力 ---------- */
async function onSendAI(text) {
  const chat = document.getElementById("chat");
  const choices = document.getElementById("choices");

  messages.push({ role: "user", content: text });
  chat.innerText += `\n\n🧑 あなた：${text}`;
  choices.innerHTML = "⏳ AIが考えています…";

  const res = await callAI(messages);

  messages.push({ role: "assistant", content: res.message });

  chat.innerText += `\n\n🤖 AI：${res.message}`;

  choices.innerHTML = "";
  (res.choices || []).forEach(c => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = c;
    btn.onclick = () => onSendAI(c);
    choices.appendChild(btn);
  });

  if (res.project) {
    chat.innerText +=
      `\n\n🎯 プロジェクト名：${res.project.name}\n` +
      `📝 タスク：\n- ${res.project.tasks.join("\n- ")}\n\n` +
      `🛒 買い物リスト：\n- ${res.project.shopping.join("\n- ")}`;
  }
}

/* ---------- Groq AI 呼び出し ---------- */
async function callAI(messages) {
  const systemPrompt = `
You are a Dream Sketch AI.
Help the user turn dreams into projects.

Rules:
1. Start broad, then narrow down
2. Propose a project with:
   - name
   - 3–5 tasks
   - shopping list (simple & affordable)
3. Offer 2–4 choices when appropriate
4. Respond ONLY in JSON format:
{
 "message": "...",
 "choices": ["a","b"],
 "project": null
}
OR
{
 "message": "...",
 "choices": [],
 "project": {
   "name": "...",
   "tasks": ["t1","t2"],
   "shopping": ["s1","s2"]
 }
}
`;

  const body = {
    model: "llama3-70b-8192",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ]
  };

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await r.json();
    const txt = data.choices[0].message.content;
    return JSON.parse(txt);

  } catch (e) {
    return {
      message: "⚠️ AIに接続できませんでした。ネットワークを確認してください。",
      choices: [],
      project: null
    };
  }
}
