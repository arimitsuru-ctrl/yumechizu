// ==========================
// main.js（完成版）
// ==========================

console.log("✅ main.js loaded");

// 現在のセクション
let currentSection = "home";

// ==========================
// 初期化
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded");

  setupNav();
  showSection("home");
});

// ==========================
// フッターナビ設定
// ==========================
function setupNav(){
  const buttons = document.querySelectorAll(".nb");

  if(buttons.length === 0){
    console.log("❌ フッターボタンが見つかりません");
    return;
  }

  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const s = btn.dataset.s;
      console.log("🖱 nav click:", s);
      showSection(s);
    });
  });

  console.log("✅ フッターナビ設定完了");
}

// ==========================
// セクション切替
// ==========================
function showSection(section){
  console.log("➡ showSection:", section);

  currentSection = section;

  // 全部隠す
  document.querySelectorAll(".section").forEach(sec=>{
    sec.style.display = "none";
  });

  // 対象を表示
  const target = document.getElementById("sec-" + section);
  if(target){
    target.style.display = "block";
    console.log("✅ 表示:", "sec-" + section);
  }else{
    console.log("❌ 見つからない:", "sec-" + section);
  }

  // フッターの active 切替
  document.querySelectorAll(".nb").forEach(b=>{
    b.classList.toggle("active", b.dataset.s === section);
  });
}

// ==========================
// AI 呼び出し（あとで使う）
// ==========================
async function sendToAI(text){
  console.log("🤖 sendToAI:", text);

  if(typeof callAI !== "function"){
    alert("AI は Web 版でのみ利用できます");
    return;
  }

  const res = await callAI([{role:"user", content:text}]);

  if(res && res.message){
    renderMessage(res.message, res.choices || []);
  }
}

// ==========================
// AI 表示
// ==========================
function renderMessage(msg, choices){
  const chat = document.getElementById("chat");
  if(!chat) return;

  const div = document.createElement("div");
  div.textContent = msg;
  chat.appendChild(div);

  const c = document.getElementById("choices");
  if(!c) return;

  c.innerHTML = "";
  choices.forEach(t=>{
    const b = document.createElement("button");
    b.textContent = t;
    b.onclick = ()=>sendToAI(t);
    c.appendChild(b);
  });
}
