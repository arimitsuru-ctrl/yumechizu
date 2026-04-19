// ==========================
// 状態管理
// ==========================
let currentSection = "home";
let messages = [];

// ==========================
// 初期化
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  showSection("home");
});

// ==========================
// フッターナビ設定
// ==========================
function setupNav(){
  document.querySelectorAll(".nb").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const s = btn.dataset.s;
      showSection(s);
    });
  });
}

// ==========================
// セクション切替
// ==========================
function showSection(section){
  currentSection = section;

  document.querySelectorAll(".section").forEach(sec=>{
    sec.style.display = "none";
  });

  const target = document.getElementById("sec-"+section);
  if(target) target.style.display = "block";

  document.querySelectorAll(".nb").forEach(b=>{
    b.classList.toggle("active", b.dataset.s === section);
  });
}

// ==========================
// AI 呼び出し
// ==========================
async function sendToAI(text){
  messages.push({role:"user", content:text});

  const res = await callAI(messages);

  if(res.message){
    messages.push({role:"assistant", content:res.message});
    renderMessage(res.message, res.choices);
  }
}

// ==========================
// 表示
// ==========================
function renderMessage(msg, choices=[]){
  const box = document.getElementById("chat");
  box.innerHTML += `<div class="ai">${msg}</div>`;

  const c = document.getElementById("choices");
  c.innerHTML = "";
  choices.forEach(t=>{
    const b = document.createElement("button");
    b.textContent = t;
    b.onclick = ()=>sendToAI(t);
    c.appendChild(b);
  });
}
