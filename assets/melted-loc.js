/* Melted — location & radius preference (header dropdown).
   Static-site implementation: the preference lives in localStorage ("melted_loc" =
   {q, label, lat, lng, radius}), geocoding is client-side — the local ZIP table via
   window.MELTED when available, OpenStreetMap Nominatim for street addresses and
   cities. Distances are straight-line miles (no routing backend on GitHub Pages).
   Pages re-filter by listening for the "melted:loc" event on document.
   Mounted into every element carrying [data-loc-slot]; loaded by melted.js on
   shared-header pages and by an explicit <script> tag on index.html. */
(function () {
  "use strict";
  var KEY = "melted_loc";
  var ZIPKEY = "melted_zip";
  var DEFAULT_RADIUS = 25;

  /* ---------- preference ---------- */
  function getPref() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY) || "null");
      return (p && typeof p.lat === "number" && typeof p.lng === "number" && p.radius) ? p : null;
    } catch (e) { return null; }
  }
  function savePref(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("melted:loc", { detail: p }));
  }
  function clearPref() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    document.dispatchEvent(new CustomEvent("melted:loc", { detail: null }));
  }

  function haversine(a, b, c, d) {
    var R = 3958.8, t = Math.PI / 180, dLat = (c - a) * t, dLng = (d - b) * t;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a * t) * Math.cos(c * t) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  /* ---------- geocoding ---------- */
  function zipLocal(z) {
    var M = window.MELTED;
    if (M && M.zipCoords) {
      var c = M.zipCoords(z);
      if (c) return { lat: c[0], lng: c[1], label: "ZIP " + z };
    }
    return null;
  }
  function geocode(q) {
    var zip = /^\d{5}$/.test(q) ? q : null;
    if (zip) {
      var loc = zipLocal(zip);
      if (loc) return Promise.resolve(loc);
    }
    var url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=" +
              encodeURIComponent(q);
    return fetch(url, { headers: { "Accept": "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("geocode " + r.status); return r.json(); })
      .then(function (rows) {
        if (!rows || !rows.length) return null;
        var label = zip ? ("ZIP " + zip) : (q.length <= 34 ? q : q.slice(0, 32) + "…");
        return { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon), label: label };
      });
  }

  /* Keep the legacy ZIP channel in sync so the locator / order modules follow along. */
  function syncZip(z) {
    var M = window.MELTED;
    if (M && M.setZip) { M.setZip(z); return; }
    try { localStorage.setItem(ZIPKEY, z); } catch (e) {}
    document.dispatchEvent(new CustomEvent("melted:zip", { detail: z }));
  }

  /* ---------- helpers for pages ---------- */
  function storesWithin(pref, stores) {
    pref = pref || getPref();
    if (!pref) return null;
    var M = window.MELTED;
    stores = stores || (M && M.STORES) || [];
    return stores
      .map(function (s) { return Object.assign({ dist: haversine(pref.lat, pref.lng, s.lat, s.lng) }, s); })
      .sort(function (a, b) { return a.dist - b.dist; });
  }

  /* ---------- styles ---------- */
  var CSS = "" +
    ".mloc{position:relative;display:inline-block}" +
    ".mloc-btn{font-family:'Oswald',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;display:inline-flex;align-items:center;gap:7px;border:1px solid currentColor;padding:0 12px;height:34px;color:currentColor;background:transparent;cursor:pointer;max-width:230px;white-space:nowrap}" +
    "@media (max-width:767px){.mloc-btn{height:40px;max-width:150px;padding:0 10px;gap:6px}}" +
    ".mloc-btn svg{flex-shrink:0;opacity:.7}" +
    ".mloc-lab{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".mloc-panel{position:absolute;top:calc(100% + 12px);right:0;width:302px;max-width:calc(100vw - 40px);background:#fff;color:#0a0a0a;border:1px solid #0a0a0a;box-shadow:0 18px 40px rgba(0,0,0,.18);padding:20px;z-index:95;text-align:left}" +
    ".mloc-h{font-family:'Oswald',sans-serif;font-size:12px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;margin:0 0 12px;color:#0a0a0a}" +
    ".mloc-in{width:100%;border:1px solid #d4d4d4;padding:10px 12px;font-family:'EB Garamond',serif;font-size:16px;outline:none;background:#fafafa;color:#0a0a0a;border-radius:0;-webkit-appearance:none}" +
    ".mloc-in:focus{border-color:#0a0a0a}" +
    ".mloc-in::placeholder{color:#8a8a8a}" +
    ".mloc-radrow{display:flex;justify-content:space-between;align-items:baseline;margin:16px 0 8px}" +
    ".mloc-radrow label{font-family:'Oswald',sans-serif;font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#555}" +
    ".mloc-radval{font-family:'EB Garamond',serif;font-size:15px;color:#0a0a0a}" +
    ".mloc-rad{-webkit-appearance:none;appearance:none;width:100%;height:2px;background:#e3e3e3;outline:none;margin:6px 0;border-radius:0}" +
    ".mloc-rad::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:#0a0a0a;border:none;border-radius:0;cursor:pointer}" +
    ".mloc-rad::-moz-range-thumb{width:16px;height:16px;background:#0a0a0a;border:none;border-radius:0;cursor:pointer}" +
    ".mloc-rad:focus-visible{outline:2px solid #0a0a0a;outline-offset:4px}" +
    ".mloc-update{font-family:'Oswald',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;width:100%;background:#0a0a0a;color:#fff;border:1px solid #0a0a0a;padding:13px 0;margin-top:16px;cursor:pointer;border-radius:0;transition:background-color .2s}" +
    ".mloc-update:hover{background:#333}" +
    ".mloc-update[disabled]{opacity:.55;cursor:default}" +
    ".mloc-status{font-family:'EB Garamond',serif;font-size:14px;line-height:1.45;margin:10px 0 0;color:#555}" +
    ".mloc-status.err{color:#c0392b}" +
    ".mloc-foot{display:flex;flex-direction:column;gap:6px;margin-top:14px;padding-top:12px;border-top:1px solid #eee}" +
    ".mloc-clear{align-self:flex-start;background:none;border:none;padding:0;font-family:'Oswald',sans-serif;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#555;text-decoration:underline;text-underline-offset:3px;cursor:pointer}" +
    ".mloc-clear:hover{color:#0a0a0a}" +
    ".mloc-foot small{font-family:'EB Garamond',serif;font-size:12px;color:#8a8a8a;line-height:1.4}";

  var PIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var CARET = '<svg viewBox="0 0 10 6" width="9" height="6" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>';

  var slots = [];

  function btnLabel(pref) {
    return pref ? (pref.label + " · " + pref.radius + " mi") : "Set Location";
  }

  function feedback(pref) {
    var M = window.MELTED;
    if (M && M.STORES && M.STORES.length) {
      var ranked = storesWithin(pref, M.STORES);
      var nearest = ranked[0];
      var within = ranked.filter(function (s) { return s.dist <= pref.radius; }).length;
      if (!within) return { text: "Saved — but no dispensaries sit within " + pref.radius + " mi. The nearest is " + nearest.name + " (" + nearest.dist.toFixed(1) + " mi). Try a wider radius.", warn: true };
      return { text: "Saved. " + within + (within === 1 ? " dispensary" : " dispensaries") + " within " + pref.radius + " mi — nearest: " + nearest.name + " (" + nearest.dist.toFixed(1) + " mi).", warn: false };
    }
    return { text: "Location saved.", warn: false };
  }

  function buildSlot(slot) {
    var wrap = document.createElement("div");
    wrap.className = "mloc";
    wrap.innerHTML =
      '<button type="button" class="mloc-btn" aria-haspopup="dialog" aria-expanded="false">' +
        PIN + '<span class="mloc-lab"></span>' + CARET +
      "</button>" +
      '<div class="mloc-panel" role="dialog" aria-label="Set your location" hidden>' +
        '<p class="mloc-h">Enter your location</p>' +
        '<input class="mloc-in" type="text" placeholder="Street address, city, or ZIP" aria-label="Street address, city, or ZIP code" autocomplete="off">' +
        '<div class="mloc-radrow"><label>Search radius</label><span class="mloc-radval"></span></div>' +
        '<input class="mloc-rad" type="range" min="5" max="100" step="5" aria-label="Search radius in miles">' +
        '<button type="button" class="mloc-update">Update</button>' +
        '<p class="mloc-status" role="status" aria-live="polite"></p>' +
        '<div class="mloc-foot">' +
          '<button type="button" class="mloc-clear" hidden>Clear location</button>' +
          "<small>Distances are straight-line. Address search by OpenStreetMap.</small>" +
        "</div>" +
      "</div>";
    slot.appendChild(wrap);

    var btn = wrap.querySelector(".mloc-btn"),
        lab = wrap.querySelector(".mloc-lab"),
        panel = wrap.querySelector(".mloc-panel"),
        input = wrap.querySelector(".mloc-in"),
        rad = wrap.querySelector(".mloc-rad"),
        radval = wrap.querySelector(".mloc-radval"),
        update = wrap.querySelector(".mloc-update"),
        status = wrap.querySelector(".mloc-status"),
        clearBtn = wrap.querySelector(".mloc-clear");

    function refresh() {
      var p = getPref();
      lab.textContent = btnLabel(p);
      clearBtn.hidden = !p;
    }
    function readout() { radval.textContent = rad.value + " miles"; }
    function setStatus(text, err) {
      status.textContent = text || "";
      status.classList.toggle("err", !!err);
    }
    function open() {
      var p = getPref();
      input.value = p ? (p.q || "") : "";
      rad.value = p ? p.radius : DEFAULT_RADIUS;
      readout();
      setStatus("");
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 0);
    }
    function close() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function () { panel.hidden ? open() : close(); });
    document.addEventListener("click", function (e) { if (!panel.hidden && !wrap.contains(e.target)) close(); });
    wrap.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); btn.focus(); } });
    rad.addEventListener("input", readout);

    function submit() {
      var q = input.value.trim();
      var radius = parseInt(rad.value, 10) || DEFAULT_RADIUS;
      var existing = getPref();

      if (!q && existing) {              // radius-only change
        var np = Object.assign({}, existing, { radius: radius });
        savePref(np);
        refresh();
        var fb0 = feedback(np);
        setStatus(fb0.text, fb0.warn);
        return;
      }
      if (!q) { setStatus("Enter a street address, city, or ZIP code.", true); return; }

      update.disabled = true;
      setStatus("Locating…");
      geocode(q).then(function (loc) {
        update.disabled = false;
        if (!loc) { setStatus("We couldn't find that location — try a ZIP code or “City, State”.", true); return; }
        var pref = { q: q, label: loc.label, lat: loc.lat, lng: loc.lng, radius: radius };
        savePref(pref);
        if (/^\d{5}$/.test(q)) syncZip(q);
        refresh();
        var fb = feedback(pref);
        setStatus(fb.text, fb.warn);
      }).catch(function () {
        update.disabled = false;
        setStatus("Location search is unreachable right now — try a 5-digit ZIP code.", true);
      });
    }
    update.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });

    clearBtn.addEventListener("click", function () {
      clearPref();
      input.value = "";
      rad.value = DEFAULT_RADIUS;
      readout();
      refresh();
      setStatus("Location cleared — showing everything.");
    });

    refresh();
    slots.push({ refresh: refresh, open: open });
  }

  /* ---------- boot ---------- */
  function mountAll() {
    var style = document.getElementById("melted-loc-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "melted-loc-style";
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    document.querySelectorAll("[data-loc-slot]").forEach(function (slot) {
      if (!slot.querySelector(".mloc")) buildSlot(slot);
    });
  }

  // Keep button labels current when the pref changes anywhere.
  document.addEventListener("melted:loc", function () {
    slots.forEach(function (s) { s.refresh(); });
  });
  // A ZIP typed elsewhere (product-page order module, locator) re-centers the saved
  // location — same coords channel, radius preserved.
  document.addEventListener("melted:zip", function (e) {
    var z = e.detail || "";
    if (!/^\d{5}$/.test(z)) return;
    var p = getPref();
    if (p && p.q === z) return;                        // our own sync — nothing to do
    var loc = zipLocal(z);
    if (!loc) return;                                  // unknown ZIP — leave the pref alone
    savePref({ q: z, label: loc.label, lat: loc.lat, lng: loc.lng, radius: p ? p.radius : DEFAULT_RADIUS });
  });

  window.MELTED_LOC = {
    KEY: KEY,
    DEFAULT_RADIUS: DEFAULT_RADIUS,
    get: getPref,
    set: savePref,
    clear: clearPref,
    haversine: haversine,
    storesWithin: storesWithin,
    open: function () { if (slots[0]) slots[0].open(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();
})();
