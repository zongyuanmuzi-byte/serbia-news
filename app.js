const $ = (id) => document.getElementById(id);

function fmtTime(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", { hour12:false });
  }catch{ return iso; }
}

function normalize(s){ return (s||"").toString().toLowerCase(); }

async function loadNews(){
  // 防缓存：加时间戳
  const url = `./news.json?t=${Date.now()}`;
  const res = await fetch(url, { cache:"no-store" });
  if(!res.ok) throw new Error(`加载失败：${res.status}`);
  return await res.json();
}

function render(data){
  const items = Array.isArray(data.items) ? data.items : [];
  const updated = data.updated_at ? fmtTime(data.updated_at) : "未知";
  $("meta").textContent = `更新时间：${updated} ｜ 共 ${items.length} 条`;
  $("stats").textContent = `提示：n8n 会定时更新 news.json，网页自动读取最新内容。`;

  const q = normalize($("q").value);
  const filtered = !q ? items : items.filter(it => {
    const hay = normalize(it.title) + " " + normalize(it.summary) + " " + normalize(it.source);
    return hay.includes(q);
  });

  const list = $("list");
  list.innerHTML = "";
  $("empty").classList.toggle("hidden", filtered.length !== 0);

  for(const it of filtered){
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3><a href="${it.url}" target="_blank" rel="noreferrer">${it.title || "(无标题)"}</a></h3>
      <div class="meta">
        <span class="badge">${it.source || "RSS"}</span>
        <span class="badge">${it.category || "新闻"}</span>
        <span>${it.published_at ? it.published_at : ""}</span>
      </div>
      ${it.summary ? `<p>${it.summary}</p>` : ``}
    `;
    list.appendChild(card);
  }
}

async function main(){
  try{
    const data = await loadNews();
    render(data);
  }catch(e){
    $("meta").textContent = `加载失败：${e.message}`;
  }
}

$("q").addEventListener("input", main);
$("refresh").addEventListener("click", main);
main();
