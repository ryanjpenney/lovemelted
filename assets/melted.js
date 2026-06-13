/* ============================================================
   MELTED — shared site logic
   Header + nav dropdown, persistent ZIP selector (localStorage),
   product catalog, and the store-locator engine.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Dispensary data (Curaleaf — Arizona) ---------- */
  const STORES = [
    { name: "Curaleaf Youngtown",        addr: "11148 N 111th Ave, Youngtown, AZ 85363",        zip: "85363", lat: 33.5942, lng: -112.3023, phone: "(623) 469-1322" },
    { name: "Curaleaf Peoria",           addr: "8157 W Cactus Rd, Peoria, AZ 85381",            zip: "85381", lat: 33.5992, lng: -112.2378, phone: "(623) 412-9100" },
    { name: "Curaleaf Glendale",         addr: "5612 W Glendale Ave, Glendale, AZ 85301",       zip: "85301", lat: 33.5385, lng: -112.1860, phone: "(623) 915-1117" },
    { name: "Curaleaf Phoenix Bell",     addr: "2615 W Bell Rd, Phoenix, AZ 85023",             zip: "85023", lat: 33.6401, lng: -112.1126, phone: "(602) 935-7280" },
    { name: "Curaleaf Scottsdale",       addr: "7235 E 1st Ave, Scottsdale, AZ 85251",          zip: "85251", lat: 33.4942, lng: -111.9261, phone: "(480) 999-3340" },
    { name: "Curaleaf Midtown",          addr: "3955 N 7th Ave, Phoenix, AZ 85013",             zip: "85013", lat: 33.4951, lng: -112.0825, phone: "(602) 633-2007" },
    { name: "Curaleaf Phoenix Airport",  addr: "4133 E Van Buren St, Phoenix, AZ 85008",        zip: "85008", lat: 33.4520, lng: -111.9890, phone: "(602) 254-1300" },
    { name: "Curaleaf Scottsdale Pavilions", addr: "9120 E Talking Stick Way, Scottsdale, AZ 85250", zip: "85250", lat: 33.5290, lng: -111.8880, phone: "(480) 690-2818" },
    { name: "Curaleaf Sedona",           addr: "2155 W State Route 89A, Sedona, AZ 86336",      zip: "86336", lat: 34.8580, lng: -111.8120, phone: "(928) 862-4148" },
    { name: "Curaleaf Gilbert",          addr: "725 N Gilbert Rd, Gilbert, AZ 85234",           zip: "85234", lat: 33.3618, lng: -111.7894, phone: "(480) 999-0667" },
    { name: "Curaleaf Queen Creek",      addr: "21321 E Rittenhouse Rd, Queen Creek, AZ 85142", zip: "85142", lat: 33.2483, lng: -111.6343, phone: "(480) 781-9001" },
    { name: "Curaleaf Phoenix 48th St.", addr: "4659 S 48th St, Phoenix, AZ 85040",             zip: "85040", lat: 33.4099, lng: -111.9836, phone: "(602) 633-3010" },
    { name: "Curaleaf Tucson Oracle",    addr: "4220 N Oracle Rd, Tucson, AZ 85705",            zip: "85705", lat: 32.2790, lng: -110.9742, phone: "(520) 314-9420" }
  ];

  /* ---------- ZIP centroid lookup (AZ + dispensary zips) ----------
     Used to geocode the shopper's entered ZIP for distance ranking. */
  const ZIPS = {
    // Phoenix metro
    "85003":[33.452,-112.078],"85004":[33.451,-112.070],"85006":[33.466,-112.047],
    "85007":[33.448,-112.090],"85008":[33.466,-111.984],"85009":[33.447,-112.123],
    "85013":[33.509,-112.082],"85014":[33.512,-112.055],"85015":[33.508,-112.103],
    "85016":[33.510,-112.030],"85018":[33.496,-111.984],"85020":[33.567,-112.052],
    "85021":[33.561,-112.097],"85022":[33.628,-112.052],"85023":[33.640,-112.113],
    "85024":[33.679,-112.043],"85027":[33.681,-112.108],"85028":[33.582,-111.998],
    "85029":[33.598,-112.108],"85031":[33.495,-112.166],"85032":[33.622,-111.987],
    "85033":[33.493,-112.213],"85034":[33.435,-111.998],"85035":[33.470,-112.193],
    "85037":[33.503,-112.258],"85040":[33.410,-111.983],"85041":[33.391,-112.097],
    "85042":[33.378,-112.038],"85043":[33.428,-112.193],"85044":[33.336,-111.984],
    "85048":[33.305,-111.998],"85050":[33.683,-111.972],"85051":[33.561,-112.140],
    "85053":[33.626,-112.140],"85083":[33.711,-112.135],"85085":[33.736,-112.080],
    // Scottsdale
    "85250":[33.529,-111.888],"85251":[33.494,-111.926],"85254":[33.617,-111.951],
    "85257":[33.466,-111.918],"85258":[33.566,-111.890],"85259":[33.589,-111.806],
    "85260":[33.610,-111.889],"85262":[33.755,-111.806],
    // West valley
    "85301":[33.538,-112.186],"85302":[33.575,-112.187],"85303":[33.538,-112.222],
    "85305":[33.532,-112.262],"85306":[33.611,-112.187],"85308":[33.658,-112.187],
    "85323":[33.426,-112.318],"85335":[33.594,-112.318],"85345":[33.581,-112.237],
    "85351":[33.606,-112.279],"85363":[33.594,-112.302],"85373":[33.665,-112.302],
    "85381":[33.599,-112.238],"85382":[33.652,-112.238],"85383":[33.700,-112.238],
    // East valley
    "85201":[33.430,-111.853],"85202":[33.385,-111.876],"85203":[33.436,-111.799],
    "85204":[33.394,-111.799],"85205":[33.436,-111.715],"85206":[33.394,-111.715],
    "85210":[33.385,-111.823],"85213":[33.467,-111.776],"85224":[33.318,-111.876],
    "85225":[33.318,-111.835],"85226":[33.305,-111.918],"85233":[33.353,-111.812],
    "85234":[33.362,-111.789],"85249":[33.231,-111.812],"85281":[33.425,-111.930],
    "85282":[33.392,-111.929],"85283":[33.367,-111.929],"85284":[33.337,-111.929],
    "85286":[33.276,-111.835],"85295":[33.305,-111.745],"85296":[33.353,-111.745],
    "85297":[33.276,-111.745],"85298":[33.231,-111.745],"85142":[33.248,-111.634],
    "85140":[33.230,-111.585],"85234x":[33.362,-111.789],
    // Northern AZ
    "86001":[35.198,-111.651],"86004":[35.230,-111.560],"86301":[34.580,-112.430],
    "86314":[34.610,-112.330],"86322":[34.620,-111.840],"86326":[34.710,-112.030],
    "86336":[34.870,-111.761],"86351":[34.780,-111.780],
    // Tucson
    "85701":[32.221,-110.969],"85704":[32.336,-110.978],"85705":[32.279,-110.974],
    "85710":[32.213,-110.832],"85712":[32.246,-110.884],"85715":[32.250,-110.823],
    "85718":[32.305,-110.920],"85719":[32.249,-110.945],"85741":[32.345,-111.041],
    "85742":[32.408,-111.041],"85745":[32.236,-111.041],"85750":[32.300,-110.820],
    // Other
    "85120":[33.246,-111.578],"85128":[32.960,-111.530],"85138":[32.960,-111.680],
    "85364":[32.690,-114.640],"86401":[35.190,-114.050],"85635":[31.560,-110.300]
  };

  /* ---------- Product catalog ---------- */
  const PRODUCTS = {
    "live-rosin-gummies": {
      name: "Live Rosin Gummies", price: "$28.00", kind: "product",
      badge: "Fan Favorite", spec: "Live Rosin · 4 Flavors",
      tagline: "Solventless live rosin in four mouthwatering flavors.",
      detail: "Pressed from fresh-frozen flower and nothing else — our live rosin gummies deliver a true full-spectrum, entourage-effect experience. No distillate, no shortcuts. Ten pieces per tin, 10mg each.",
      facts: ["10 pieces · 10mg each", "Solventless live rosin", "Full-spectrum", "Four rotating flavors"],
      gallery: ["assets/melted/gallery/gum_1.jpg","assets/melted/gallery/gum_2.jpg","assets/melted/gallery/gum_3.jpg","assets/melted/gallery/gum_4.jpg"]
    },
    "mini-melt-pre-rolls": {
      name: "Mini Melt Infused Pre-Rolls", price: "$45.00", kind: "product",
      badge: "", spec: "Infused · 5-Pack",
      tagline: "Five mini infused pre-rolls, ready when you are.",
      detail: "Five perfectly portioned pre-rolls, each infused for a slow, even, flower-forward burn. Packed in our signature tin so they travel as well as they smoke.",
      facts: ["5 mini pre-rolls", "Infused with live rosin", "Even, flower-forward burn", "Resealable travel tin"],
      gallery: ["assets/melted/gallery/pr_1.jpg","assets/melted/gallery/pr_2.jpg","assets/melted/gallery/pr_3.jpg","assets/melted/gallery/pr_4.jpg"]
    },
    "tigerstyle-cartridge": {
      name: "Tigerstyle Cartridge", price: "$40.00", kind: "product",
      badge: "", spec: "Full Spectrum · 510 Thread",
      tagline: "A flower-like experience, on the go.",
      detail: "Our Tigerstyle cartridge captures the character of the whole plant in a discreet, draw-activated 510 cart. Pairs with any standard battery for a flower-like experience anywhere.",
      facts: ["1g full-spectrum oil", "510-thread compatible", "No added cutting agents", "Strain-specific terpenes"],
      gallery: ["assets/melted/gallery/ct_1.jpg","assets/melted/gallery/ct_2.jpg","assets/melted/gallery/ct_3.jpg","assets/melted/gallery/ct_4.jpg"]
    },
    "rope-hat": {
      name: "So Melted Rope Hat", price: "$39.99", kind: "merch",
      badge: "New", spec: "One size · Adjustable",
      tagline: "Structured rope-front cap with the Melted tiger mark.",
      detail: "A clean, structured cap with a rope-front detail and the embroidered Melted tiger mark. Adjustable snap closure, one size fits most.",
      facts: ["Structured 5-panel", "Embroidered tiger mark", "Rope-front detail", "Adjustable snap"],
      gallery: ["assets/melted/gallery/rope_1.jpg","assets/melted/gallery/rope_2.jpg","assets/melted/gallery/rope_3.jpg"]
    },
    "tiger-snapback": {
      name: "Tiger Snapback", price: "$35.99", kind: "merch",
      badge: "", spec: "One size · Snapback",
      tagline: "Low-profile snapback with curved brim.",
      detail: "A low-profile black snapback with a curved brim and subtle Melted script. Everyday cap, built to last.",
      facts: ["Low-profile fit", "Curved brim", "Snapback closure", "Embroidered logo"],
      gallery: ["assets/melted/gallery/snap_1.jpg","assets/melted/gallery/snap_2.jpg","assets/melted/gallery/snap_3.jpg"]
    },
    "logo-tank": {
      name: "Logo Tank", price: "$25.99", kind: "merch",
      badge: "", spec: "Unisex · S–XXL",
      tagline: "Soft cropped tank with the dripping Melted logo.",
      detail: "A soft, relaxed cropped tank carrying the dripping Melted logo. Pre-shrunk cotton blend, unisex sizing.",
      facts: ["Cropped fit", "Pre-shrunk cotton blend", "Screen-printed logo", "Sizes S–XXL"],
      gallery: ["assets/melted/gallery/tank_1.jpg","assets/melted/gallery/tank_2.jpg","assets/melted/gallery/tank_3.jpg","assets/melted/gallery/tank_4.jpg"]
    },
    "tiger-bandana": {
      name: "Tiger Bandana", price: "$15.99", kind: "merch",
      badge: "", spec: "22\" × 22\" · Cotton",
      tagline: "All-over tiger-pattern cotton bandana.",
      detail: "A 22-inch cotton bandana in our all-over tiger pattern. Wear it, tie it, fly it.",
      facts: ["22\" × 22\"", "100% cotton", "All-over tiger print", "Hemmed edges"],
      gallery: ["assets/melted/gallery/band_1.jpg","assets/melted/gallery/band_2.jpg"]
    }
  };

  /* ---------- Geo helpers ---------- */
  function haversine(a, b, c, d) {
    const R = 3958.8, t = Math.PI / 180;
    const dLat = (c - a) * t, dLng = (d - b) * t;
    const x = Math.sin(dLat / 2) ** 2 +
              Math.cos(a * t) * Math.cos(c * t) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }
  function zipCoords(zip) {
    if (ZIPS[zip]) return ZIPS[zip];
    // Fallback: nearest known ZIP by numeric proximity within same 3-digit prefix
    const pfx = zip.slice(0, 3), n = parseInt(zip, 10);
    let best = null, bestD = Infinity;
    for (const z in ZIPS) {
      if (z.slice(0, 3) !== pfx) continue;
      const d = Math.abs(parseInt(z, 10) - n);
      if (d < bestD) { bestD = d; best = ZIPS[z]; }
    }
    return best; // null if unknown region
  }
  function nearestStores(zip, limit) {
    const c = zipCoords(zip);
    if (!c) return null;
    return STORES
      .map(s => Object.assign({ dist: haversine(c[0], c[1], s.lat, s.lng) }, s))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit || STORES.length);
  }

  /* ---------- Persistent ZIP (localStorage) ---------- */
  const KEY = "melted_zip";
  function getZip() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function setZip(z) {
    try { localStorage.setItem(KEY, z); } catch (e) {}
    document.querySelectorAll("[data-zip-label]").forEach(updateZipLabel);
    document.dispatchEvent(new CustomEvent("melted:zip", { detail: z }));
  }
  function validZip(z) { return /^\d{5}$/.test(z); }
  function updateZipLabel(el) {
    const z = getZip();
    if (z) {
      const near = nearestStores(z, 1);
      el.querySelector("[data-zip-text]").textContent = z;
      const sub = el.querySelector("[data-zip-store]");
      if (sub) sub.textContent = near ? near[0].name.replace("Curaleaf ", "") : "AZ";
    } else {
      el.querySelector("[data-zip-text]").textContent = "Set ZIP";
      const sub = el.querySelector("[data-zip-store]");
      if (sub) sub.textContent = "Your store";
    }
  }

  /* ---------- Markup: header ---------- */
  function headerHTML() {
    const link = (href, label) => `<a href="${href}" class="hover:opacity-60 transition-opacity">${label}</a>`;
    return `
<div class="relative bg-[#0a0a0a] h-[34px] flex items-center justify-center">
  <p class="oswald text-white text-[11px] font-medium tracking-[0.14em] uppercase">Available at Curaleaf dispensaries across Arizona</p>
</div>
<header class="bg-white sticky top-0 z-40 border-b border-[#ededed]">
  <div class="h-[72px] flex items-center justify-between px-[28px] md:px-[45px]">
    <nav class="oswald hidden md:flex items-center gap-7 text-[13px] font-medium tracking-[0.05em] uppercase text-black flex-1">
      <div class="relative group">
        <a href="#" class="flex items-center gap-1.5 py-[26px]" data-nav-toggle>Products
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
        </a>
        <div class="mega absolute left-0 top-full bg-white border border-[#ededed] shadow-xl w-[640px] p-7 grid grid-cols-3 gap-5 opacity-0 invisible transition-all duration-150">
          ${productMenuCard("live-rosin-gummies")}
          ${productMenuCard("mini-melt-pre-rolls")}
          ${productMenuCard("tigerstyle-cartridge")}
          <div class="col-span-3 border-t border-[#eee] pt-4 flex justify-between items-center">
            <span class="garamond text-[14px] text-[#888] normal-case tracking-normal">Full-spectrum, solventless, Arizona-grown.</span>
            ${link("locations.html", "Where to buy →")}
          </div>
        </div>
      </div>
      ${link("merch.html", "Merch")}
      ${link("locations.html", "Locations")}
      ${link("about.html", "About")}
    </nav>
    <button class="md:hidden oswald text-[13px] uppercase tracking-[0.05em]" data-mobile-toggle aria-label="Menu">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <a href="index.html" class="absolute left-1/2 -translate-x-1/2"><img src="assets/melted/logo_black.png" alt="melted" class="h-[32px]"></a>
    <div class="flex items-center justify-end gap-4 md:gap-5 flex-1 text-black">
      <!-- ZIP selector -->
      <div class="relative" data-zip-root>
        <button class="flex items-center gap-2 border border-[#dcdcdc] hover:border-black transition-colors rounded-full pl-3 pr-3 py-[7px]" data-zip-label data-zip-open aria-haspopup="true">
          <svg class="w-[15px] h-[15px] shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
          <span class="text-left leading-none">
            <span class="oswald block text-[12px] font-medium tracking-[0.04em] uppercase" data-zip-text>Set ZIP</span>
            <span class="oswald block text-[9px] font-light tracking-[0.06em] uppercase text-[#999]" data-zip-store>Your store</span>
          </span>
          <svg class="w-3 h-3 text-[#999]" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="zip-panel absolute right-0 top-full mt-2 w-[300px] bg-white border border-[#e3e3e3] shadow-xl p-5 opacity-0 invisible transition-all z-50">
          <p class="oswald text-[12px] font-medium tracking-[0.08em] uppercase text-black">Your location</p>
          <p class="garamond text-[14px] text-[#777] mt-1 leading-snug">Save your ZIP to see the nearest dispensary and personalize availability across the site.</p>
          <form data-zip-form class="mt-3 flex gap-2">
            <input data-zip-input inputmode="numeric" maxlength="5" placeholder="e.g. 85008" class="oswald flex-1 border border-[#d4d4d4] focus:border-black outline-none px-3 py-2 text-[14px] tracking-[0.05em]">
            <button type="submit" class="oswald bg-black text-white text-[11px] font-medium tracking-[0.08em] uppercase px-4">Save</button>
          </form>
          <p data-zip-msg class="garamond text-[13px] mt-2 min-h-[18px]"></p>
          <div data-zip-result class="mt-1"></div>
          <button type="button" data-zip-clear class="oswald text-[10px] tracking-[0.08em] uppercase text-[#aaa] hover:text-black mt-2 hidden">Clear location</button>
        </div>
      </div>
      <a href="locations.html" aria-label="Search"><svg class="w-[21px] h-[21px]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></a>
      <a href="about.html#contact" aria-label="Account"><svg class="w-[21px] h-[21px]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg></a>
      <a href="merch.html" class="relative" aria-label="Cart">
        <svg class="w-[21px] h-[21px]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>
        <span class="absolute -bottom-1 -right-1.5 bg-white text-black text-[10px] oswald font-medium w-4 h-4 rounded-full border border-black flex items-center justify-center leading-none">0</span>
      </a>
    </div>
  </div>
  <!-- Mobile menu -->
  <div class="md:hidden hidden border-t border-[#ededed] px-7 py-5 oswald text-[14px] uppercase tracking-[0.05em] space-y-4" data-mobile-menu>
    <a href="locations.html" class="block">Products</a>
    <a href="merch.html" class="block">Merch</a>
    <a href="locations.html" class="block">Locations</a>
    <a href="about.html" class="block">About</a>
  </div>
</header>`;
  }

  function productMenuCard(id) {
    const p = PRODUCTS[id];
    return `<a href="product.html?id=${id}" class="group/card block">
      <div class="bg-[#f6f6f4] aspect-square overflow-hidden"><img src="${p.gallery[0]}" alt="${p.name}" class="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"></div>
      <p class="oswald text-[12px] font-medium tracking-[0.03em] uppercase text-black mt-2 normal-case">${p.name}</p>
      <p class="garamond text-[13px] text-[#999] normal-case tracking-normal">${p.spec}</p>
    </a>`;
  }

  /* ---------- Markup: footer ---------- */
  function footerHTML() {
    const li = (href, label) => `<li><a href="${href}" class="hover:opacity-60 transition-opacity">${label}</a></li>`;
    return `
<footer class="bg-black text-white px-[28px] md:px-[45px] pt-[64px] pb-[70px] mt-[84px]">
  <div class="flex flex-col md:flex-row">
    <div class="md:w-[385px]">
      <form data-news-form class="flex items-end justify-between border-b border-white pb-[14px] mt-[16px]">
        <input type="email" required placeholder="Your email" class="caslon bg-transparent text-[20px] text-white placeholder-[#9b9b9b] outline-none flex-1">
        <button class="caslon text-[16px] tracking-[0.18em] text-white hover:opacity-60">SUBSCRIBE</button>
      </form>
      <p data-news-msg class="garamond text-[14px] text-[#9fce9f] mt-2 min-h-[18px]"></p>
      <div class="flex items-center gap-4 mt-[40px]">
        <a href="https://www.instagram.com/meltedusa" target="_blank" rel="noopener" aria-label="Instagram" class="hover:opacity-60"><svg class="w-[17px] h-[17px] text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.39A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.39 2.13a5.9 5.9 0 0 0 2.13 1.39c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.39 5.9 5.9 0 0 0 1.39-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.39-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"/></svg></a>
        <a href="https://www.linkedin.com/company/meltedusa" target="_blank" rel="noopener" aria-label="LinkedIn" class="hover:opacity-60"><svg class="w-[17px] h-[17px] text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"/></svg></a>
      </div>
    </div>
    <div class="md:ml-[125px] mt-10 md:mt-0">
      <h4 class="oswald text-[12px] font-medium tracking-[0.05em] uppercase text-white">Company</h4>
      <ul class="oswald text-[16px] font-light uppercase text-white mt-[24px] space-y-[21px]">
        ${li("about.html","About Us")}${li("about.html#join","Join Melted")}${li("events.html","Events &amp; Happenings")}${li("faqs.html","FAQs")}${li("about.html#contact","Contact")}
      </ul>
    </div>
    <div class="md:ml-[91px] mt-10 md:mt-0">
      <h4 class="oswald text-[12px] font-medium tracking-[0.05em] uppercase text-white">Explore</h4>
      <ul class="oswald text-[16px] font-light uppercase text-white mt-[24px] space-y-[21px]">
        ${li("locations.html","Products")}${li("locations.html","Locations")}${li("merch.html","Merch")}${li("https://www.instagram.com/meltedusa","@meltedusa")}
      </ul>
    </div>
  </div>
  <div class="caslon text-[17px] text-[#d6d6d6] leading-[1.5] mt-[39px]">
    <p>Copyright © 2026, <span class="oswald text-[13px] font-light">Melted</span>. All rights reserved.</p>
    <p>The Kind Relief Inc. | #000000049DChRR00713151</p>
    <p><a href="mailto:info@studiobrands.cc" class="hover:opacity-60">info@studiobrands.cc</a></p>
  </div>
  <div class="relative mt-[25px]">
    <img src="assets/melted/mark_white.png" alt="Melted mark" class="absolute right-0 top-[6px] w-[80px] opacity-90 hidden md:block">
    <div class="caslon text-[17px] text-[#d6d6d6] leading-[1.5] max-w-[1080px]">
      <p>For use only by adults twenty-one years of age and older. Keep out of reach of children. Marijuana can impair concentration, coordination, and judgment. Do not operate a vehicle or machinery under the influence of marijuana.</p>
      <p class="mt-[25px]">Melted products are available only at licensed dispensaries in Arizona. Products contain marijuana and have intoxicating effects.</p>
    </div>
  </div>
</footer>`;
  }

  /* ---------- Wiring ---------- */
  function wireHeader() {
    // Products mega-dropdown (hover on desktop, click fallback)
    const grp = document.querySelector(".group");
    if (grp) {
      const mega = grp.querySelector(".mega");
      const show = () => { mega.classList.remove("opacity-0","invisible"); };
      const hide = () => { mega.classList.add("opacity-0","invisible"); };
      grp.addEventListener("mouseenter", show);
      grp.addEventListener("mouseleave", hide);
      const tgl = grp.querySelector("[data-nav-toggle]");
      tgl.addEventListener("click", e => { e.preventDefault(); mega.classList.toggle("invisible"); mega.classList.toggle("opacity-0"); });
    }
    // Mobile menu
    const mt = document.querySelector("[data-mobile-toggle]");
    const mm = document.querySelector("[data-mobile-menu]");
    if (mt && mm) mt.addEventListener("click", () => mm.classList.toggle("hidden"));

    // ZIP selector
    const root = document.querySelector("[data-zip-root]");
    if (root) {
      const panel = root.querySelector(".zip-panel");
      const openBtn = root.querySelector("[data-zip-open]");
      const form = root.querySelector("[data-zip-form]");
      const input = root.querySelector("[data-zip-input]");
      const msg = root.querySelector("[data-zip-msg]");
      const result = root.querySelector("[data-zip-result]");
      const clearBtn = root.querySelector("[data-zip-clear]");
      const openP = () => { panel.classList.remove("opacity-0","invisible"); input.value = getZip(); refresh(); input.focus(); };
      const closeP = () => panel.classList.add("opacity-0","invisible");
      openBtn.addEventListener("click", e => { e.stopPropagation(); panel.classList.contains("invisible") ? openP() : closeP(); });
      document.addEventListener("click", e => { if (!root.contains(e.target)) closeP(); });
      function refresh() {
        const z = getZip();
        clearBtn.classList.toggle("hidden", !z);
        if (z && validZip(z)) {
          const near = nearestStores(z, 1);
          if (near) {
            result.innerHTML = `<div class="border-t border-[#eee] mt-2 pt-2">
              <p class="oswald text-[10px] tracking-[0.08em] uppercase text-[#999]">Nearest dispensary</p>
              <p class="garamond text-[15px] text-black mt-0.5">${near[0].name}</p>
              <p class="garamond text-[13px] text-[#777]">${near[0].dist.toFixed(1)} mi · ${near[0].addr}</p>
              <a href="locations.html" class="oswald text-[11px] tracking-[0.06em] uppercase border-b border-black inline-block mt-2">All locations</a>
            </div>`;
          } else { result.innerHTML = ""; }
        } else { result.innerHTML = ""; }
      }
      form.addEventListener("submit", e => {
        e.preventDefault();
        const z = input.value.trim();
        if (!validZip(z)) { msg.textContent = "Enter a 5-digit ZIP code."; msg.className = "garamond text-[13px] mt-2 text-[#c0392b]"; return; }
        if (!zipCoords(z)) { msg.textContent = "We’re Arizona-only for now — try an AZ ZIP."; msg.className = "garamond text-[13px] mt-2 text-[#c0392b]"; return; }
        setZip(z); msg.textContent = "Saved. We’ll show your closest store."; msg.className = "garamond text-[13px] mt-2 text-[#3a7d44]"; refresh();
      });
      clearBtn.addEventListener("click", () => { setZip(""); input.value = ""; msg.textContent = ""; refresh(); });
    }
    document.querySelectorAll("[data-zip-label]").forEach(updateZipLabel);

    // Newsletter (footer)
    const nf = document.querySelector("[data-news-form]");
    if (nf) nf.addEventListener("submit", e => { e.preventDefault(); document.querySelector("[data-news-msg]").textContent = "Thanks — you’re on the list."; nf.reset(); });
  }

  /* ---------- Boot ---------- */
  function mount() {
    const h = document.querySelector("[data-melted-header]");
    if (h) h.innerHTML = headerHTML();
    const f = document.querySelector("[data-melted-footer]");
    if (f) f.innerHTML = footerHTML();
    wireHeader();
  }

  // Expose for page scripts
  window.MELTED = { STORES, PRODUCTS, ZIPS, nearestStores, zipCoords, getZip, setZip, validZip, haversine };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
