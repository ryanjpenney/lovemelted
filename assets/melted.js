/* ============================================================
   MELTED — shared site logic
   Header + nav dropdown, persistent ZIP selector (localStorage),
   product catalog, and the store-locator engine.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Region metadata (add a state here when you expand) ---------- */
  const STATE_NAMES = { AZ: "Arizona", MD: "Maryland", OH: "Ohio" };
  // Markets that are announced but not yet live (shown as "Coming Soon").
  const COMING_SOON = [
    { name: "Columbus", state: "OH", lat: 39.9612, lng: -82.9988 },
    { name: "Cincinnati", state: "OH", lat: 39.1031, lng: -84.5120 },
    { name: "Cleveland", state: "OH", lat: 41.4993, lng: -81.6944 }
  ];

  /* ---------- Dispensary / retail-partner data ----------
     To add a market: give each store a `state` matching a key in STATE_NAMES,
     real lat/lng, and a ZIP that also lives in the ZIPS table below.
     The locator, map, and region filters all scale off this one array. */
  const STORES = [
    // --- Arizona ---
    { name: "Youngtown",        addr: "11148 N 111th Ave, Youngtown, AZ 85363",        zip: "85363", state: "AZ", lat: 33.5942, lng: -112.3023, phone: "(623) 469-1322" },
    { name: "Peoria",           addr: "8157 W Cactus Rd, Peoria, AZ 85381",            zip: "85381", state: "AZ", lat: 33.5992, lng: -112.2378, phone: "(623) 412-9100" },
    { name: "Glendale",         addr: "5612 W Glendale Ave, Glendale, AZ 85301",       zip: "85301", state: "AZ", lat: 33.5385, lng: -112.1860, phone: "(623) 915-1117" },
    { name: "Phoenix Bell",     addr: "2615 W Bell Rd, Phoenix, AZ 85023",             zip: "85023", state: "AZ", lat: 33.6401, lng: -112.1126, phone: "(602) 935-7280" },
    { name: "Scottsdale",       addr: "7235 E 1st Ave, Scottsdale, AZ 85251",          zip: "85251", state: "AZ", lat: 33.4942, lng: -111.9261, phone: "(480) 999-3340" },
    { name: "Midtown",          addr: "3955 N 7th Ave, Phoenix, AZ 85013",             zip: "85013", state: "AZ", lat: 33.4951, lng: -112.0825, phone: "(602) 633-2007" },
    { name: "Phoenix Airport",  addr: "4133 E Van Buren St, Phoenix, AZ 85008",        zip: "85008", state: "AZ", lat: 33.4520, lng: -111.9890, phone: "(602) 254-1300" },
    { name: "Scottsdale Pavilions", addr: "9120 E Talking Stick Way, Scottsdale, AZ 85250", zip: "85250", state: "AZ", lat: 33.5290, lng: -111.8880, phone: "(480) 690-2818" },
    { name: "Sedona",           addr: "2155 W State Route 89A, Sedona, AZ 86336",      zip: "86336", state: "AZ", lat: 34.8580, lng: -111.8120, phone: "(928) 862-4148" },
    { name: "Gilbert",          addr: "725 N Gilbert Rd, Gilbert, AZ 85234",           zip: "85234", state: "AZ", lat: 33.3618, lng: -111.7894, phone: "(480) 999-0667" },
    { name: "Queen Creek",      addr: "21321 E Rittenhouse Rd, Queen Creek, AZ 85142", zip: "85142", state: "AZ", lat: 33.2483, lng: -111.6343, phone: "(480) 781-9001" },
    { name: "Phoenix 48th St.", addr: "4659 S 48th St, Phoenix, AZ 85040",             zip: "85040", state: "AZ", lat: 33.4099, lng: -111.9836, phone: "(602) 633-3010" },
    { name: "Tucson Oracle",    addr: "4220 N Oracle Rd, Tucson, AZ 85705",            zip: "85705", state: "AZ", lat: 32.2790, lng: -110.9742, phone: "(520) 314-9420" },
    // --- Maryland (authorized retail partners; city-level location) ---
    { name: "Columbia Care",                  addr: "Chevy Chase, MD",  zip: "20815", state: "MD", lat: 38.9686, lng: -77.0780, phone: "" },
    { name: "gLeaf Wellness Solutions",       addr: "Rockville, MD",    zip: "20850", state: "MD", lat: 39.0840, lng: -77.1528, phone: "" },
    { name: "gLeaf Wellness / Columbia Care", addr: "Frederick, MD",    zip: "21701", state: "MD", lat: 39.4143, lng: -77.4105, phone: "" },
    { name: "Nirvana Center Maryland",        addr: "Rosedale, MD",     zip: "21237", state: "MD", lat: 39.3271, lng: -76.5094, phone: "" },
    { name: "Jenny's of Maryland",            addr: "Lanham, MD",       zip: "20706", state: "MD", lat: 38.9668, lng: -76.8638, phone: "" },
    { name: "Summit Wellness",                addr: "Catonsville, MD",  zip: "21228", state: "MD", lat: 39.2721, lng: -76.7319, phone: "" },
    { name: "Waave Cannabis",                 addr: "Greenbelt, MD",    zip: "20770", state: "MD", lat: 39.0046, lng: -76.8755, phone: "" },
    { name: "Elevated Dispo",                 addr: "Salisbury, MD",    zip: "21801", state: "MD", lat: 38.3607, lng: -75.5994, phone: "" },
    { name: "Kent Reserve",                   addr: "Millington, MD",   zip: "21651", state: "MD", lat: 39.2590, lng: -75.8438, phone: "" },
    { name: "Chesapeake Apothecary",          addr: "White Plains, MD", zip: "20695", state: "MD", lat: 38.5893, lng: -76.9783, phone: "" },
    { name: "Chesacanna",                     addr: "Cockeysville, MD", zip: "21030", state: "MD", lat: 39.4812, lng: -76.6433, phone: "" },
    { name: "Coastal Cure",                   addr: "Delmar, MD",       zip: "21875", state: "MD", lat: 38.4563, lng: -75.5780, phone: "" },
    { name: "Greenwave",                      addr: "Solomons, MD",     zip: "20688", state: "MD", lat: 38.3193, lng: -76.4563, phone: "" },
    { name: "Bloom",                          addr: "Germantown, MD",   zip: "20874", state: "MD", lat: 39.1732, lng: -77.2716, phone: "" },
    { name: "Hi Tides",                       addr: "Ocean City, MD",   zip: "21842", state: "MD", lat: 38.3365, lng: -75.0849, phone: "" },
    { name: "ReLeaf Shop",                    addr: "Baltimore, MD",    zip: "21201", state: "MD", lat: 39.2904, lng: -76.6122, phone: "" }
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
    "85364":[32.690,-114.640],"86401":[35.190,-114.050],"85635":[31.560,-110.300],
    // Maryland (DC metro + Baltimore corridor)
    "20886":[39.179,-77.203],"20878":[39.116,-77.270],"20877":[39.140,-77.190],
    "20850":[39.085,-77.155],"20852":[39.050,-77.120],"20906":[39.085,-77.050],
    "20910":[38.995,-77.035],"20770":[39.005,-76.880],"20740":[38.990,-76.930],
    "20783":[38.995,-76.965],"20772":[38.815,-76.760],"20774":[38.880,-76.810],
    "21136":[39.469,-76.828],"21208":[39.390,-76.720],"21215":[39.350,-76.680],
    "21201":[39.295,-76.620],"21230":[39.270,-76.610],"21042":[39.265,-76.910],
    "21044":[39.205,-76.880],"21045":[39.204,-76.812],"21046":[39.170,-76.840],
    "21704":[39.359,-77.408],"21703":[39.395,-77.450],"21701":[39.414,-77.411],
    "21702":[39.470,-77.430],"21401":[38.975,-76.500],"21740":[39.640,-77.720],
    // Maryland retail-partner cities
    "20815":[38.969,-77.078],"21237":[39.327,-76.509],"20706":[38.967,-76.864],
    "21228":[39.272,-76.732],"21801":[38.361,-75.599],"21651":[39.259,-75.844],
    "20695":[38.589,-76.978],"21030":[39.481,-76.643],"21875":[38.456,-75.578],
    "20688":[38.319,-76.456],"20874":[39.173,-77.272],"21842":[38.337,-75.085]
  };

  /* ---------- Product catalog ---------- */
  const PRODUCTS = {
    "live-resin-gummies": {
      name: "Live Resin Gummies", price: "$28.00", kind: "product",
      badge: "Fan Favorite", spec: "Live Resin · 4 Flavors",
      tagline: "Bold, fruit-forward live resin gummies.",
      detail: "Full-flavored live resin gummies in our black-and-white tin. Ten pieces per tin, 10mg each — even, dependable, and made to taste like the real thing.",
      facts: ["10 pieces · 10mg each", "Live resin", "Even, reliable dose", "Four fruit flavors"],
      flavors: ["Blood Orange", "Green Apple", "Guava", "Wildberry"],
      gallery: ["assets/melted/gallery/live_resin.jpg"]
    },
    "mini-melt-pre-rolls": {
      name: "Mini Melt Infused Pre-Rolls", price: "$45.00", kind: "product",
      badge: "", spec: "Infused · 5-Pack",
      tagline: "Five mini infused pre-rolls, ready when you are.",
      detail: "Five perfectly portioned pre-rolls, each infused for a slow, even, flower-forward burn. Packed in our signature tin so they travel as well as they smoke.",
      facts: ["5 mini pre-rolls", "Infused with live rosin", "Even, flower-forward burn", "Resealable travel tin"],
      gallery: ["assets/melted/gallery/pr_3.jpg","assets/melted/gallery/pr_1.jpg","assets/melted/gallery/pr_2.jpg"]
    },
    "live-rosin-gummies": {
      name: "Live Rosin Gummies", price: "$28.00", kind: "product",
      badge: "", spec: "Live Rosin · 4 Flavors",
      tagline: "Rich, full-flavored live rosin gummies.",
      detail: "Our flagship, pressed from fresh-frozen flower for a rich, full-flavored experience. Ten pieces per tin, 10mg each. No distillate, no shortcuts.",
      facts: ["10 pieces · 10mg each", "Pressed live rosin", "Rich, full-flavored", "Four dessert-inspired flavors"],
      flavors: ["Blue Razzberry", "Coconut Chiffon", "Pineapple Upsidedown", "Strawberry Rose"],
      gallery: ["assets/melted/gallery/live-rosin-gummy.jpg","assets/melted/gallery/live-rosin-secondary.jpg"]
    },
    "tigerstyle-cartridge": {
      name: "Tiger Style Cartridge", price: "$40.00", kind: "product",
      badge: "", spec: "510 Thread · 1g",
      tagline: "A rich, flower-like experience, on the go.",
      detail: "Our Tiger Style cartridge captures the rich character of the plant in a discreet, draw-activated 510 cart. Pairs with any standard battery for a flower-like experience anywhere.",
      facts: ["1g premium oil", "510-thread compatible", "No added cutting agents", "Strain-specific terpenes"],
      gallery: ["assets/melted/gallery/ct_1.jpg","assets/melted/gallery/ct_2.jpg","assets/melted/gallery/ct_3.jpg"]
    },
    "tiger-style-pre-roll": {
      name: "Tiger Style Pre-Roll", price: "", kind: "product",
      badge: "New", spec: "Infused · 1.5g",
      tagline: "An infused pre-roll of uncommon proportion.",
      detail: "Tiger Style is our most considered pre-roll — 1.5 grams of top-tier flower, infused with premium concentrate and finished in a tobacco-free organic hemp wrap. Rolled to burn slow and even, and presented in a glass tube inside the signature tiger canister.",
      facts: ["1.5g top-tier flower", "Infused with premium concentrate", "Tobacco-free organic hemp wrap", "Glass tube in the tiger canister"],
      gallery: ["assets/melted/gallery/tsp_1.jpg","assets/melted/gallery/tsp_2.jpg","assets/melted/gallery/tsp_3.jpg"]
    },
    "tiger-style-thca-diamonds": {
      name: "Tiger Style THCa Diamonds", price: "", kind: "product",
      badge: "New", spec: "Concentrate · 1g",
      tagline: "Crystalline THCa, refined to its purest form.",
      detail: "Our most potent expression of the plant. Each batch of Tiger Style THCa Diamonds is grown slowly from premium extract into clear, faceted crystals — exceptional purity, remarkable strength, and a clean, true finish. Presented in glass inside the tiger keepsake box.",
      facts: ["1g crystalline THCa", "Exceptional purity and potency", "Grown slowly from premium extract", "Glass jar in the tiger keepsake box"],
      gallery: ["assets/melted/gallery/tsd_1.jpg","assets/melted/gallery/tsd_2.jpg"]
    },
    "bill-hat": {
      name: "So Melted Branded Bill Hat", price: "$39.99", kind: "merch", soldout: true,
      badge: "", spec: "One size · Adjustable",
      tagline: "Structured cap with the branded Melted bill.",
      detail: "A clean, structured cap with the Melted mark across the bill and an adjustable closure. One size fits most.",
      facts: ["Structured fit", "Branded bill", "Embroidered Melted mark", "Adjustable closure"],
      gallery: ["assets/melted/gallery/hat_front.jpg","assets/melted/gallery/rope_1.jpg","assets/melted/gallery/snap_1.jpg","assets/melted/gallery/rope_2.jpg"]
    },
    "logo-tank": {
      name: "Logo Tank", price: "$25.99", kind: "merch", soldout: true,
      badge: "", spec: "Unisex · S–XXL",
      tagline: "Soft cropped tank with the dripping Melted logo.",
      detail: "A soft, relaxed cropped tank carrying the dripping Melted logo. Pre-shrunk cotton blend, unisex sizing.",
      facts: ["Cropped fit", "Pre-shrunk cotton blend", "Screen-printed logo", "Sizes S–XXL"],
      gallery: ["assets/melted/gallery/tank_1.jpg","assets/melted/gallery/tank_2.jpg","assets/melted/gallery/tank_3.jpg","assets/melted/gallery/tank_4.jpg"]
    },
    "bandana": {
      name: "Tiger Bandana", price: "$18.00", kind: "merch", soldout: true,
      badge: "", spec: "One size · 22\" square",
      tagline: "Black-and-white tiger bandana.",
      detail: "A soft cotton bandana in signature Melted black-and-white — the folk-tiger and dripping mark on repeat. Wear it, tie it, fly it.",
      facts: ["100% cotton", "22\" x 22\"", "Screen-printed B&W print", "Tiger & monogram repeat"],
      gallery: ["assets/melted/gallery/band_1.jpg"]
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

  /* ---------- ZIP → US state (by 3-digit prefix) — powers "we're not in <state> yet" messaging ---------- */
  const ZIP_RANGES = [[5,5,"NY"],[6,9,"PR"],[10,27,"MA"],[28,29,"RI"],[30,38,"NH"],[39,49,"ME"],[50,59,"VT"],[60,69,"CT"],[70,89,"NJ"],[100,149,"NY"],[150,196,"PA"],[197,199,"DE"],[200,205,"DC"],[206,219,"MD"],[220,246,"VA"],[247,268,"WV"],[270,289,"NC"],[290,299,"SC"],[300,319,"GA"],[320,349,"FL"],[350,369,"AL"],[370,385,"TN"],[386,397,"MS"],[398,399,"GA"],[400,427,"KY"],[430,459,"OH"],[460,479,"IN"],[480,499,"MI"],[500,528,"IA"],[530,549,"WI"],[550,567,"MN"],[570,577,"SD"],[580,588,"ND"],[590,599,"MT"],[600,629,"IL"],[630,658,"MO"],[660,679,"KS"],[680,693,"NE"],[700,714,"LA"],[716,729,"AR"],[730,749,"OK"],[750,799,"TX"],[800,816,"CO"],[820,831,"WY"],[832,838,"ID"],[840,847,"UT"],[850,865,"AZ"],[870,884,"NM"],[889,898,"NV"],[900,961,"CA"],[967,968,"HI"],[970,979,"OR"],[980,994,"WA"],[995,999,"AK"]];
  const US_STATES = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"Washington, D.C.",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",PR:"Puerto Rico"};
  function zipStateAbbr(z){ if(!validZip(z)) return ""; const p=parseInt(z.slice(0,3),10); for(let i=0;i<ZIP_RANGES.length;i++){ if(p>=ZIP_RANGES[i][0]&&p<=ZIP_RANGES[i][1]) return ZIP_RANGES[i][2]; } return ""; }
  function zipStateName(z){ return US_STATES[zipStateAbbr(z)] || ""; }

  /* ---------- Header ZIP feedback: friendly message + a small popover under the input ---------- */
  function hzipMessage(z){
    if(!validZip(z)) return { text:"Please enter a 5-digit ZIP code.", err:true, served:false };
    const ab = zipStateAbbr(z), nm = zipStateName(z);
    if(ab==="AZ"||ab==="MD"){
      const near = nearestStores(z,1);
      return { text:(near&&near[0]) ? ("Nearest store: "+near[0].name+" — "+near[0].dist.toFixed(1)+" mi away.") : ("You're in our area — Melted is in "+nm+"."), err:false, served:true };
    }
    if(ab==="OH") return { text:"Melted is coming soon to Ohio — hang tight, it won't be long!", err:false, served:false };
    if(nm) return { text:"We're not in "+nm+" yet — but hopefully soon!", err:false, served:false };
    return { text:"We couldn't place that ZIP. Melted is in Arizona & Maryland, with Ohio coming soon.", err:true, served:false };
  }
  function hzipPop(form, text, isErr){
    if(!form) return;
    if(!form.style.position) form.style.position = "relative";
    let pop = form.querySelector(".hzip-pop");
    if(!pop){
      pop = document.createElement("div");
      pop.className = "hzip-pop";
      pop.setAttribute("role","status");
      pop.style.cssText = "position:absolute;top:calc(100% + 10px);right:0;width:270px;max-width:78vw;background:#fff;color:#1c1c1c;border:1px solid #e3e3e3;border-left:3px solid #0a0a0a;box-shadow:0 12px 30px rgba(0,0,0,.16);padding:12px 14px;font-family:'EB Garamond',serif;font-size:14px;line-height:1.45;text-align:left;z-index:90;";
      form.appendChild(pop);
    }
    pop.style.borderLeftColor = isErr ? "#c0392b" : "#0a0a0a";
    pop.textContent = text;
    pop.style.display = "block";
    clearTimeout(pop._t);
    pop._t = setTimeout(function(){ pop.style.display = "none"; }, 7000);
  }
  function updateZipLabel(el) {
    const z = getZip();
    if (z) {
      const near = nearestStores(z, 1);
      el.querySelector("[data-zip-text]").textContent = z;
      const sub = el.querySelector("[data-zip-store]");
      if (sub) sub.textContent = near ? near[0].name : "AZ";
    } else {
      el.querySelector("[data-zip-text]").textContent = "Set ZIP";
      const sub = el.querySelector("[data-zip-store]");
      if (sub) sub.textContent = "Your store";
    }
  }

  /* ---------- Markup: header ---------- */
  function headerHTML() {
    const link = (href, label) => `<a href="${href}" class="hover:opacity-60 transition-opacity">${label}</a>`;
    const pin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-[14px] h-[14px] text-[#888] shrink-0"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
    return `
<header class="bg-white sticky top-0 z-50 border-b border-[#ededed]">
  <div class="max-w-[1275px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center h-[72px] px-[28px] md:px-[45px] gap-[16px]">
    <a href="index.html" aria-label="Melted home" class="flex items-center shrink-0 justify-self-start">
      <img src="assets/melted/logo_black.png" alt="Melted" class="h-[32px] md:h-[35px] w-auto">
    </a>
    <nav class="oswald hidden md:flex items-center gap-[28px] lg:gap-[34px] text-[12px] font-medium tracking-[0.16em] uppercase text-black justify-self-center whitespace-nowrap">
      ${link("products.html", "Products")}
      ${link("about.html", "About Us")}
      ${link("merch.html", "Merch")}
      ${link("locations.html", "Locations")}
    </nav>
    <div class="flex items-center gap-[12px] justify-self-end">
      <form data-hzip-form class="hidden sm:flex items-center gap-[7px] border border-[#d4d4d4] focus-within:border-black transition-colors h-[34px] px-[11px]">
        ${pin}
        <input data-hzip inputmode="numeric" maxlength="5" placeholder="ZIP" aria-label="ZIP code" class="oswald w-[44px] text-[12px] tracking-[0.08em] outline-none bg-transparent text-black placeholder:text-[#999]">
      </form>
      <button class="md:hidden oswald text-[12px] tracking-[0.16em] uppercase text-black" data-mobile-toggle aria-label="Menu">Menu</button>
    </div>
  </div>
  <div class="md:hidden hidden bg-white border-t border-[#ededed] px-[28px] py-[22px] text-black" data-mobile-menu>
    <form data-hzip-form class="flex sm:hidden items-center gap-[7px] border border-[#d4d4d4] focus-within:border-black transition-colors h-[40px] px-[12px] mb-[20px] max-w-[220px]">
      ${pin}
      <input data-hzip inputmode="numeric" maxlength="5" placeholder="ZIP code" aria-label="ZIP code" class="oswald flex-1 text-[13px] tracking-[0.06em] outline-none bg-transparent text-black placeholder:text-[#999]">
    </form>
    <div class="oswald text-[14px] uppercase tracking-[0.16em] space-y-[18px]">
      <a href="products.html" class="block">Products</a>
      <a href="about.html" class="block">About Us</a>
      <a href="merch.html" class="block">Merch</a>
      <a href="locations.html" class="block">Locations</a>
    </div>
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
      <p data-news-msg class="garamond text-[14px] text-[#d6d6d6] mt-2 min-h-[18px]"></p>
      <div class="flex items-center gap-4 mt-[40px]">
        <a href="https://www.instagram.com/meltedusa" target="_blank" rel="noopener" aria-label="Instagram" class="hover:opacity-60"><svg class="w-[17px] h-[17px] text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.39A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.39 2.13a5.9 5.9 0 0 0 2.13 1.39c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.39 5.9 5.9 0 0 0 1.39-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.39-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"/></svg></a>
        <a href="https://www.linkedin.com/company/meltedusa" target="_blank" rel="noopener" aria-label="LinkedIn" class="hover:opacity-60"><svg class="w-[17px] h-[17px] text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"/></svg></a>
      </div>
    </div>
    <div class="md:ml-[125px] mt-10 md:mt-0">
      <h4 class="oswald text-[12px] font-medium tracking-[0.05em] uppercase text-white">Company</h4>
      <ul class="oswald text-[16px] font-light uppercase text-white mt-[24px] space-y-[21px]">
        ${li("about.html","About Us")}${li("about.html#join","Join Melted")}${li("events.html","Events &amp; Happenings")}${li("faqs.html","FAQs")}
      </ul>
    </div>
    <div class="md:ml-[91px] mt-10 md:mt-0">
      <h4 class="oswald text-[12px] font-medium tracking-[0.05em] uppercase text-white">Explore</h4>
      <ul class="oswald text-[16px] font-light uppercase text-white mt-[24px] space-y-[21px]">
        ${li("products.html","Products")}${li("locations.html","Locations")}${li("merch.html","Merch")}${li("https://www.instagram.com/meltedusa","@meltedusa")}
      </ul>
    </div>
  </div>
  <div class="mt-[64px] mx-[-28px] md:mx-[-45px]">
    <img src="assets/melted/tiger_style_cropped.jpg" alt="Tiger Style" class="block w-full h-auto select-none" loading="lazy">
  </div>
  <div class="caslon text-[12px] text-[#d6d6d6] leading-[1.5] mt-[39px]">
    <p>Copyright © 2026, <span class="oswald text-[12px] font-light">Melted</span>. All rights reserved.</p>
  </div>
  <div class="relative mt-[25px]">
    <img src="assets/melted/mark_white.png" alt="Melted mark" class="absolute right-0 top-[6px] w-[80px] opacity-90 hidden md:block">
    <div class="caslon text-[11px] text-[#d6d6d6] leading-[1.5] max-w-[1080px]">
      <p>For use only by adults twenty-one years of age and older. Keep out of reach of children. Marijuana can impair concentration, coordination, and judgment. Do not operate a vehicle or machinery under the influence of marijuana.</p>
      <p class="mt-[8px]">Melted products are sold through licensed dispensaries in Arizona and Maryland, with Ohio coming soon. Products contain marijuana and have intoxicating effects.</p>
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
      // Clicking "Products" navigates to the dedicated page; hover reveals the menu.
    }
    // Mobile menu
    const mt = document.querySelector("[data-mobile-toggle]");
    const mm = document.querySelector("[data-mobile-menu]");
    if (mt && mm) mt.addEventListener("click", () => mm.classList.toggle("hidden"));

    // Header ZIP input(s) ↔ store locator — synced via setZip() + the "melted:zip" event
    const zipInputs = document.querySelectorAll("[data-hzip]");
    if (zipInputs.length) {
      const saved = getZip();
      if (saved) zipInputs.forEach(inp => { inp.value = saved; });
      document.querySelectorAll("[data-hzip-form]").forEach(f => f.addEventListener("submit", e => {
        e.preventDefault();
        const z = (f.querySelector("[data-hzip]").value || "").trim();
        const m = hzipMessage(z);
        if (m.served) setZip(z);             // only save a ZIP we actually serve (this also syncs the locator)
        hzipPop(f, m.text, m.err);
      }));
      document.addEventListener("melted:zip", e => {
        const z = e.detail || "";
        zipInputs.forEach(inp => { if (inp.value !== z) inp.value = z; });
      });
    }

    // Newsletter (footer)
    const nf = document.querySelector("[data-news-form]");
    if (nf) nf.addEventListener("submit", e => { e.preventDefault(); document.querySelector("[data-news-msg]").textContent = "Thanks — you’re on the list."; nf.reset(); });
  }

  /* custom interactive cursor removed — using the native cursor */

  /* ---------- Age gate + tiger intro ---------- */
  const AGE_KEY = "melted_age_ok";
  const GATE_CSS = `
#m-gate, #m-intro{ position:fixed; inset:0; z-index:2147483600; background:#0a0a0a; display:flex; align-items:center; justify-content:center; }
#m-gate{ text-align:center; padding:28px; }
#m-gate .g-inner{ max-width:480px; animation:m-fade .5s ease both; }
#m-gate .g-logo{ height:38px; margin:0 auto 38px; display:block; }
#m-gate h2{ font-family:'Libre Caslon Text',serif; color:#fff; font-size:40px; line-height:1.12; margin:0; }
#m-gate .g-sub{ font-family:'EB Garamond',serif; color:#bdbdbd; font-size:18px; margin:16px 0 0; }
#m-gate .g-btns{ display:flex; gap:14px; justify-content:center; margin-top:34px; }
#m-gate button{ font-family:'Oswald',sans-serif; font-size:13px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; padding:16px 38px; cursor:pointer; transition:background-color .2s ease, color .2s ease, border-color .2s ease; }
#m-gate .g-yes{ background:#fff; color:#000; border:1px solid #fff; }
#m-gate .g-yes:hover{ background:#1c1c1c; color:#fff; border-color:#1c1c1c; }
#m-gate .g-no{ background:transparent; color:#fff; border:1px solid #5a5a5a; }
#m-gate .g-no:hover{ border-color:#fff; }
#m-gate .g-legal{ font-family:'EB Garamond',serif; color:#666; font-size:13px; margin:30px auto 0; max-width:380px; line-height:1.5; }
#m-gate .g-deny{ display:none; }
#m-gate.denied .g-ask{ display:none; }
#m-gate.denied .g-deny{ display:block; animation:m-fade .4s ease both; }
#m-intro{ overflow:hidden; }
#m-intro.fade{ opacity:0; transition:opacity .5s ease; }
#m-intro .t-glow{ position:absolute; width:60vmin; height:60vmin; border-radius:50%;
  background:radial-gradient(circle, rgba(255,255,255,.10), rgba(10,10,10,0) 70%); animation:m-glow 2.1s ease both; }
#m-intro .t-tiger{ width:min(46vw,380px); filter:drop-shadow(0 0 34px rgba(255,255,255,.18));
  animation:m-tiger 2.1s cubic-bezier(.55,0,.75,1) both; }
@keyframes m-tiger{ 0%{transform:scale(.26); opacity:0;} 16%{opacity:1;} 74%{opacity:1;} 100%{transform:scale(3); opacity:0;} }
@keyframes m-glow{ 0%{transform:scale(.4); opacity:0;} 40%{opacity:1;} 100%{transform:scale(2.4); opacity:0;} }
@keyframes m-fade{ from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:translateY(0);} }
@media (prefers-reduced-motion: reduce){ #m-intro .t-tiger,#m-intro .t-glow{ animation-duration:.5s; } }`;

  function lockScroll(on) { document.documentElement.style.overflow = on ? "hidden" : ""; }

  function reveal() {
    document.documentElement.removeAttribute("data-gate");
    document.documentElement.style.background = "";
    lockScroll(false);
  }

  function playIntro() {
    const intro = document.createElement("div");
    intro.id = "m-intro";
    intro.innerHTML = '<div class="t-glow"></div><img class="t-tiger" src="assets/melted/tiger_white.png" alt="">';
    document.documentElement.appendChild(intro);
    let dur = 2100;
    try { if (matchMedia("(prefers-reduced-motion: reduce)").matches) dur = 600; } catch (e) {}
    setTimeout(() => {
      reveal();                       // unhide the site behind the intro
      intro.classList.add("fade");
      setTimeout(() => intro.remove(), 520);
    }, dur);
  }

  function initAgeGate() {
    let ok = false;
    try { ok = localStorage.getItem(AGE_KEY) === "1"; } catch (e) {}
    if (ok) { reveal(); return; }     // returning verified visitor — straight in

    const gate = document.createElement("div");
    gate.id = "m-gate";
    gate.innerHTML = `
      <div class="g-inner">
        <div class="g-ask">
          <img class="g-logo" src="assets/melted/logo_white.png" alt="Melted">
          <h2>Are you 21 years<br>or older?</h2>
          <p class="g-sub">You must be of legal age to enter Melted.</p>
          <div class="g-btns">
            <button type="button" class="g-yes">Yes, I'm 21+</button>
            <button type="button" class="g-no">No</button>
          </div>
          <p class="g-legal">By entering, you agree you are of legal age to view and purchase cannabis products in your state. For use only by adults 21+.</p>
        </div>
        <div class="g-deny">
          <img class="g-logo" src="assets/melted/logo_white.png" alt="Melted">
          <h2>Come back<br>another time.</h2>
          <p class="g-sub">You must be 21 or older to enter this site.</p>
          <p class="g-legal">If you believe you reached this message in error, refresh the page and try again.</p>
        </div>
      </div>`;
    document.documentElement.appendChild(gate);
    lockScroll(true);
    gate.querySelector(".g-yes").addEventListener("click", () => {
      try { localStorage.setItem(AGE_KEY, "1"); } catch (e) {}
      gate.remove();
      playIntro();
    });
    gate.querySelector(".g-no").addEventListener("click", () => gate.classList.add("denied"));
  }

  /* ============================================================
     AUTH + ONBOARDING
     Front-end is fully functional in "demo mode" (no apiBase set):
     it captures email/phone + consent and persists a local session.
     Set AUTH_CONFIG.apiBase + client IDs to connect a real backend
     (OAuth verification + Mailchimp/Klaviyo + Twilio/Attentive).
     Secret keys must live on the backend, never here. See INTEGRATION.md.
     ============================================================ */
  const AUTH_CONFIG = {
    apiBase: "",          // e.g. "https://api.lovemelted.com" — empty = demo mode (no network calls)
    googleClientId: "",   // Google OAuth Web client ID (public)
    appleClientId: "",    // Apple Services ID (public)
    endpoints: {
      google: "/auth/google", apple: "/auth/apple",
      phoneStart: "/auth/phone/start", phoneVerify: "/auth/phone/verify",
      subscribeEmail: "/marketing/email/subscribe",  // -> Mailchimp/Klaviyo
      subscribeSms: "/marketing/sms/subscribe"        // -> Twilio/Attentive
    }
  };
  const USER_KEY = "melted_user";
  function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (e) { return null; } }
  function saveUser(u) { try { u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY); } catch (e) {} refreshAccountUI(); }

  function api(path, body) {
    if (!AUTH_CONFIG.apiBase) return Promise.resolve({ demo: true });   // demo mode: no-op
    return fetch(AUTH_CONFIG.apiBase + path, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    }).then(r => r.json());
  }

  // Push contact + consent to marketing platforms (via backend).
  function syncMarketing(u) {
    const jobs = [];
    if (u.email && u.emailOptIn) jobs.push(api(AUTH_CONFIG.endpoints.subscribeEmail,
      { email: u.email, source: "site_signup", consent: true, tags: ["website-signup"] }));
    if (u.phone && u.smsOptIn) jobs.push(api(AUTH_CONFIG.endpoints.subscribeSms,
      { phone: u.phone, source: "site_signup", consent: true, consentText: "Promotional SMS opt-in at lovemelted.com" }));
    return Promise.allSettled(jobs);
  }

  function completeAuth(data) {
    const u = Object.assign({ method: "email", email: "", phone: "", name: "", emailOptIn: false, smsOptIn: false, ts: Date.now() }, data);
    saveUser(u);
    syncMarketing(u);
    closeAuth();
    flash(u.name ? `Welcome, ${u.name.split(" ")[0]}.` : "You're in. Welcome to Melted.");
  }

  function initials(u) {
    if (u.name) return u.name.trim()[0].toUpperCase();
    if (u.email) return u.email.trim()[0].toUpperCase();
    if (u.phone) return "#";
    return "M";
  }

  function refreshAccountUI() {
    const u = getUser();
    document.querySelectorAll("[data-account]").forEach(btn => {
      const icon = btn.querySelector("[data-account-icon]");
      const init = btn.querySelector("[data-account-initial]");
      if (!icon || !init) return;
      if (u) { icon.classList.add("hidden"); init.classList.remove("hidden"); init.classList.add("flex"); init.textContent = initials(u); }
      else { icon.classList.remove("hidden"); init.classList.add("hidden"); init.classList.remove("flex"); init.textContent = ""; }
    });
  }

  function flash(msg) {
    let t = document.querySelector("[data-melted-toast]");
    if (!t) { t = document.createElement("div"); t.setAttribute("data-melted-toast", "");
      t.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100001] bg-black text-white oswald text-[13px] tracking-[0.06em] uppercase px-6 py-3 shadow-xl opacity-0 transition-opacity duration-300";
      document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove("opacity-0");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.add("opacity-0"), 3200);
  }

  /* ---- Modal markup ---- */
  function authModalHTML() {
    const consentNote = `<p class="garamond text-[12px] text-[#999] leading-[1.45] mt-4">By continuing you agree to our <a href="#" class="underline">Terms</a> &amp; <a href="#" class="underline">Privacy Policy</a>. You must be 21+.</p>`;
    return `
<div data-auth-overlay class="fixed inset-0 z-[100000] hidden items-center justify-center bg-black/60 px-4">
  <div data-auth-card class="bg-white w-full max-w-[420px] max-h-[94vh] overflow-y-auto relative" role="dialog" aria-modal="true" aria-label="Sign in">
    <button data-auth-close aria-label="Close" class="absolute top-4 right-4 text-[#999] hover:text-black text-[22px] leading-none">&times;</button>
    <div class="px-8 pt-10 pb-9">
      <img src="assets/melted/logo_black.png" alt="Melted" class="h-[26px] mx-auto">
      <h2 data-auth-title class="caslon text-[26px] text-black text-center leading-[1.15] mt-6">Sign in or join Melted</h2>
      <p data-auth-sub class="garamond text-[15px] text-[#777] text-center mt-2">Unlock drops, flash sales, and member perks.</p>

      <!-- Social -->
      <div class="mt-7 space-y-3">
        <button type="button" data-sso="google" class="w-full flex items-center justify-center gap-3 border border-[#dcdcdc] hover:border-black transition-colors py-3 oswald text-[13px] tracking-[0.04em] uppercase">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.8 6.1C12.2 13.4 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.2-9.6 6.2-17z"/><path fill="#FBBC05" d="M10.3 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.8l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.4 0-11.8-3.9-13.7-9.4l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
          Continue with Google
        </button>
        <button type="button" data-sso="apple" class="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-[#222] transition-colors py-3 oswald text-[13px] tracking-[0.04em] uppercase">
          <svg class="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.82 0-2.07-.92-3.41-.9-1.75.03-3.37 1.02-4.27 2.59-1.83 3.17-.47 7.85 1.31 10.42.87 1.26 1.9 2.67 3.26 2.62 1.31-.05 1.8-.85 3.39-.85 1.57 0 2.02.85 3.4.82 1.41-.02 2.3-1.28 3.16-2.55.99-1.46 1.4-2.88 1.42-2.95-.03-.01-2.72-1.04-2.75-4.13zM14.53 3.9c.72-.88 1.21-2.09 1.07-3.3-1.04.04-2.3.69-3.04 1.56-.66.77-1.25 2.01-1.09 3.19 1.16.09 2.34-.59 3.06-1.45z"/></svg>
          Continue with Apple
        </button>
        <p data-sso-note class="garamond text-[13px] text-[#9a6b1f] text-center hidden"></p>
      </div>

      <div class="flex items-center gap-3 my-6"><span class="h-px bg-[#e3e3e3] flex-1"></span><span class="oswald text-[11px] tracking-[0.12em] uppercase text-[#aaa]">or</span><span class="h-px bg-[#e3e3e3] flex-1"></span></div>

      <!-- Method tabs -->
      <div class="grid grid-cols-2 mb-5">
        <button type="button" data-method="email" class="oswald text-[12px] tracking-[0.08em] uppercase py-2 border-b-2 border-black">Email</button>
        <button type="button" data-method="phone" class="oswald text-[12px] tracking-[0.08em] uppercase py-2 border-b-2 border-transparent text-[#999]">Phone</button>
      </div>

      <!-- Email -->
      <form data-email-form>
        <input data-email type="email" autocomplete="email" placeholder="you@email.com" class="w-full border border-[#d4d4d4] focus:border-black outline-none px-4 py-3 text-[15px] garamond">
        <label class="flex items-start gap-3 mt-4 cursor-pointer">
          <input data-email-optin type="checkbox" class="mt-1 w-4 h-4 accent-black shrink-0">
          <span class="garamond text-[13px] text-[#555] leading-[1.45]">Email me Melted news, new drops, and members-only offers.</span>
        </label>
        <button type="submit" class="w-full bg-black text-white oswald text-[12px] font-medium tracking-[0.1em] uppercase py-3 mt-5 hover:bg-[#333] transition-colors">Continue with email</button>
      </form>

      <!-- Phone -->
      <form data-phone-form class="hidden">
        <div data-phone-step>
          <input data-phone type="tel" autocomplete="tel" inputmode="tel" placeholder="(555) 123-4567" class="w-full border border-[#d4d4d4] focus:border-black outline-none px-4 py-3 text-[15px] garamond">
          <label class="flex items-start gap-3 mt-4 cursor-pointer">
            <input data-sms-optin type="checkbox" class="mt-1 w-4 h-4 accent-black shrink-0">
            <span class="garamond text-[13px] text-[#555] leading-[1.45]">Text me flash-sale alerts &amp; promos. Msg &amp; data rates may apply, recurring msgs; reply STOP to cancel, HELP for help.</span>
          </label>
          <button type="submit" class="w-full bg-black text-white oswald text-[12px] font-medium tracking-[0.1em] uppercase py-3 mt-5 hover:bg-[#333] transition-colors">Text me a code</button>
        </div>
        <div data-otp-step class="hidden">
          <p class="garamond text-[14px] text-[#555] text-center">Enter the 6-digit code we sent to <span data-otp-dest class="text-black"></span>.</p>
          <input data-otp inputmode="numeric" maxlength="6" placeholder="------" class="w-full text-center tracking-[0.5em] border border-[#d4d4d4] focus:border-black outline-none px-4 py-3 text-[20px] oswald mt-3">
          <p data-otp-hint class="garamond text-[12px] text-[#999] text-center mt-2"></p>
          <button type="button" data-otp-verify class="w-full bg-black text-white oswald text-[12px] font-medium tracking-[0.1em] uppercase py-3 mt-4 hover:bg-[#333] transition-colors">Verify &amp; continue</button>
        </div>
      </form>

      <p data-auth-msg class="garamond text-[13px] text-[#c0392b] text-center min-h-[18px] mt-3"></p>
      ${consentNote}
    </div>
  </div>
</div>`;
  }

  /* ---- Account popover (logged-in) ---- */
  function accountMenuHTML(u) {
    const row = (label, on, key) =>
      `<div class="flex items-center justify-between py-2">
        <span class="garamond text-[14px] text-[#555]">${label}</span>
        <button type="button" data-toggle="${key}" class="oswald text-[10px] tracking-[0.08em] uppercase border px-2 py-1 ${on ? "bg-black text-white border-black" : "border-[#ccc] text-[#999]"}">${on ? "On" : "Off"}</button>
      </div>`;
    return `<div class="px-5 py-5">
      <p class="oswald text-[11px] tracking-[0.1em] uppercase text-[#999]">Signed in</p>
      <p class="garamond text-[16px] text-black mt-1 break-words">${u.email || u.phone || "Melted member"}</p>
      <div class="border-t border-[#eee] mt-3 pt-2">
        ${row("Email newsletter", !!u.emailOptIn, "emailOptIn")}
        ${row("SMS promos", !!u.smsOptIn, "smsOptIn")}
      </div>
      <button type="button" data-logout class="w-full oswald text-[11px] tracking-[0.08em] uppercase border border-black py-2.5 mt-3 hover:bg-black hover:text-white transition-colors">Log out</button>
    </div>`;
  }

  let lastFocus = null;
  function openAuth() {
    const ov = document.querySelector("[data-auth-overlay]"); if (!ov) return;
    lastFocus = document.activeElement;
    ov.classList.remove("hidden"); ov.classList.add("flex");
    document.documentElement.classList.add("m-modal-open");
    lockScroll(true);
    const f = ov.querySelector("[data-email]"); if (f) setTimeout(() => f.focus(), 40);
  }
  function closeAuth() {
    const ov = document.querySelector("[data-auth-overlay]"); if (!ov) return;
    ov.classList.add("hidden"); ov.classList.remove("flex");
    document.documentElement.classList.remove("m-modal-open");
    lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setupAuth() {
    if (!document.querySelector("[data-auth-overlay]")) {
      const wrap = document.createElement("div"); wrap.innerHTML = authModalHTML();
      document.body.appendChild(wrap.firstElementChild);
    }
    const ov = document.querySelector("[data-auth-overlay]");
    const msg = ov.querySelector("[data-auth-msg]");
    const setMsg = (t, ok) => { msg.textContent = t || ""; msg.className = "garamond text-[13px] text-center min-h-[18px] mt-3 " + (ok ? "text-black" : "text-[#c0392b]"); };

    // Account button: open modal (logged out) or account menu (logged in)
    document.querySelectorAll("[data-account]").forEach(btn => {
      if (btn._wired) return; btn._wired = true;
      btn.addEventListener("click", e => {
        e.preventDefault(); e.stopPropagation();
        if (getUser()) toggleAccountMenu(btn); else openAuth();
      });
    });

    ov.querySelector("[data-auth-close]").addEventListener("click", closeAuth);
    ov.addEventListener("mousedown", e => { if (e.target === ov) closeAuth(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && ov.classList.contains("flex")) closeAuth(); });

    // Method tabs
    const tabs = ov.querySelectorAll("[data-method]");
    const emailForm = ov.querySelector("[data-email-form]");
    const phoneForm = ov.querySelector("[data-phone-form]");
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => { x.classList.remove("border-black"); x.classList.add("border-transparent", "text-[#999]"); });
      t.classList.add("border-black"); t.classList.remove("border-transparent", "text-[#999]");
      const m = t.dataset.method;
      emailForm.classList.toggle("hidden", m !== "email");
      phoneForm.classList.toggle("hidden", m !== "phone");
      setMsg("");
    }));

    // Social
    ov.querySelectorAll("[data-sso]").forEach(b => b.addEventListener("click", () => ssoSignIn(b.dataset.sso, ov, setMsg)));

    // Email submit
    emailForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = ov.querySelector("[data-email]").value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setMsg("Enter a valid email address.");
      completeAuth({ method: "email", email, emailOptIn: ov.querySelector("[data-email-optin]").checked });
    });

    // Phone -> OTP
    const phoneStep = ov.querySelector("[data-phone-step]");
    const otpStep = ov.querySelector("[data-otp-step]");
    phoneForm.addEventListener("submit", e => {
      e.preventDefault();
      const phone = normalizePhone(ov.querySelector("[data-phone]").value);
      if (!phone) return setMsg("Enter a valid 10-digit phone number.");
      setMsg("");
      api(AUTH_CONFIG.endpoints.phoneStart, { phone });
      ov.querySelector("[data-otp-dest]").textContent = phone;
      ov.querySelector("[data-otp-hint]").textContent = AUTH_CONFIG.apiBase ? "" : "Demo mode — enter any 6 digits.";
      phoneStep.classList.add("hidden"); otpStep.classList.remove("hidden");
      ov._pendingPhone = phone;
      ov._pendingSms = ov.querySelector("[data-sms-optin]").checked;
      setTimeout(() => ov.querySelector("[data-otp]").focus(), 40);
    });
    ov.querySelector("[data-otp-verify]").addEventListener("click", () => {
      const code = ov.querySelector("[data-otp]").value.trim();
      if (!/^\d{6}$/.test(code)) return setMsg("Enter the 6-digit code.");
      const finish = () => completeAuth({ method: "phone", phone: ov._pendingPhone, smsOptIn: ov._pendingSms });
      if (AUTH_CONFIG.apiBase) {
        api(AUTH_CONFIG.endpoints.phoneVerify, { phone: ov._pendingPhone, code })
          .then(r => r && r.ok ? finish() : setMsg("That code didn't match. Try again."));
      } else finish();
    });

    refreshAccountUI();
  }

  function toggleAccountMenu(btn) {
    let menu = btn.querySelector("[data-account-menu]");
    if (menu) { menu.remove(); return; }
    menu = document.createElement("div");
    menu.setAttribute("data-account-menu", "");
    menu.className = "absolute right-0 top-full mt-2 w-[270px] bg-white border border-[#e3e3e3] shadow-xl z-[100000] text-left";
    menu.innerHTML = accountMenuHTML(getUser());
    btn.appendChild(menu);
    menu.addEventListener("click", e => e.stopPropagation());
    bindMenu(btn, menu);
    setTimeout(() => document.addEventListener("click", function h(ev) { if (!btn.contains(ev.target)) { menu.remove(); document.removeEventListener("click", h); } }), 0);
  }

  // Mini phone-capture step shown when a member turns SMS on without a number on file.
  function phonePromptHTML() {
    return `<div class="px-5 py-5">
      <p class="oswald text-[11px] tracking-[0.1em] uppercase text-[#999]">Add a mobile number</p>
      <p class="garamond text-[14px] text-[#555] leading-[1.45] mt-1">Add a number to get flash-sale alerts &amp; promos.</p>
      <input data-acct-phone type="tel" inputmode="tel" autocomplete="tel" placeholder="(555) 123-4567" class="w-full border border-[#d4d4d4] focus:border-black outline-none px-3 py-2.5 text-[14px] garamond mt-3">
      <p data-acct-phone-msg class="garamond text-[12px] text-[#c0392b] min-h-[15px] mt-1"></p>
      <p class="garamond text-[11px] text-[#999] leading-[1.4]">By saving you agree to receive recurring automated promotional texts from Melted at this number. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help.</p>
      <div class="flex gap-2 mt-3">
        <button type="button" data-acct-phone-save class="flex-1 oswald text-[11px] tracking-[0.08em] uppercase bg-black text-white py-2.5 hover:bg-[#333] transition-colors">Save &amp; turn on</button>
        <button type="button" data-acct-phone-cancel class="oswald text-[11px] tracking-[0.08em] uppercase border border-[#ccc] px-3 py-2.5 hover:border-black transition-colors">Cancel</button>
      </div>
    </div>`;
  }

  function bindMenu(btn, menu) {
    menu.querySelectorAll("[data-toggle]").forEach(t => t.addEventListener("click", () => {
      const u = getUser(); const k = t.dataset.toggle;
      // Turning SMS ON without a number -> capture number + consent first, then flip on.
      if (k === "smsOptIn" && !u.smsOptIn && !u.phone) {
        menu.innerHTML = phonePromptHTML();
        bindPhonePrompt(btn, menu);
        setTimeout(() => { const i = menu.querySelector("[data-acct-phone]"); if (i) i.focus(); }, 30);
        return;
      }
      u[k] = !u[k]; saveUser(u); syncMarketing(u);
      menu.innerHTML = accountMenuHTML(u); bindMenu(btn, menu);
    }));
    const lo = menu.querySelector("[data-logout]");
    if (lo) lo.addEventListener("click", () => { saveUser(null); menu.remove(); flash("Logged out."); });
  }

  function bindPhonePrompt(btn, menu) {
    const input = menu.querySelector("[data-acct-phone]");
    const msg = menu.querySelector("[data-acct-phone-msg]");
    const cancel = () => { menu.innerHTML = accountMenuHTML(getUser()); bindMenu(btn, menu); };  // smsOptIn left off
    const save = () => {
      const phone = normalizePhone(input.value);
      if (!phone) { msg.textContent = "Enter a valid 10-digit mobile number."; return; }
      const u = getUser();
      u.phone = phone; u.smsOptIn = true; u.smsConsentTs = Date.now();
      saveUser(u); syncMarketing(u);            // syncs to SMS platform only now that consent + number exist
      menu.innerHTML = accountMenuHTML(u); bindMenu(btn, menu);
      flash("Texts on — you're on the flash-sale list.");
    };
    menu.querySelector("[data-acct-phone-cancel]").addEventListener("click", cancel);
    menu.querySelector("[data-acct-phone-save]").addEventListener("click", save);
    input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); save(); } });
  }

  function ssoSignIn(provider, ov, setMsg) {
    const note = ov.querySelector("[data-sso-note]");
    const id = provider === "google" ? AUTH_CONFIG.googleClientId : AUTH_CONFIG.appleClientId;
    if (!id || !AUTH_CONFIG.apiBase) {
      note.textContent = (provider === "google" ? "Google" : "Apple") + " sign-in activates once OAuth is configured. For now, continue with email or phone.";
      note.classList.remove("hidden");
      return;
    }
    // Configured path: backend exchanges the provider token, returns the verified profile.
    // (Google Identity Services / AppleID JS would be initialized here with `id`.)
    api(AUTH_CONFIG.endpoints[provider], { /* token from provider SDK */ })
      .then(r => { if (r && r.email) completeAuth({ method: provider, email: r.email, name: r.name || "", emailOptIn: true }); });
  }

  function normalizePhone(v) {
    const d = (v || "").replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d[0] === "1") return "+" + d;
    return "";
  }

  /* ---------- Boot ---------- */
  function mount() {
    if (!document.getElementById("m-cursor-style")) {
      const st = document.createElement("style"); st.id = "m-cursor-style";
      st.textContent = GATE_CSS;
      document.head.appendChild(st);
    }
    const h = document.querySelector("[data-melted-header]");
    if (h) h.innerHTML = headerHTML();
    const f = document.querySelector("[data-melted-footer]");
    if (f) f.innerHTML = footerHTML();
    wireHeader();
    setupAuth();
    initAgeGate();
  }

  // Expose for page scripts
  window.MELTED = { STORES, PRODUCTS, ZIPS, STATE_NAMES, COMING_SOON, nearestStores, zipCoords, getZip, setZip, validZip, haversine,
    zipStateAbbr, zipStateName, AUTH_CONFIG, getUser, openAuth, syncMarketing };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
