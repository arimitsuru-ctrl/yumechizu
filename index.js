console.log("✅ Pages index.js loaded");

import { callYumechizuAI } from "./ai.js";

document.getElementById("send").onclick = async () => {
  const text = document.getElementById("input").value;

  const data = await callYumechizuAI(text);

  console.log("🔵 data", data);

  document.getElementById("reflection").textContent =
    data.reflection || "";

  document.getElementById("emotion").textContent =
    data.emotion || "";

  document.getElementById("question").textContent =
    data.question || "";

  document.getElementById("next_step").textContent =
    data.next_step || "";
};
