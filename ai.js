export async function callYumechizuAI(text) {
  try {
    const res = await fetch(
      "https://yumechizu-ai.arimitsuru.workers.dev/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }]
        })
      }
    );

    console.log("🟡 status:", res.status);

    const data = await res.json();

    console.log("🔵 response:", data);

    if (!res.ok) {
      throw new Error(data?.error || "AI request failed");
    }

    return data;

  } catch (err) {
    console.error("❌ AI error:", err);
    return {
      reflection: "通信エラーが発生しました",
      emotion: "error",
      question: "接続を確認してください",
      next_step: "WorkerのCORSと500エラーを修正"
    };
  }
}
