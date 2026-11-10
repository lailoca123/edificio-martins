/* Edifício Martins — comportamento da página
   1) ajusta cada pin incorporado à largura da coluna (o Pinterest entrega larguras fixas)
   2) marca no menu o andar visível
   3) borda da barra superior ao rolar */
(function () {
  document.documentElement.classList.add("js");

  // 1. Pins responsivos -------------------------------------------------
  var pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));
  pins.forEach(function (p) { p.closest(".ref").classList.add("is-waiting"); });

  function fit(pin) {
    var embed = pin.querySelector(":scope > span");
    if (!embed) return false;
    var w = embed.offsetWidth, h = embed.offsetHeight;
    if (!w || !h) return false;
    var s = pin.clientWidth / w;
    var t = "scale(" + s + ")";
    embed.style.transform = t;
    embed.style.setProperty("--t", t);
    pin.style.height = Math.round(h * s) + "px";
    if (!pin.classList.contains("is-ready")) {
      pin.classList.add("is-ready");
      pin.closest(".ref").classList.remove("is-waiting");
    }
    return true;
  }

  var ro = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (en) {
      var pin = en.target.classList.contains("pin") ? en.target : en.target.parentElement;
      fit(pin);
    });
  }) : null;

  function watch(pin) {
    if (pin.dataset.watched) return;
    var embed = pin.querySelector(":scope > span");
    if (!embed) return;
    pin.dataset.watched = "1";
    fit(pin);
    if (ro) { ro.observe(pin); ro.observe(embed); }
  }

  var mo = new MutationObserver(function () { pins.forEach(watch); });
  pins.forEach(function (p) { mo.observe(p, { childList: true }); });
  window.addEventListener("resize", function () { pins.forEach(fit); });

  // Se o Pinterest não carregar (bloqueador, rede), mostra o link de cada referência.
  setTimeout(function () {
    pins.forEach(function (p) {
      if (!p.classList.contains("is-ready")) {
        p.closest(".ref").classList.remove("is-waiting");
        p.classList.add("is-fallback");
      }
    });
  }, 9000);

  // 2. Menu ativo -------------------------------------------------------
  var links = {};
  document.querySelectorAll("[data-nav]").forEach(function (a) { links[a.dataset.nav] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
          a.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".amb").forEach(function (s) { io.observe(s); });
    var hero = document.getElementById("inicio");
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
    }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
  }

  // 3. Barra superior ---------------------------------------------------
  var bar = document.querySelector(".topbar");
  function onScroll() { bar.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
