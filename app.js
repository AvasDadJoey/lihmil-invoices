/* Lihmil Invoices — phone-first shop-floor app */
(function () {
  var CATALOG = window.LIHMIL_CATALOG || [];
  var KEYS = {
    customers: "lihmil.customers",
    invoices: "lihmil.invoices",
    nextNum: "lihmil.nextNum",
    nextDump: "lihmil.nextDumpNum",
    nextInv: "lihmil.nextInvNum",
    settings: "lihmil.settings"
  };
  var MIX_COLORS = ["White", "Cream", "Yellow", "Orange", "Peach", "Pink", "Hot Pink", "Red", "Burgundy", "Lavender", "Purple", "Green", "Bi-color"];
  var PAYMENTS = ["CHECK", "CASH", "CARD", "BILL TO ACCOUNT"];
  var PERCENTS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  var COMPANY = {
    name: "Lihmil",
    tag: "FLOWERS • SUPPLIES",
    city: "Kernersville, NC",
    street: "1501 Old Greensboro Road",
    zip: "Kernersville, NC 27284",
    tel: "(336) 993-1008",
    fax: "(336) 993-4982"
  };

  var state = { search: "", modal: null, flashLine: null, toastTimer: null };
  var saveTimer = null;
  var appEl = document.getElementById("app");

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function customers() { return load(KEYS.customers, []); }
  function invoices() { return load(KEYS.invoices, []); }
  function settings() {
    var s = load(KEYS.settings, { fscDefault: 9 });
    if (typeof s.fscDefault !== "number") s.fscDefault = 9;
    return s;
  }
  function nextNum() {
    var n = parseInt(localStorage.getItem(KEYS.nextNum) || "1", 10);
    if (!n || n < 1) n = 1;
    return n;
  }
  function bumpNum() {
    var n = nextNum();
    localStorage.setItem(KEYS.nextNum, String(n + 1));
    return n;
  }
  function padInv(n) {
    return String(n).padStart(5, "0");
  }
  function bumpNamed(key) {
    var n = parseInt(localStorage.getItem(key) || "1", 10);
    if (!n || n < 1) n = 1;
    localStorage.setItem(key, String(n + 1));
    return n;
  }
  function docType(d) { return (d && d.type) || "invoice"; }
  function isCountDoc(d) { var t = docType(d); return t === "dump" || t === "inventory"; }
  function typeLabel(d) {
    var t = docType(d);
    if (t === "dump") return "Dump";
    if (t === "inventory") return "Inventory";
    return "Invoice";
  }
  function docPath(d) { return "#/" + docType(d) + "/" + d.id; }
  function lineColors(p) {
    var cols = colorList(p);
    if (cols.length) return cols;
    return MIX_COLORS.map(function (n) { return { name: n, listedPrice: p && p.listedPrice, sellPrice: p && p.sellPrice }; });
  }
  function money(n) {
    n = Number(n) || 0;
    return "$" + n.toFixed(2);
  }
  function uid() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }
  function todayNY() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var y, m, d;
    parts.forEach(function (p) {
      if (p.type === "year") y = p.value;
      if (p.type === "month") m = p.value;
      if (p.type === "day") d = p.value;
    });
    return y + "-" + m + "-" + d;
  }
  function fmtDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    if (p.length !== 3) return iso;
    return p[1] + "/" + p[2] + "/" + p[0];
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function productById(id) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }
  function colorList(p) {
    if (!p || !p.colors || !p.colors.length) return [];
    return p.colors.map(function (c) {
      if (typeof c === "string") return { name: c, listedPrice: p.listedPrice, sellPrice: p.sellPrice };
      return c;
    });
  }
  function lineSell(line) {
    var p = productById(line.productId);
    if (p && line.color) {
      var cols = colorList(p);
      for (var i = 0; i < cols.length; i++) {
        if (cols[i].name === line.color) return Number(cols[i].sellPrice);
      }
    }
    return Number(line.sellPrice || (p && p.sellPrice) || 0);
  }
  function isSpecialPrice(line) {
    return lineDiscount(line) > 0.004;
  }
  function spMark(line) {
    return isSpecialPrice(line) ? ' <b class="sp-mark">SP</b>' : "";
  }
  function lineDiscount(line) {
    var qty = Number(line.qty) || 0;
    var unit = lineSell(line);
    var gross = unit * qty;
    if (line.discountMode === "percent") {
      var pct = Number(line.discountPercent) || 0;
      return Math.min(gross, gross * (pct / 100));
    }
    if (line.discountMode === "dollar") {
      return Math.min(gross, Number(line.discountDollar) || 0);
    }
    return 0;
  }
  function lineTotal(line) {
    var qty = Number(line.qty) || 0;
    var gross = lineSell(line) * qty;
    return Math.max(0, gross - lineDiscount(line));
  }
  function merchTotal(inv) {
    return (inv.lines || []).reduce(function (s, l) { return s + lineTotal(l); }, 0);
  }
  function fscAmt(inv) {
    if (inv.fscChoice !== "yes") return 0;
    var n = Number(inv.fscAmount);
    if (!isFinite(n) || n < 0) n = settings().fscDefault;
    return n;
  }
  function grandTotal(inv) {
    return merchTotal(inv) + fscAmt(inv);
  }
  function needsColor(line) {
    var p = productById(line.productId);
    return !!(p && p.colors && p.colors.length);
  }
  function completeBlockers(inv) {
    var reasons = [];
    var t = docType(inv);
    if (!inv.lines || !inv.lines.length) reasons.push("Add at least one flower");
    (inv.lines || []).forEach(function (l) {
      if (t === "invoice") {
        if (needsColor(l) && !l.color) reasons.push("Pick a color for " + l.name);
      } else if (!l.color) {
        reasons.push("Pick a color for " + l.name);
      }
    });
    if (t === "invoice") {
      if (!inv.customerId) reasons.push("Pick a customer");
      if (inv.fscChoice !== "yes" && inv.fscChoice !== "no") reasons.push("Choose Fuel Surcharge: Charge or Waive");
      if (!inv.payment) reasons.push("Choose how they pay");
    } else {
      if (!(inv.routeTruck || "").trim()) reasons.push("Enter the Route / Truck");
    }
    return reasons;
  }
  function getInvoice(id) {
    var list = invoices();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function putInvoice(inv) {
    var list = invoices();
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === inv.id) { list[i] = inv; found = true; break; }
    }
    if (!found) list.unshift(inv);
    save(KEYS.invoices, list);
  }
  function scheduleSave(inv) {
    if (inv.status === "complete") return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      inv.updatedAt = Date.now();
      putInvoice(inv);
    }, 300);
  }
  function getCustomer(id) {
    var list = customers();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function putCustomer(c) {
    var list = customers();
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === c.id) { list[i] = c; found = true; break; }
    }
    if (!found) list.unshift(c);
    list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    save(KEYS.customers, list);
  }
  function drafts() {
    return invoices().filter(function (i) { return i.status !== "complete"; });
  }
  function completed() {
    return invoices().filter(function (i) { return i.status === "complete"; });
  }
  function go(hash) {
    location.hash = hash;
  }
  function route() {
    var h = (location.hash || "#/").replace(/^#/, "");
    if (!h) h = "/";
    var parts = h.split("/").filter(Boolean);
    state.search = state.search || "";
    if (!parts.length) return renderHome();
    if (parts[0] === "drafts") return renderList("draft");
    if (parts[0] === "completed") return renderList("complete");
    if (parts[0] === "customers") return renderCustomers();
    if (parts[0] === "settings") return renderSettings();
    if ((parts[0] === "invoice" || parts[0] === "dump" || parts[0] === "inventory") && parts[1] === "new") {
      var made = parts[0] === "dump" ? newDump() : parts[0] === "inventory" ? newInventory() : newInvoice();
      putInvoice(made);
      location.replace("#/" + parts[0] + "/" + made.id);
      return;
    }
    if ((parts[0] === "invoice" || parts[0] === "dump" || parts[0] === "inventory") && parts[1]) {
      var inv2 = getInvoice(parts[1]);
      if (!inv2) return renderHome();
      if (parts[2] === "sign") return renderSign(inv2);
      if (parts[2] === "done") return renderDone(inv2);
      if (isCountDoc(inv2)) return renderCountDoc(inv2);
      return renderInvoice(inv2);
    }
    renderHome();
  }

  function newInvoice() {
    var n = bumpNum();
    return {
      id: uid(),
      type: "invoice",
      number: n,
      date: todayNY(),
      customerId: "",
      lines: [],
      fscChoice: "",
      fscAmount: settings().fscDefault,
      payment: "",
      signature: "",
      signedAt: "",
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  function newDump() {
    return {
      id: uid(),
      type: "dump",
      number: bumpNamed(KEYS.nextDump),
      date: todayNY(),
      routeTruck: "",
      lines: [],
      signature: "",
      signedAt: "",
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
  function newInventory() {
    return {
      id: uid(),
      type: "inventory",
      number: bumpNamed(KEYS.nextInv),
      date: todayNY(),
      routeTruck: "",
      lines: [],
      signature: "",
      signedAt: "",
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  function topbar(title, backHash) {
    return '<div class="topbar">' +
      (backHash
        ? '<button class="icon-btn" data-go="' + esc(backHash) + '" aria-label="Back">‹</button>'
        : '<span class="icon-btn" style="opacity:0"> </span>') +
      "<h1>" + esc(title) + "</h1>" +
      "</div>";
  }

  function renderHome() {
    var d = drafts().length;
    var c = completed().length;
    var cu = customers().length;
    appEl.innerHTML =
      '<div class="screen home">' +
        '<div class="logo-wrap"><img src="img/logo-wide.png" alt="Lihmil"></div>' +
        '<p class="home-tag">KERNERSVILLE</p>' +
        '<div class="home-actions">' +
          '<button class="btn btn-purple btn-giant" data-go="#/invoice/new">New Invoice</button>' +
          '<button class="btn btn-yellow btn-giant" data-go="#/dump/new">New Dump</button>' +
          '<button class="btn btn-ghost btn-giant" data-go="#/inventory/new">New Inventory</button>' +
        '</div>' +
        '<div class="home-nav">' +
          '<button class="nav-row" data-go="#/drafts">Drafts' + (d ? '<span class="badge yellow">' + d + "</span>" : "") + '<span class="chev">›</span></button>' +
          '<button class="nav-row" data-go="#/completed">Completed' + (c ? '<span class="badge">' + c + "</span>" : "") + '<span class="chev">›</span></button>' +
          '<button class="nav-row" data-go="#/customers">Customers' + (cu ? '<span class="badge">' + cu + "</span>" : "") + '<span class="chev">›</span></button>' +
          '<button class="nav-row" data-go="#/settings">Settings<span class="chev">›</span></button>' +
        "</div>" +
      "</div>";
  }

  function renderList(kind) {
    var items = kind === "draft" ? drafts() : completed();
    var title = kind === "draft" ? "Drafts" : "Completed";
    var rows = items.map(function (inv) {
      var t = docType(inv);
      var cust = getCustomer(inv.customerId);
      var sub = t === "invoice"
        ? ((cust && cust.name) || "No customer")
        : ((inv.routeTruck || "").trim() || "No route / truck");
      var right = t === "invoice" ? money(grandTotal(inv)) : ((inv.lines || []).length + " items");
      var href = docPath(inv) + (kind === "complete" ? "/done" : "");
      return '<button class="list-row" data-go="' + href + '">' +
        '<div class="grow"><strong>' + typeLabel(inv) + " " + padInv(inv.number) + '</strong>' +
        "<small>" + esc(sub) + " · " + esc(fmtDate(inv.date)) + "</small></div>" +
        '<span class="amt">' + esc(right) + "</span></button>";
    }).join("");
    appEl.innerHTML =
      '<div class="screen">' + topbar(title, "#/") +
      (rows ? '<div class="list">' + rows + "</div>" : '<div class="empty">Nothing here yet.</div>') +
      "</div>";
  }

  function renderCustomers() {
    var q = (state.search || "").toLowerCase();
    var list = customers().filter(function (c) {
      if (!q) return true;
      return (c.name + " " + (c.company || "") + " " + (c.phone || "")).toLowerCase().indexOf(q) !== -1;
    });
    var rows = list.map(function (c) {
      return '<button class="list-row" data-edit-cust="' + c.id + '">' +
        '<div class="grow"><strong>' + esc(c.name) + "</strong>" +
        "<small>" + esc(c.company || c.phone || "Tap to edit") + "</small></div>" +
        '<span class="chev">›</span></button>';
    }).join("");
    appEl.innerHTML =
      '<div class="screen">' + topbar("Customers", "#/") +
      '<div class="search-sticky"><input id="q" placeholder="Search customers" value="' + esc(state.search) + '"></div>' +
      '<button class="btn btn-purple btn-block" data-new-cust="1" style="margin-bottom:12px">Create customer</button>' +
      (rows ? '<div class="list">' + rows + "</div>" : '<div class="empty">No customers yet.</div>') +
      "</div>";
    bindSearch();
  }

  function renderSettings() {
    var s = settings();
    appEl.innerHTML =
      '<div class="screen">' + topbar("Settings", "#/") +
      '<div class="card"><h2>Fuel Surcharge default</h2>' +
      '<label class="field-label">Amount ($)</label>' +
      '<input id="fscDef" type="number" min="0" step="0.01" value="' + s.fscDefault + '">' +
      '<p class="hint">Used on new invoices. You can still change it on each order before completing.</p>' +
      '<button class="btn btn-purple btn-block" id="saveSet">Save</button></div>' +
      '<p class="center faint" style="margin-top:24px">Lihmil · Kernersville, NC<br>Prices round up to the next dollar.</p>' +
      "</div>";
    document.getElementById("saveSet").onclick = function () {
      var n = parseFloat(document.getElementById("fscDef").value);
      if (!isFinite(n) || n < 0) n = 9;
      save(KEYS.settings, { fscDefault: n });
      toast("Saved");
    };
  }

  function renderCountDoc(doc) {
    var t = docType(doc);
    var title = t === "dump" ? "Dump " + padInv(doc.number) : "Inventory " + padInv(doc.number);
    var q = state.search || "";
    var resultsHtml = "";
    if (q.trim()) {
      var qq = q.trim().toLowerCase();
      var hits = CATALOG.filter(function (p) {
        return (p.name + " " + (p.packNote || "") + " " + p.category).toLowerCase().indexOf(qq) !== -1;
      }).slice(0, 20);
      resultsHtml = hits.length
        ? '<div class="results">' + hits.map(function (p) {
            return '<button class="result" data-add="' + p.id + '">' +
              '<div class="meta"><b>' + esc(p.name) + "</b><small>" +
              esc(p.category) + (p.packNote ? " · " + esc(p.packNote) : "") +
              "</small></div></button>";
          }).join("") + "</div>"
        : '<p class="hint">No flowers match “' + esc(q) + '”.</p>';
    } else {
      resultsHtml = '<p class="hint">Search flowers, then tap to add them.</p>';
    }

    var linesHtml = (doc.lines || []).map(function (line, idx) {
      var prod = productById(line.productId);
      var cols = lineColors(prod || { colors: MIX_COLORS });
      return '<div class="line' + (state.flashLine === line.id ? " flash" : "") + '">' +
        '<div class="line-head"><div class="name">' + esc(line.name) +
        (line.packNote ? '<span class="pack">' + esc(line.packNote) + "</span>" : "") +
        "</div>" +
        '<button class="line-remove" data-del-line="' + idx + '" aria-label="Remove">×</button></div>' +
        '<label class="field-label">Color</label><select data-line="' + idx + '" data-field="color">' +
          '<option value="">Select color…</option>' +
          cols.map(function (c) {
            return '<option value="' + esc(c.name) + '"' + (line.color === c.name ? " selected" : "") + ">" +
              esc(c.name) + "</option>";
          }).join("") + "</select>" +
        (!line.color ? '<div class="warn">Color required</div>' : "") +
        '<label class="field-label">Quantity</label>' +
        '<div class="stepper">' +
          '<button type="button" data-qty="' + idx + '" data-d="-1">−</button>' +
          '<input inputmode="numeric" data-line="' + idx + '" data-field="qty" value="' + esc(line.qty) + '">' +
          '<button type="button" data-qty="' + idx + '" data-d="1">+</button>' +
        "</div></div>";
    }).join("");

    var blockers = completeBlockers(doc);
    appEl.innerHTML =
      '<div class="screen with-bar">' +
        topbar(title, "#/") +
        '<div class="card"><h2>Date</h2>' +
          '<input type="date" id="invDate" value="' + esc(doc.date) + '">' +
        "</div>" +
        '<div class="card"><h2>Route / Truck</h2>' +
          '<input id="routeTruck" placeholder="Route or truck number" value="' + esc(doc.routeTruck || "") + '">' +
          (!(doc.routeTruck || "").trim() ? '<div class="warn">Required before completing</div>' : "") +
        "</div>" +
        '<div class="search-sticky"><input id="q" placeholder="Search flowers" value="' + esc(q) + '"></div>' +
        resultsHtml +
        (doc.lines.length ? '<h2 class="section-label">Items</h2>' + linesHtml : "") +
      "</div>" +
      '<div class="complete-bar">' +
        (blockers.length ? '<div class="complete-msg">' + esc(blockers[0]) + "</div>" : "") +
        '<button class="btn btn-yellow btn-giant"' + (blockers.length ? " disabled" : "") + ' data-complete="1">Complete</button>' +
      "</div>";

    bindSearch();
    var dateEl = document.getElementById("invDate");
    if (dateEl) dateEl.onchange = function () { doc.date = dateEl.value; scheduleSave(doc); };
    var rt = document.getElementById("routeTruck");
    if (rt) {
      rt.oninput = function () { doc.routeTruck = rt.value; scheduleSave(doc); };
      rt.onchange = function () { doc.routeTruck = rt.value; scheduleSave(doc); renderCountDoc(doc); };
    }
    appEl.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.onclick = function () { addLine(doc, btn.getAttribute("data-add")); };
    });
    appEl.querySelectorAll("[data-del-line]").forEach(function (btn) {
      btn.onclick = function () {
        doc.lines.splice(Number(btn.getAttribute("data-del-line")), 1);
        scheduleSave(doc); renderCountDoc(doc);
      };
    });
    appEl.querySelectorAll("[data-qty]").forEach(function (btn) {
      btn.onclick = function () {
        var i = Number(btn.getAttribute("data-qty"));
        var d = Number(btn.getAttribute("data-d"));
        doc.lines[i].qty = Math.max(1, (Number(doc.lines[i].qty) || 1) + d);
        scheduleSave(doc); renderCountDoc(doc);
      };
    });
    appEl.querySelectorAll("[data-line]").forEach(function (el) {
      el.onchange = el.onblur = function () {
        var i = Number(el.getAttribute("data-line"));
        var field = el.getAttribute("data-field");
        var line = doc.lines[i];
        if (field === "qty") {
          var qn = parseFloat(el.value);
          line.qty = !qn || qn < 0 ? 1 : qn;
        } else if (field === "color") {
          line.color = el.value;
        }
        scheduleSave(doc); renderCountDoc(doc);
      };
    });
    var completeBtn = appEl.querySelector("[data-complete]");
    if (completeBtn && !blockers.length) {
      completeBtn.onclick = function () {
        putInvoice(doc);
        go(docPath(doc) + "/sign");
      };
    }
  }

  function renderInvoice(inv) {
    var cust = getCustomer(inv.customerId);
    var q = state.search || "";
    var resultsHtml = "";
    if (q.trim()) {
      var qq = q.trim().toLowerCase();
      var hits = CATALOG.filter(function (p) {
        return (p.name + " " + (p.packNote || "") + " " + p.category).toLowerCase().indexOf(qq) !== -1;
      }).slice(0, 20);
      resultsHtml = hits.length
        ? '<div class="results">' + hits.map(function (p) {
            return '<button class="result" data-add="' + p.id + '">' +
              '<div class="meta"><b>' + esc(p.name) + "</b><small>" +
              esc(p.category) + (p.packNote ? " · " + esc(p.packNote) : "") + " · " + esc(p.unit) +
              "</small></div><div class=\"price\">" + money(p.sellPrice) + "</div></button>";
          }).join("") + "</div>"
        : '<p class="hint">No flowers match “' + esc(q) + '”.</p>';
    } else {
      resultsHtml = '<p class="hint">Search the price list, then tap a flower to add it.</p>';
    }

    var linesHtml = (inv.lines || []).map(function (line, idx) {
      var p = productById(line.productId);
      var cols = p ? colorList(p) : [];
      var colorHtml = "";
      if (cols.length) {
        colorHtml = '<label class="field-label">Color</label><select data-line="' + idx + '" data-field="color">' +
          '<option value="">Select color…</option>' +
          cols.map(function (c) {
            return '<option value="' + esc(c.name) + '"' + (line.color === c.name ? " selected" : "") + ">" +
              esc(c.name) + " · " + money(c.sellPrice) + "</option>";
          }).join("") + "</select>" +
          (!line.color ? '<div class="warn">Color required</div>' : "");
      }
      var mode = line.discountMode || "none";
      return '<div class="line' + (state.flashLine === line.id ? " flash" : "") + '">' +
        '<div class="line-head"><div class="name">' + esc(line.name) +
        (line.packNote ? '<span class="pack">' + esc(line.packNote) + "</span>" : "") +
        "</div>" +
        '<button class="line-remove" data-del-line="' + idx + '" aria-label="Remove">×</button></div>' +
        colorHtml +
        '<label class="field-label">Quantity</label>' +
        '<div class="stepper">' +
          '<button type="button" data-qty="' + idx + '" data-d="-1">−</button>' +
          '<input inputmode="numeric" data-line="' + idx + '" data-field="qty" value="' + esc(line.qty) + '">' +
          '<button type="button" data-qty="' + idx + '" data-d="1">+</button>' +
        "</div>" +
        '<div class="line-price">' + money(lineSell(line)) + '<span style="font-size:14px;color:#A8A8AE;font-weight:600"> / ' + esc(line.unit || "each") + "</span></div>" +
        '<label class="field-label">Discount (optional)</label>' +
        '<div class="row-btns" style="margin-bottom:8px">' +
          '<button class="choice sub' + (mode === "none" ? " on" : "") + '" data-dmode="' + idx + '" data-m="none">None</button>' +
          '<button class="choice sub' + (mode === "percent" ? " on" : "") + '" data-dmode="' + idx + '" data-m="percent">% off</button>' +
          '<button class="choice sub' + (mode === "dollar" ? " on" : "") + '" data-dmode="' + idx + '" data-m="dollar">$ off</button>' +
        "</div>" +
        (mode === "percent"
          ? '<select data-line="' + idx + '" data-field="discountPercent">' +
            PERCENTS.map(function (p2) {
              return '<option value="' + p2 + '"' + (Number(line.discountPercent) === p2 ? " selected" : "") + ">" +
                (p2 ? p2 + "%" : "0%") + "</option>";
            }).join("") + "</select>"
          : "") +
        (mode === "dollar"
          ? '<input type="number" min="0" step="0.01" data-line="' + idx + '" data-field="discountDollar" value="' + esc(line.discountDollar || "") + '" placeholder="Dollars off">'
          : "") +
        '<div class="line-total"><span>Line total' + (isSpecialPrice(line) ? ' <b class="sp-mark">SP</b>' : "") + '</span><b>' + money(lineTotal(line)) + "</b></div>" +
      "</div>";
    }).join("");

    var blockers = completeBlockers(inv);
    var due = grandTotal(inv);

    appEl.innerHTML =
      '<div class="screen with-bar">' +
        topbar("Invoice " + padInv(inv.number), "#/") +
        '<div class="card"><h2>Date</h2>' +
          '<input type="date" id="invDate" value="' + esc(inv.date) + '">' +
        "</div>" +
        '<div class="card"><h2>Customer</h2>' +
          (cust
            ? '<div class="cust-selected"><div class="who"><strong>' + esc(cust.name) + "</strong><span>" +
              esc(cust.company || cust.phone || "Saved customer") + "</span></div>" +
              '<button class="btn btn-ghost" data-pick-cust="1">Change</button></div>'
            : '<div class="row-btns"><button class="btn btn-purple" data-pick-cust="1">Choose</button>' +
              '<button class="btn btn-ghost" data-new-cust="1">Create</button></div>') +
        "</div>" +
        '<div class="search-sticky"><input id="q" placeholder="Search flowers" value="' + esc(q) + '"></div>' +
        resultsHtml +
        (inv.lines.length ? '<h2 class="section-label">Items</h2>' + linesHtml : "") +
        '<div class="card"><h2>Fuel Surcharge (FSC)</h2>' +
          '<div class="row-btns">' +
            '<button class="choice' + (inv.fscChoice === "yes" ? " on" : "") + '" data-fsc="yes">CHARGE</button>' +
            '<button class="choice' + (inv.fscChoice === "no" ? " on" : "") + '" data-fsc="no">WAIVE</button>' +
          "</div>" +
          (inv.fscChoice === "yes"
            ? '<label class="field-label">FSC amount ($)</label><input type="number" min="0" step="0.01" id="fscAmt" value="' + esc(inv.fscAmount) + '">'
            : "") +
          (!inv.fscChoice ? '<div class="warn">Required before completing</div>' : "") +
        "</div>" +
        '<div class="card"><h2>Payment</h2>' +
          '<div class="row-btns-4">' +
            PAYMENTS.map(function (p) {
              return '<button class="choice' + (inv.payment === p ? " on" : "") + '" data-pay="' + esc(p) + '">' + esc(p) + "</button>";
            }).join("") +
          "</div>" +
        "</div>" +
        '<div class="totals">' +
          '<div class="totals-row"><span>Merchandise</span><b>' + money(merchTotal(inv)) + "</b></div>" +
          '<div class="totals-row"><span>Fuel surcharge</span><b>' + (inv.fscChoice === "yes" ? money(fscAmt(inv)) : (inv.fscChoice === "no" ? "Waived" : "—")) + "</b></div>" +
          '<div class="totals-row"><span>Tax</span><b>$0.00</b></div>' +
          '<div class="totals-due"><span>TOTAL DUE</span><b>' + money(due) + "</b></div>" +
        "</div>" +
      "</div>" +
      '<div class="complete-bar">' +
        (blockers.length ? '<div class="complete-msg">' + esc(blockers[0]) + "</div>" : "") +
        '<button class="btn btn-yellow btn-giant"' + (blockers.length ? " disabled" : "") + ' data-complete="1">Complete Order</button>' +
      "</div>";

    bindSearch();
    var dateEl = document.getElementById("invDate");
    if (dateEl) dateEl.onchange = function () { inv.date = dateEl.value; scheduleSave(inv); };
    var fscEl = document.getElementById("fscAmt");
    if (fscEl) fscEl.onchange = function () {
      var n = parseFloat(fscEl.value);
      inv.fscAmount = isFinite(n) && n >= 0 ? n : settings().fscDefault;
      scheduleSave(inv); renderInvoice(inv);
    };

    appEl.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.onclick = function () { addLine(inv, btn.getAttribute("data-add")); };
    });
    appEl.querySelectorAll("[data-del-line]").forEach(function (btn) {
      btn.onclick = function () {
        inv.lines.splice(Number(btn.getAttribute("data-del-line")), 1);
        scheduleSave(inv); renderInvoice(inv);
      };
    });
    appEl.querySelectorAll("[data-qty]").forEach(function (btn) {
      btn.onclick = function () {
        var i = Number(btn.getAttribute("data-qty"));
        var d = Number(btn.getAttribute("data-d"));
        inv.lines[i].qty = Math.max(1, (Number(inv.lines[i].qty) || 1) + d);
        scheduleSave(inv); renderInvoice(inv);
      };
    });
    appEl.querySelectorAll("[data-line]").forEach(function (el) {
      el.onchange = el.onblur = function () {
        var i = Number(el.getAttribute("data-line"));
        var field = el.getAttribute("data-field");
        var line = inv.lines[i];
        if (field === "qty") {
          var qn = parseFloat(el.value);
          line.qty = !qn || qn < 0 ? 1 : qn;
        } else if (field === "color") {
          line.color = el.value;
          var p = productById(line.productId);
          colorList(p).forEach(function (c) {
            if (c.name === line.color) {
              line.sellPrice = c.sellPrice;
              line.listedPrice = c.listedPrice;
            }
          });
        } else if (field === "discountPercent") {
          line.discountPercent = Number(el.value) || 0;
        } else if (field === "discountDollar") {
          line.discountDollar = Math.max(0, parseFloat(el.value) || 0);
        }
        scheduleSave(inv); renderInvoice(inv);
      };
    });
    appEl.querySelectorAll("[data-dmode]").forEach(function (btn) {
      btn.onclick = function () {
        var i = Number(btn.getAttribute("data-dmode"));
        inv.lines[i].discountMode = btn.getAttribute("data-m");
        scheduleSave(inv); renderInvoice(inv);
      };
    });
    appEl.querySelectorAll("[data-fsc]").forEach(function (btn) {
      btn.onclick = function () {
        inv.fscChoice = btn.getAttribute("data-fsc");
        if (inv.fscChoice === "yes" && (inv.fscAmount == null || inv.fscAmount === "")) {
          inv.fscAmount = settings().fscDefault;
        }
        scheduleSave(inv); renderInvoice(inv);
      };
    });
    appEl.querySelectorAll("[data-pay]").forEach(function (btn) {
      btn.onclick = function () {
        inv.payment = btn.getAttribute("data-pay");
        scheduleSave(inv); renderInvoice(inv);
      };
    });
    var pick = appEl.querySelector("[data-pick-cust]");
    if (pick) pick.onclick = function () { openCustomerPicker(inv); };
    var neu = appEl.querySelector("[data-new-cust]");
    if (neu) neu.onclick = function () { openCustomerForm(null, function (c) { inv.customerId = c.id; scheduleSave(inv); renderInvoice(inv); }); };
    var completeBtn = appEl.querySelector("[data-complete]");
    if (completeBtn && !blockers.length) {
      completeBtn.onclick = function () {
        putInvoice(inv);
        go("#/invoice/" + inv.id + "/sign");
      };
    }
  }

  function addLine(inv, productId) {
    var p = productById(productId);
    if (!p) return;
    var line = {
      id: uid(),
      productId: p.id,
      name: p.name,
      packNote: p.packNote || "",
      unit: p.unit,
      listedPrice: p.listedPrice,
      sellPrice: p.sellPrice,
      qty: 1,
      color: "",
      discountMode: "none",
      discountPercent: 0,
      discountDollar: 0
    };
    inv.lines.push(line);
    state.search = "";
    state.flashLine = line.id;
    scheduleSave(inv);
    if (isCountDoc(inv)) renderCountDoc(inv);
    else renderInvoice(inv);
    setTimeout(function () { state.flashLine = null; }, 800);
  }

  function bindSearch() {
    var q = document.getElementById("q");
    if (!q) return;
    q.focus();
    q.addEventListener("input", function () {
      state.search = q.value;
      var h = location.hash;
      if (h.indexOf("customers") !== -1) renderCustomers();
      else {
        var id = (h.split("/")[2] || "");
        var inv = getInvoice(id);
        if (inv) {
          if (isCountDoc(inv)) renderCountDoc(inv);
          else renderInvoice(inv);
        }
      }
      var q2 = document.getElementById("q");
      if (q2) {
        q2.focus();
        var len = q2.value.length;
        q2.setSelectionRange(len, len);
      }
    });
  }

  function openCustomerPicker(inv) {
    var list = customers();
    var body = list.length
      ? '<div class="list">' + list.map(function (c) {
          return '<button class="list-row" data-cid="' + c.id + '"><div class="grow"><strong>' +
            esc(c.name) + "</strong><small>" + esc(c.company || c.phone || "") + "</small></div></button>";
        }).join("") + "</div>"
      : '<div class="empty">No saved customers yet.</div>';
    showModal("<h3>Choose customer</h3>" + body +
      '<div class="actions"><button class="btn btn-ghost" data-close="1">Cancel</button>' +
      '<button class="btn btn-purple" data-create="1">Create new</button></div>', function (root) {
        root.querySelectorAll("[data-cid]").forEach(function (b) {
          b.onclick = function () {
            inv.customerId = b.getAttribute("data-cid");
            hideModal();
            scheduleSave(inv);
            renderInvoice(inv);
          };
        });
        root.querySelector("[data-create]").onclick = function () {
          hideModal();
          openCustomerForm(null, function (c) {
            inv.customerId = c.id;
            scheduleSave(inv);
            renderInvoice(inv);
          });
        };
      });
  }

  function openCustomerForm(existing, onSave) {
    var c = existing || { id: uid(), name: "", phone: "", company: "", notes: "" };
    showModal(
      "<h3>" + (existing ? "Edit customer" : "Create customer") + "</h3>" +
      '<div class="form-stack">' +
      '<label class="field-label">Name</label><input id="cn" value="' + esc(c.name) + '" placeholder="Required">' +
      '<label class="field-label">Phone</label><input id="cp" value="' + esc(c.phone || "") + '" inputmode="tel">' +
      '<label class="field-label">Company</label><input id="cc" value="' + esc(c.company || "") + '">' +
      '<label class="field-label">Notes</label><textarea id="cno">' + esc(c.notes || "") + "</textarea>" +
      '</div><div class="actions"><button class="btn btn-ghost" data-close="1">Cancel</button>' +
      '<button class="btn btn-purple" id="csave">Save</button></div>',
      function (root) {
        root.querySelector("#csave").onclick = function () {
          var name = root.querySelector("#cn").value.trim();
          if (!name) { toast("Name is required"); return; }
          c.name = name;
          c.phone = root.querySelector("#cp").value.trim();
          c.company = root.querySelector("#cc").value.trim();
          c.notes = root.querySelector("#cno").value.trim();
          putCustomer(c);
          hideModal();
          if (onSave) onSave(c);
          else renderCustomers();
        };
      }
    );
  }

  function showModal(html, bind) {
    hideModal();
    var wrap = document.createElement("div");
    wrap.className = "modal-back";
    wrap.innerHTML = '<div class="modal">' + html + "</div>";
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap || e.target.getAttribute("data-close")) hideModal();
    });
    document.body.appendChild(wrap);
    state.modal = wrap;
    if (bind) bind(wrap);
  }
  function hideModal() {
    if (state.modal) { state.modal.remove(); state.modal = null; }
  }

  function renderSign(inv) {
    if (inv.status === "complete") { go(docPath(inv) + "/done"); return; }
    var blockers = completeBlockers(inv);
    if (blockers.length) { go(docPath(inv)); toast(blockers[0]); return; }
    appEl.innerHTML =
      '<div class="screen sign-screen">' +
        topbar(isCountDoc(inv) ? "Sales rep signature" : "Customer signature", docPath(inv)) +
        '<p class="hint">' + (isCountDoc(inv) ? "Sales rep signs with their finger to complete." : "Have the customer sign with their finger.") + '</p>' +
        '<div class="sign-frame"><canvas id="sig"></canvas><div class="sign-hint" id="sigHint">Sign here</div></div>' +
        '<div class="sign-actions">' +
          '<button class="btn btn-ghost" id="sigClear">Clear</button>' +
          '<button class="btn btn-yellow" id="sigOk">Confirm signature</button>' +
        "</div>" +
      "</div>";
    var canvas = document.getElementById("sig");
    var hint = document.getElementById("sigHint");
    var ctx = canvas.getContext("2d");
    var drawing = false;
    var dirty = false;
    function size() {
      var r = canvas.parentElement.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    size();
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }
    function start(e) {
      e.preventDefault();
      drawing = true;
      dirty = true;
      hint.classList.add("hide");
      var p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    function end() { drawing = false; }
    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    document.getElementById("sigClear").onclick = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dirty = false;
      hint.classList.remove("hide");
    };
    document.getElementById("sigOk").onclick = function () {
      if (!dirty) { toast("Need a signature"); return; }
      inv.signature = canvas.toDataURL("image/png");
      inv.signedAt = new Date().toISOString();
      inv.status = "complete";
      inv.updatedAt = Date.now();
      putInvoice(inv);
      go(docPath(inv) + "/done");
    };
  }

  function lineDesc(line) {
    var bits = [line.name];
    if (line.color) bits.push(line.color);
    if (line.packNote) bits.push(line.packNote);
    return bits.join(" · ");
  }

  function invoiceDocHtml(inv) {
    var t = docType(inv);
    var brand = '<div class="doc-brand"><img src="img/logo-wide.png" alt="Lihmil"></div>' +
      '<p class="doc-addr">' + COMPANY.city + "<br>" + COMPANY.street + "<br>" + COMPANY.zip +
      "<br>Tel: " + COMPANY.tel + " · Fax: " + COMPANY.fax + "</p>";
    var signed = inv.signature
      ? '<div class="doc-sign"><b>' + (isCountDoc(inv) ? "Sales rep signature" : "Customer signature") +
        '</b><img src="' + inv.signature + '" alt="Signature">' +
        '<div class="when">Signed ' + esc(fmtDate((inv.signedAt || "").slice(0, 10)) || fmtDate(inv.date)) + "</div></div>"
      : "";
    if (t === "dump" || t === "inventory") {
      var heading = t === "dump" ? "DUMP LIST" : "INVENTORY REPORT";
      var rows = (inv.lines || []).map(function (l) {
        return "<tr><td class=\"c\">" + esc(l.qty) + "</td><td>" + esc(l.name) +
          (l.packNote ? " " + esc(l.packNote) : "") + "</td><td>" + esc(l.color || "—") + "</td></tr>";
      }).join("");
      return '<div class="invoice-doc">' + brand +
        '<div class="doc-heading">' + heading + "</div>" +
        '<div class="doc-meta">' +
          "<div><b>" + heading.split(" ")[0] + "</b> #" + padInv(inv.number) + "</div>" +
          "<div><b>DATE</b> " + esc(fmtDate(inv.date)) + "</div>" +
          "<div><b>ROUTE / TRUCK</b> " + esc((inv.routeTruck || "").trim() || "—") + "</div>" +
          "<div><b>ITEMS</b> " + (inv.lines || []).length + "</div>" +
        "</div>" +
        '<table class="doc-table"><thead><tr><th class="c">Qty</th><th>Item</th><th>Color</th></tr></thead>' +
        "<tbody>" + rows + "</tbody></table>" +
        signed +
      "</div>";
    }
    var cust = getCustomer(inv.customerId);
    var rows = (inv.lines || []).map(function (l) {
      var disc = lineDiscount(l);
      var sp = isSpecialPrice(l);
      return "<tr><td class=\"c\">" + esc(l.qty) + "</td><td>" + esc(lineDesc(l)) + spMark(l) +
        "</td><td class=\"r\">" + money(lineSell(l)) + "</td><td class=\"r\">" +
        (disc ? (sp ? "<b class=\"sp-mark\">SP</b> " : "") + "−" + money(disc) : "—") +
        "</td><td class=\"r\">" + money(lineTotal(l)) + (sp ? " <b class=\"sp-mark\">SP</b>" : "") + "</td></tr>";
    }).join("");
    if (inv.fscChoice === "yes") {
      rows += "<tr><td class=\"c\">1</td><td>Fuel surcharge</td><td class=\"r\">" +
        money(fscAmt(inv)) + "</td><td class=\"r\">—</td><td class=\"r\">" + money(fscAmt(inv)) + "</td></tr>";
    }
    return '<div class="invoice-doc">' +
      '<div class="doc-brand"><img src="img/logo-wide.png" alt="Lihmil"></div>' +
      '<p class="doc-addr">' + COMPANY.city + "<br>" + COMPANY.street + "<br>" + COMPANY.zip +
        "<br>Tel: " + COMPANY.tel + " · Fax: " + COMPANY.fax + "</p>" +
      '<div class="doc-meta">' +
        "<div><b>INVOICE</b> #" + padInv(inv.number) + "</div>" +
        "<div><b>DATE</b> " + esc(fmtDate(inv.date)) + "</div>" +
        "<div><b>CUSTOMER</b> " + esc((cust && cust.name) || "—") + "</div>" +
        "<div><b>PAYMENT</b> " + esc(inv.payment || "—") + "</div>" +
      "</div>" +
      '<table class="doc-table"><thead><tr><th class="c">Qty</th><th>Item</th><th class="r">Price</th><th class="r">Disc</th><th class="r">Amount</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table>" +
      '<div class="doc-foot">' +
        '<div class="totals-row" style="color:#555"><span>Merchandise</span><span>' + money(merchTotal(inv)) + "</span></div>" +
        (inv.fscChoice === "yes" ? '<div class="totals-row" style="color:#555"><span>Fuel surcharge</span><span>' + money(fscAmt(inv)) + "</span></div>" : "") +
        '<div class="totals-row" style="color:#555"><span>Tax</span><span>$0.00</span></div>' +
        '<div class="doc-total"><span>TOTAL AMOUNT DUE</span><b>' + money(grandTotal(inv)) + "</b></div>" +
      "</div>" +
      '<div class="doc-pay">Paid by <strong>' + esc(inv.payment || "—") + "</strong>" +
        (inv.fscChoice === "no" ? " · FSC waived" : "") + "</div>" +
      (inv.signature
        ? '<div class="doc-sign"><b>Customer signature</b><img src="' + inv.signature + '" alt="Signature">' +
          '<div class="when">Signed ' + esc(fmtDate((inv.signedAt || "").slice(0, 10)) || fmtDate(inv.date)) + "</div></div>"
        : "") +
    "</div>";
  }

  function renderDone(inv) {
    appEl.innerHTML =
      '<div class="screen done-screen">' +
        '<div class="no-print">' + topbar(typeLabel(inv) + " " + padInv(inv.number), "#/") +
        '<div class="doc-actions">' +
          '<button class="btn btn-purple" id="doPrint">Print / PDF</button>' +
          '<button class="btn btn-ghost" id="doShare">Share</button>' +
          '<button class="btn btn-yellow span2" data-go="#/">Done</button>' +
        "</div></div>" +
        invoiceDocHtml(inv) +
      "</div>";
    document.getElementById("doPrint").onclick = function () { window.print(); };
    document.getElementById("doShare").onclick = function () {
      if (navigator.share) {
        navigator.share({
          title: "Lihmil " + typeLabel(inv) + " " + padInv(inv.number),
          text: typeLabel(inv) + " " + padInv(inv.number) + (isCountDoc(inv) ? " · " + (inv.routeTruck || "") : " · Total due " + money(grandTotal(inv)))
        }).catch(function () {});
      } else {
        window.print();
      }
    };
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-go]");
    if (t) go(t.getAttribute("data-go"));
    var ed = e.target.closest("[data-edit-cust]");
    if (ed) openCustomerForm(getCustomer(ed.getAttribute("data-edit-cust")), function () { renderCustomers(); });
    var nc = e.target.closest("[data-new-cust]");
    if (nc && location.hash.indexOf("customers") !== -1) openCustomerForm(null, function () { renderCustomers(); });
  });

  window.addEventListener("hashchange", route);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
  route();
})();
