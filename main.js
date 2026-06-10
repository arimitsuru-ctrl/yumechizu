const ENDPOINT = "https://yumechizu3.arimitsuru.workers.dev/api/chat";

document.getElementById("send").addEventListener("click", async () => {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");

  output.textContent = "送信中…";

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: input }]
      }),
    });

    const text = await res.text();
    output.textContent = text;

  } catch (err) {
    output.textContent = "エラー: " + err.message;
  }
});
