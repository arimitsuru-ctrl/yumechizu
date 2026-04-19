// 表示を「変更」するだけ
fetch("version.json")
  .then(r => r.json())
  .then(v => {
    document.getElementById("badge").textContent =
      `Hot Update v${v.version}`;
  })
  .catch(() => {
    // オフライン時は何もしない
  });
