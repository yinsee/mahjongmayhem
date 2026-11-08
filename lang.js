(function () {
  var root = document.documentElement;
  function pick() {
    var saved = null;
    try { saved = localStorage.getItem("mm-lang"); } catch (e) {}
    if (saved === "en" || saved === "zh") return saved;
    var m = location.hash.match(/^#(en|zh)$/);
    if (m) return m[1];
    return /^zh/i.test(navigator.language || "") ? "zh" : "en";
  }
  function set(l, save) {
    root.classList.remove("lang-en", "lang-zh");
    root.classList.add("lang-" + l);
    root.lang = l === "zh" ? "zh-Hans" : "en";
    var b = document.querySelectorAll(".langs button");
    for (var i = 0; i < b.length; i++) b[i].setAttribute("aria-pressed", b[i].dataset.l === l ? "true" : "false");
    if (save) { try { localStorage.setItem("mm-lang", l); } catch (e) {} }
  }
  set(pick(), false);
  document.addEventListener("DOMContentLoaded", function () {
    set(root.classList.contains("lang-zh") ? "zh" : "en", false);
    var b = document.querySelectorAll(".langs button");
    for (var i = 0; i < b.length; i++) b[i].addEventListener("click", function () { set(this.dataset.l, true); });
  });
})();
