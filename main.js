/* =========================
   セクション切り替え
========================= */
const sections = {
  home: document.getElementById("sec-home"),
  tasks: document.getElementById("sec-tasks"),
  map: document.getElementById("sec-map"),
  shop: document.getElementById("sec-shop"),
  cal: document.getElementById("sec-cal"),
};

document.querySelectorAll(".nb").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.s;
    Object.values(sections).forEach(s => s.classList.remove("active"));
    sections[key].classList.add("active");

    if (key === "home" && chat.innerHTML.trim() === "") {
      startAI();
    }
  });
});

/* =========================
   AI 関連
========================= */
const chat = document.getElementById("chat");
const choicesDiv = document.getElementById("choices");

let messages = [];

/* 初回起動 */
window.addEventListener("load", () => {
  startAI();
});

function startAI() {
  chat.innerHTML = "🤖 夢について少し教えてください。";
  messages = [];
  renderChoices(["やりたいことを探したい", "夢を形にしたい"]);
}

/* 選択肢クリック */
function onSendAI(text) {
  messages.push({ role: "user", content: text });
  chat.innerHTML = "考え中…";

  callAI(messages).then(res => {
    chat.innerHTML = res.message || "";
    messages.push({ role: "assistant", content: res.message });

    if (res.choices && res.choices.length) {
      renderChoices(res.choices);
    } else {
      choicesDiv.innerHTML = "";
    }
  });
}

/* 選択肢描画 */
function renderChoices(list) {
  choicesDiv.innerHTML = "";
  list.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => onSendAI(c);
    choicesDiv.appendChild(b);
  });
}

/* =========================
   Puter + Llama 3.3
========================= */
async function callAI(messages) {

  /* Puter初期化待ち（最大3秒） */
  if (typeof puter === "undefined" || !puter.ai) {
    await new Promise(r => {
      let t = 0;
      const i = setInterval(() => {
        t += 200;
        if (typeof puter !== "undefined" && puter.ai) {
          clearInterval(i); r();
        }
        if (t >= 3000) {
          clearInterval(i); r();
        }
      }, 200);
    });
  }

  if (typeof puter === "undefined" || !puter.ai) {
    return {
      message: "⚠️ AIに接続できません。\nインターネット接続を確認してください。",
      choices: ["もう一度試す"],
      project: null
    };
  }

  const systemPrompt = `
You are a Dream Sketch AI.
1. Ask about interests
2. Narrow down
3. Propose a project with tasks and shopping list
Reply ONLY in Japanese.
Reply ONLY in JSON:
{"message":"...","choices":["a","b"],"project":null}
`;

  const puterMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const res = await puter.ai.chat(puterMessages, {
      model: "meta-llama/llama-3.3-70b-instruct"
    });

    const txt =
      res?.message?.content ||
      res?.toString() ||
      "{}";

    const cleaned = txt.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);

  } catch (e) {
    return {
      message: "⚠️ AIエラーが発生しました。",
      choices: ["やり直す"],
      project: null
    };
  }
}
