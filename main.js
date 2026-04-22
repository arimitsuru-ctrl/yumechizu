// main.js（完成形）

const app = document.getElementById("app");

/* ========= 初期描画（これが無いと白画面） ========= */
app.innerHTML = `
  <section class="input-area">
    <p>🌱 あなたの「やってみたい」を書いてください</p>

    <textarea
      id="prompt"
      rows="3"
      placeholder="例：カフェをやってみたい"
    ></textarea>

    <button id="send">AIに聞く</button>
  </section>

  <section class="result-area">
    <div id="result"></div>
  </section>
`;

/* ========= 要素取得 ========= */
const sendBtn = document.getElementById("send");
const promptInput = document.getElementById("prompt");
const resultDiv = document.getElementById("result");

/* ========= 送信処理 ========= */
sendBtn.addEventListener("click", async () => {
  const text = promptInput.value.trim();

  if (!text) {
    resultDiv.textContent = "⚠️ 何か書いてください";
    return;
  }

  resultDiv.textContent = "🤔 考え中…";

  try {
    const res = await fetch(
      "https://yumechizu-ai.arimitsuru.workers.dev",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: "Japanese",
          prompt: text
        })
      }
    );

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();

    // Worker の返却形式に対応
    const answer =
      data.answer ||
      data.message ||
      JSON.stringify(data, null, 2);

    resultDiv.textContent = answer;

  } catch (err) {
    console.error(err);
    resultDiv.textContent =
      "❌ エ
