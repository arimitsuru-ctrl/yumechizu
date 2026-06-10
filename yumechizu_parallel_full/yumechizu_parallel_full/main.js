
const screens = document.getElementById("screens");

function go(i) {
  screens.style.transform = `translateX(${-100 * i}vw)`;
}

document.querySelectorAll(".color").forEach(el => {
  el.addEventListener("click", () => {
    const c = getComputedStyle(el).getPropertyValue("--c");
    document.documentElement.style.setProperty("--wallpaper", c);
    localStorage.setItem("wallpaper", c);
  });
});

const saved = localStorage.getItem("wallpaper");
if (saved) {
  document.documentElement.style.setProperty("--wallpaper", saved);
}
