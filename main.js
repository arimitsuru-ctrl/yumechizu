/* =========================
   夢の地図 main.js
   ========================= */

/* 状態 */
let messages = [];

/* 言語判定（簡易） */
function L(){
  const lang = (navigator.language || 'ja').slice(0,2);
  return { code: lang };
}

/* AI呼び出し本体 */
async function callAI(messages){
  const l = L();

  const demoChoices = {
    ja:['音楽・アート','スキルアップ','旅行・冒険','健康'],
    en:['Music & Art','Skills','Travel','Health']
  };
  const choices = demoChoices[l.code] || demoChoices.en;

  const systemPrompt = `
You are a Dream Sketch AI.
Help users turn dreams into projects.
Return JSON only.
Format:
{
  "message":"text",
  "choices":["a","b"],
  "project":{
    "name":"...",
    "tasks":["t1","t2"],
    "shopping":["s1","s2"]
  }
}
Language: ${l.code}
`;

  /* Puter待機 */
  if(typeof puter === 'undefined' || !puter.ai){
    await new Promise(r=>{
      let t=0;
      const i=setInterval(()=>{
        t+=200;
        if(typeof puter!=='undefined' && puter.ai){clearInterval(i);r();}
        if(t>3000){clearInterval(i);r();}
      },200);
    });
  }

  /* Puter未使用時のデモ */
  if(typeof puter === 'undefined' || !puter.ai){
    return {
      message:'（デモ）どんな分野に興味がありますか？',
      choices,
      project:null
    };
  }

  const puterMessages = [
    {role:'system',content:systemPrompt},
    ...messages
  ];

  try{
    const res = await puter.ai.chat(puterMessages,{
      model:'meta-llama/llama-3.3-70b-instruct'
    });

    const txt = res?.message?.content || '{}';
    const cleaned = txt.replace(/```json|```/g,'').trim();
    return JSON.parse(cleaned);

  }catch(e){
    return {
      message:'⚠️ AI接続エラー。デモで続行します。',
      choices,
      project:null
    };
  }
}

/* AI送信 */
async function onSendAI(textFromChoice){
  const input = document.getElementById("userInput");
  const text = textFromChoice || input.value.trim();
  if(!text) return;

  input.value = '';

  messages.push({role:'user',content:text});
  renderUser(text);

  const res = await callAI(messages);

  messages.push({role:'assistant',content:res.message});
  renderAI(res);

  if(res.project){
    renderProject(res.project);
  }
}

/* 表示系 */
function renderUser(text){
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.textContent = '🧑 ' + text;
  chat.appendChild(div);
}

function renderAI(res){
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.textContent = '🤖 ' + res.message;
  chat.appendChild(div);

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = '';
  (res.choices || []).forEach(c=>{
    const b = document.createElement("button");
    b.textContent = c;
    b.style.margin = '4px';
    b.onclick = ()=>onSendAI(c);
    choicesDiv.appendChild(b);
  });
}

function renderProject(p){
  /* タスク */
  const taskSec = document.getElementById("sec-tasks");
  taskSec.innerHTML = '<h2>タスク</h2><ul>' +
    p.tasks.map(t=>`<li>${t}</li>`).join('') +
    '</ul>';

  /* 買い物 */
  const shopSec = document.getElementById("sec-shop");
  shopSec.innerHTML = '<h2>買い物</h2><ul>' +
    p.shopping.map(s=>`<li>${s}</li>`).join('') +
    '</ul>';
}

/* 初期メッセージ */
window.addEventListener('load',()=>{
  renderAI({
    message:'こんにちは。どんな夢や、やってみたいことがありますか？',
    choices:['音楽','仕事','旅行','健康'],
    project:null
  });
});
