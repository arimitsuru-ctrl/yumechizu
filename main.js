/* =========
   夢の地図 main.js
   安定版（AI準備中）
   ========= */

/* ---------- 画面切り替え ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nb");
  const sections = document.querySelectorAll(".section");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.s;

      sections.forEach(sec => {
        sec.style.display = "none";
      });

      const show = document.getElementById("sec-" + target);
      if (show) show.style.display = "block";
    });
  });

  // 初期表示
  renderAI();
});

/* ---------- AI表示 ---------- */
function renderAI() {
  const chat = document.getElementById("chat");
  const choices = document.getElementById("choices");

  if (!chat || !choices) return;

  chat.innerText =
    "✨ AI準備中です。\n\n" +
    "次のアップデートで、\n" +
    "夢をプロジェクトに変えるAIが使えるようになります。";

  const demoChoices = [
    "音楽・アート",
    "スキルアップ",
    "旅行・冒険",
    "健康"
  ];

  choices.innerHTML = "";
  demoChoices.forEach(c => {
    const btn = document.createElement("button");
    btn.innerText = c;
    btn.className = "choice-btn";
    btn.onclick = () => {
      chat.innerText =
        `「${c}」ですね。\n\n` +
        "AIは現在準備中です。\n" +
        "公開まで少しお待ちください ✨";
      choices.innerHTML = "";
    };
    choices.appendChild(btn);
  });
}

/* ---------- AI呼び出し（安全ダミー） ---------- */
async function callAI(messages) {
  return {
    message:
      "✨ AI準備中です。\n\n" +
      "夢を具体的なプロジェクトに変えるAIは、\n" +
      "次回アップデートで有効になります。",
    choices: ["音楽・アート", "スキルアップ", "旅行・冒険", "健康"],
    project: null
  };
}
