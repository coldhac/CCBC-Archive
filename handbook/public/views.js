(function () {
  "use strict";

  const C = window.CCBC;

  function buildDateLabel() {
    const raw = C.state.manifest?.builtAt || C.state.manifest?.generatedAt || C.state.manifest?.generated_at;
    if (!raw) return "本次构建";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Shanghai",
    }).format(date);
  }

  function shell(active, content, detail = "") {
    const nav = [
      ["search", "search", "现场检索"],
      ["quick", "scan-line", "一页速查"],
      ["mechanisms", "network", "机制索引"],
      ["puzzles", "library", "历年题库"],
      ["saved", "bookmark", "收藏与最近"],
      ["about", "info", "关于资料"],
    ];
    const navItems = nav.map(([route, iconName, label]) => `
      <a class="nav-item ${active === route ? "is-active" : ""}" href="${C.routeHref(route)}" data-nav="${route}">
        ${C.icon(iconName)}<span>${label}</span>
      </a>`).join("");
    const spoilerLabel = C.state.searchMode === "safe" ? "题面检索" : C.state.searchMode === "hints" ? "含提示检索" : "完整剧透检索";
    const spoilerTone = C.state.searchMode === "safe" ? "safe" : "danger";
    return `
      <div class="app-shell">
        <aside class="sidebar" aria-label="主导航">
          <a class="brand" href="#/search" aria-label="CCBC 卡题手册首页">
            <span class="brand-mark">C17</span>
            <span class="brand-copy"><strong>卡题手册</strong><small>CCBC FIELD MANUAL</small></span>
          </a>
          <nav class="side-nav">${navItems}</nav>
          <div class="sidebar-footer">
            <button class="spoiler-status spoiler-status-${spoilerTone}" data-action="search-mode" type="button">
              ${C.icon(C.state.searchMode === "safe" ? "shield-check" : "shield-alert")}
              <span><small>当前搜索范围</small><strong>${spoilerLabel}</strong></span>
            </button>
            <p>资料更新于 ${C.escapeHTML(buildDateLabel())}</p>
          </div>
        </aside>
        <div class="workspace">
          <header class="topbar">
            <button class="icon-button mobile-menu-button" type="button" data-action="mobile-menu" aria-label="打开导航">${C.icon("menu")}</button>
            <a class="mobile-brand" href="#/search"><span class="brand-mark">C17</span><strong>卡题手册</strong></a>
            <button class="top-search-trigger" type="button" data-action="focus-search">
              ${C.icon("search")}<span>搜索题面、症状或机制</span><kbd>Ctrl K</kbd>
            </button>
            <button class="icon-button" type="button" data-action="search-mode" aria-label="切换搜索范围">${C.icon(C.state.searchMode === "safe" ? "shield-check" : "shield-alert")}</button>
          </header>
          <div class="content-frame ${detail ? "has-detail" : ""}">
            <main class="main-content" id="main-content">${content}</main>
            ${detail ? `<aside class="detail-panel">${detail}</aside>` : ""}
          </div>
        </div>
        <nav class="bottom-nav" aria-label="移动端导航">${nav.filter(([route]) => route !== "about").map(([route, iconName, label]) => `
          <a class="bottom-nav-item ${active === route ? "is-active" : ""}" href="${C.routeHref(route)}">${C.icon(iconName)}<span>${label.replace("与最近", "")}</span></a>`).join("")}</nav>
      </div>`;
  }

  function pageHeader(eyebrow, title, description = "", actions = "") {
    return `<header class="page-header">
      <div class="page-header-copy"><span class="eyebrow">${C.escapeHTML(eyebrow)}</span><h1>${C.escapeHTML(title)}</h1>${description ? `<p>${C.escapeHTML(description)}</p>` : ""}</div>
      ${actions ? `<div class="page-actions">${actions}</div>` : ""}
    </header>`;
  }

  function resultCard(result) {
    const record = result.record || result;
    const matchField = result.matchField || result.doc?.matchField || result.doc?.field || "safe";
    const matchFieldLabel = result.matchFieldLabel || C.SEARCH_FIELD_LABELS[matchField] || "题面";
    const protectedMatch = matchField !== "safe" && matchField !== "title";
    const badges = [
      C.badge(C.formatEvent(record), "event"),
      C.badge(C.kindLabel(record.kind), record.kind === "final_meta" ? "danger" : "neutral")
    ];
    if (record.contentStatus && record.contentStatus !== "available") badges.push(C.badge(C.statusLabel(record.contentStatus), "warning"));
    return `<article class="result-card puzzle-card">
      <a class="result-card-link" href="${C.routeHref("puzzle", record.id)}" aria-label="打开 ${C.escapeHTML(record.title)}"></a>
      <div class="result-card-top"><div class="badge-row">${badges.join("")}</div><button class="icon-button favorite-button ${C.state.favorites.has(record.id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${C.escapeHTML(record.id)}" aria-label="收藏这道题">${C.icon("bookmark")}</button></div>
      <h3>${C.escapeHTML(record.title || "未命名题目")}</h3>
      <p class="result-meta">${C.escapeHTML(record.area || "未标分区")}${record.authors?.length ? ` · ${C.escapeHTML(record.authors.join("、"))}` : ""}</p>
      ${protectedMatch ? `<p class="protected-match">${C.icon("shield-alert")} 命中${C.escapeHTML(matchFieldLabel)}，为避免剧透不显示原文</p>` : result.snippet ? `<p class="result-snippet">${C.escapeHTML(result.snippet)}</p>` : ""}
      <footer class="result-footer">
        <span>${record.hintCount || 0} 条提示</span><span>${record.assetCount || 0} 个附件</span>${record.hasSolution ? "<span>有官方题解</span>" : ""}
        ${C.icon("arrow-right")}
      </footer>
    </article>`;
  }

  function guideSearchCard(result) {
    const item = result.item;
    const isSymptom = result.type === "symptom";
    const href = C.routeHref(isSymptom ? "symptom" : "mechanism", item.id);
    return `<article class="result-card guide-card">
      <a class="result-card-link" href="${href}" aria-label="打开 ${C.escapeHTML(item.name)}"></a>
      <div class="result-card-top">${C.badge(isSymptom ? "卡点" : result.axis?.name || "机制", isSymptom ? "warning" : "accent")}<span class="result-type-icon">${C.icon(isSymptom ? "circle-help" : "route")}</span></div>
      <h3>${C.escapeHTML(item.name)}</h3>
      <p>${C.escapeHTML(item.description || item.nextStep || "")}</p>
      ${item.quickTest ? `<footer class="result-footer"><span>有快速验证</span>${C.icon("arrow-right")}</footer>` : ""}
    </article>`;
  }

  function recentAndFavorites() {
    const recentRecords = C.state.recents.map((id) => C.state.byId.get(id)).filter(Boolean).slice(0, 5);
    const favorites = [...C.state.favorites].map((id) => C.state.byId.get(id)).filter(Boolean).slice(0, 5);
    const renderMini = (records, empty) => records.length ? records.map((record) => `<a class="mini-result" href="${C.routeHref("puzzle", record.id)}"><span>${C.escapeHTML(record.title)}</span><small>${C.escapeHTML(C.formatEvent(record))}</small>${C.icon("chevron-right")}</a>`).join("") : `<p class="small-empty">${empty}</p>`;
    return `<div class="home-secondary">
      <section><div class="section-header"><h2>最近查看</h2><a href="#/saved">全部</a></div>${renderMini(recentRecords, "打开过的题目会保留在这里。")}</section>
      <section><div class="section-header"><h2>已收藏</h2><a href="#/saved">全部</a></div>${renderMini(favorites, "收藏常用题目和机制，现场更快返回。")}</section>
    </div>`;
  }

  async function searchView(route) {
    const query = route.query.get("q") || "";
    const event = route.query.get("event") || "";
    const kind = route.query.get("kind") || "";
    const includeSubpuzzles = route.query.get("sub") === "1";
    const symptoms = (window.CCBC_GUIDE?.symptoms || []).slice(0, 8);
    let results = [];
    let guideResults = [];
    if (query) {
      [results, guideResults] = await Promise.all([
        C.searchPuzzles(query, { event, kind, includeSubpuzzles }),
        Promise.resolve(C.searchGuide(query))
      ]);
    }
    const events = [...new Set(C.state.catalog.map((record) => record.eventId))].sort();
    const searchModeText = C.state.searchMode === "safe" ? "仅题面" : C.state.searchMode === "hints" ? "题面 + 官方提示" : "题面 + 提示 + 答案与题解";
    const form = `<form class="search-form" data-search-form>
      <div class="search-box search-box-large">${C.icon("search")}<input id="global-search" name="q" value="${C.escapeHTML(query)}" placeholder="输入你看到的东西：01、六个点、颜色、乱码、不会提取…" autocomplete="off"><button class="icon-button clear-search ${query ? "" : "is-hidden"}" type="button" data-action="clear-search" aria-label="清空搜索">${C.icon("x")}</button><button class="primary-button" type="submit">检索</button></div>
      <div class="filter-bar">
        <label><span>届次</span><select name="event"><option value="">全部</option>${events.map((id) => `<option value="${C.escapeHTML(id)}" ${event === id ? "selected" : ""}>${C.escapeHTML(C.formatEvent({ eventId: id }))}</option>`).join("")}</select></label>
        <label><span>类型</span><select name="kind"><option value="">全部</option>${Object.entries(C.KIND_LABELS).map(([id, label]) => `<option value="${id}" ${kind === id ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label class="checkbox-label"><input type="checkbox" name="sub" value="1" ${includeSubpuzzles ? "checked" : ""}><span>包含复合题子题</span></label>
        <button class="search-scope-button ${C.state.searchMode === "safe" ? "" : "is-spoiler"}" type="button" data-action="search-mode">${C.icon(C.state.searchMode === "safe" ? "shield-check" : "shield-alert")} ${searchModeText}</button>
      </div>
    </form>`;

    let body = "";
    if (!query) {
      body = `<section class="search-entry-section"><div class="section-header"><div><span class="eyebrow">从卡点开始</span><h2>你现在卡在哪里？</h2></div><a href="#/mechanisms">浏览全部机制</a></div>
        <div class="symptom-grid">${symptoms.map((item) => `<a class="symptom-chip" href="${C.routeHref("symptom", item.id)}"><span>${C.escapeHTML(item.shortName || item.name)}</span>${C.icon("arrow-up-right")}</a>`).join("")}</div>
      </section>
      <section class="signal-shortcuts"><div class="section-header"><h2>描述你看到的信号</h2></div><div class="filter-chip-row">${["一串 0/1", "两位数字一组", "颜色或色块", "长篇文字", "方格与路径", "乱码或中间串", "图片与图标", "音频与节奏"].map((label) => `<a class="filter-chip" href="#/search?q=${encodeURIComponent(label)}">${C.escapeHTML(label)}</a>`).join("")}</div></section>
      <a class="quick-banner" href="#/quick"><span>${C.icon("scan-line")}</span><div><strong>一页速查</strong><p>先排查排序与提取，再查常用编码。</p></div>${C.icon("arrow-right")}</a>
      ${recentAndFavorites()}`;
    } else if (!results.length && !guideResults.length) {
      body = `<div class="empty-state">${C.icon("search-x")}<h2>没有找到直接匹配</h2><p>试着描述可观察现象，不必先猜机制名。例如“每行都有一个颜色”“得到八个无意义字母”。</p><div class="empty-actions"><button class="secondary-button" data-action="clear-filters" type="button">清除筛选</button>${C.state.searchMode === "safe" ? `<button class="danger-button" data-action="enable-hint-search" type="button">允许搜索官方提示</button>` : ""}</div></div>`;
    } else {
      body = `${guideResults.length ? `<section class="result-section"><div class="section-header"><div><span class="eyebrow">下一步</span><h2>卡点与机制</h2></div><span>${guideResults.length} 项</span></div><div class="result-list guide-results">${guideResults.map(guideSearchCard).join("")}</div></section>` : ""}
        ${results.length ? `<section class="result-section"><div class="section-header"><div><span class="eyebrow">历史先例</span><h2>历年题目</h2></div><span>按题族折叠 · ${results.length} 项</span></div><div class="result-list">${results.map(resultCard).join("")}</div></section>` : ""}`;
    }
    return shell("search", `<div class="search-page"><div class="search-intro"><span class="eyebrow">CCBC FIELD MANUAL</span><h1>${query ? "检索结果" : "先描述你看到的东西"}</h1><p>${query ? `当前搜索范围：${searchModeText}` : "从可观察信号出发，找到一个可以马上验证的下一步。历史提示与题解默认不会出现在结果里。"}</p></div>${form}${body}</div>`);
  }

  function quickList(title, items, iconName) {
    return `<section class="quick-section"><div class="quick-section-title">${C.icon(iconName)}<h2>${C.escapeHTML(title)}</h2></div><ol>${items.map((item) => typeof item === "string" ? `<li>${C.escapeHTML(item)}</li>` : `<li><strong>${C.escapeHTML(item.title || item.signal || "")}</strong>${item.description || item.candidates || item.try ? `<span>${C.escapeHTML(item.description || item.candidates || item.try)}</span>` : ""}</li>`).join("")}</ol></section>`;
  }

  function quickView() {
    const quick = window.CCBC_GUIDE?.quick || {};
    const signals = quick.signals || [];
    const codes = quick.codes || [];
    const content = `${pageHeader("现场手册", "一页速查", "排序与提取优先。每做一步，记录输入、参数和输出，保证队友能复现。", `<button class="secondary-button" type="button" data-action="print">${C.icon("printer")} 打印</button>`)}
      <div class="quick-grid">
        ${quickList("卡题阶梯", quick.stuckLadder || [], "stairs")}
        ${quickList("排序检查", quick.sorting || [], "arrow-down-narrow-wide")}
        ${quickList("提取检查", quick.extraction || [], "scan-text")}
        <section class="quick-section quick-wide"><div class="quick-section-title">${C.icon("radar")}<h2>信号 → 候选机制</h2></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>看到什么</th><th>优先怀疑</th><th>最小实验</th></tr></thead><tbody>${signals.map((row) => `<tr><td>${C.escapeHTML(row.signal)}</td><td>${C.escapeHTML(Array.isArray(row.candidates) ? row.candidates.join(" / ") : row.candidates || "")}</td><td>${C.escapeHTML(row.try || row.quickTest || "")}</td></tr>`).join("")}</tbody></table></div></section>
        <section class="quick-section quick-wide"><div class="quick-section-title">${C.icon("binary")}<h2>常用编码与表示</h2></div><div class="code-reference-grid">${codes.map((row) => `<article><h3>${C.escapeHTML(row.name)}</h3><code>${C.escapeHTML(row.pattern || row.signal || "")}</code><p>${C.escapeHTML(row.use || row.description || "")}</p>${row.check ? `<small>${C.escapeHTML(row.check)}</small>` : ""}</article>`).join("")}</div></section>
      </div>`;
    return shell("quick", content);
  }

  function mechanismCard(axis, item) {
    return `<article class="mechanism-card"><a class="result-card-link" href="${C.routeHref("mechanism", item.id)}"></a><span class="mechanism-code">${C.escapeHTML(item.id.toUpperCase())}</span><h3>${C.escapeHTML(item.name)}</h3><p>${C.escapeHTML(item.description || "")}</p><footer>${(item.signals || []).slice(0, 3).map((signal) => C.badge(signal, "neutral")).join("")}${C.icon("arrow-right")}</footer></article>`;
  }

  function mechanismsView() {
    const axes = window.CCBC_GUIDE?.axes || [];
    const content = `${pageHeader("机制地图", "从表征到提取", "机制采用多轴标签：同一道题可以同时属于一种载体、一种核心操作和一种提取结构。")}
      <div class="axis-tabs segmented-control" role="tablist">${axes.map((axis, index) => `<button type="button" role="tab" class="${index === 0 ? "is-active" : ""}" data-action="axis-tab" data-axis="${C.escapeHTML(axis.id)}">${C.escapeHTML(axis.name)}</button>`).join("")}</div>
      <div class="axis-sections">${axes.map((axis, index) => `<section class="axis-section ${index === 0 ? "is-active" : ""}" data-axis-section="${C.escapeHTML(axis.id)}"><div class="axis-intro"><span>${C.escapeHTML(axis.id.toUpperCase())}</span><div><h2>${C.escapeHTML(axis.name)}</h2><p>${C.escapeHTML(axis.description || "")}</p></div></div><div class="mechanism-grid">${(axis.items || []).map((item) => mechanismCard(axis, item)).join("")}</div></section>`).join("")}</div>`;
    return shell("mechanisms", content);
  }

  function representativePuzzles(ids) {
    const records = (ids || []).map((id) => C.state.byId.get(id)).filter(Boolean);
    if (!records.length) return "";
    return `<section class="reference-section"><div class="section-header"><div><span class="eyebrow">历史先例</span><h2>代表题目</h2></div><span>打开后题解仍保持折叠</span></div><div class="result-list">${records.map((record) => resultCard({ record })).join("")}</div></section>`;
  }

  function mechanismView(id) {
    const found = C.mechanismById(id);
    if (!found) return notFoundView("没有这个机制条目");
    const { axis, item } = found;
    const content = `<div class="breadcrumbs"><a href="#/mechanisms">机制索引</a>${C.icon("chevron-right")}<span>${C.escapeHTML(axis.name)}</span></div>
      ${pageHeader(axis.name, item.name, item.description || "", `<button class="icon-button favorite-button ${C.state.favorites.has(item.id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${C.escapeHTML(item.id)}" aria-label="收藏机制">${C.icon("bookmark")}</button>`)}
      <div class="mechanism-detail-grid">
        <section class="detail-block"><span class="block-label">如何认出</span><h2>可观察信号</h2><ul class="check-list">${(item.signals || []).map((signal) => `<li>${C.icon("eye")}<span>${C.escapeHTML(signal)}</span></li>`).join("")}</ul></section>
        <section class="detail-block detail-block-accent"><span class="block-label">90 秒验证</span><h2>先做一个可证伪实验</h2><p>${C.escapeHTML(item.quickTest || "选择一个最短样本，验证候选规则能否稳定复现，而不是只解释一个巧合。")}</p></section>
        <section class="detail-block"><span class="block-label">执行</span><h2>建议步骤</h2><ol>${(item.steps || []).map((step) => `<li>${C.escapeHTML(step)}</li>`).join("")}</ol></section>
        <section class="detail-block"><span class="block-label">校验</span><h2>常见误区</h2><ul>${(item.pitfalls || []).map((step) => `<li>${C.escapeHTML(step)}</li>`).join("")}</ul></section>
      </div>${representativePuzzles(item.representativeIds)}`;
    return shell("mechanisms", content, `<div class="detail-toc"><span class="eyebrow">别名</span><div class="tag-cloud">${(item.aliases || []).map((entry) => C.badge(entry, "neutral")).join("") || "无"}</div><hr><p>机制条目只提供通用验证思路。历史题目的官方提示、答案和题解需要在题目详情中主动展开。</p></div>`);
  }

  function symptomView(id) {
    const item = C.symptomById(id);
    if (!item) return notFoundView("没有这个卡点条目");
    const content = `<div class="breadcrumbs"><a href="#/search">现场检索</a>${C.icon("chevron-right")}<span>卡点诊断</span></div>
      ${pageHeader("卡点诊断", item.name, item.description || item.nextStep || "")}
      <div class="symptom-detail">
        <section class="detail-block detail-block-accent"><span class="block-label">现在先做</span><h2>下一小步</h2><p>${C.escapeHTML(item.nextStep || "先把可观察事实和自己的猜测分开记录。")}</p></section>
        <section class="detail-block"><span class="block-label">核对</span><h2>问自己这些问题</h2><ul class="check-list">${(item.quickQuestions || item.signals || []).map((question) => `<li>${C.icon("check-square")}<span>${C.escapeHTML(question)}</span></li>`).join("")}</ul></section>
        <section class="detail-block"><span class="block-label">常见说法</span><h2>你可能会这样描述</h2><div class="tag-cloud">${(item.aliases || []).map((entry) => C.badge(entry, "neutral")).join("")}</div></section>
      </div>${representativePuzzles(item.representativeIds)}`;
    return shell("search", content);
  }

  function filterPuzzles(route) {
    const query = C.normalize(route.query.get("q") || "");
    const event = route.query.get("event") || "";
    const kind = route.query.get("kind") || "";
    const status = route.query.get("status") || "";
    const parentOnly = route.query.get("root") !== "0";
    return C.state.catalog.filter((record) => {
      if (event && record.eventId !== event) return false;
      if (kind && record.kind !== kind) return false;
      if (status && record.contentStatus !== status && record.solutionStatus !== status) return false;
      if (parentOnly && record.kind === "subpuzzle") return false;
      if (query && !C.normalize(`${record.title} ${record.area} ${(record.authors || []).join(" ")}`).includes(query)) return false;
      return true;
    });
  }

  function puzzlesView(route) {
    const records = filterPuzzles(route);
    const visible = records.slice(0, C.state.puzzleVisible);
    const events = [...new Set(C.state.catalog.map((record) => record.eventId))].sort();
    const event = route.query.get("event") || "";
    const kind = route.query.get("kind") || "";
    const q = route.query.get("q") || "";
    const rootOnly = route.query.get("root") !== "0";
    const content = `${pageHeader("完整索引", "历年题库", `共 ${C.state.catalog.length} 条规范化记录；当前筛选 ${records.length} 条。题面可直接查看，所有剧透字段独立加载。`)}
      <form class="library-toolbar" data-library-form><div class="search-box">${C.icon("search")}<input name="q" value="${C.escapeHTML(q)}" placeholder="按题名、分区或作者筛选"><button class="icon-button" type="submit" aria-label="筛选">${C.icon("arrow-right")}</button></div><select name="event"><option value="">全部届次</option>${events.map((id) => `<option value="${id}" ${event === id ? "selected" : ""}>${C.escapeHTML(C.formatEvent({ eventId: id }))}</option>`).join("")}</select><select name="kind"><option value="">全部类型</option>${Object.entries(C.KIND_LABELS).map(([id, label]) => `<option value="${id}" ${kind === id ? "selected" : ""}>${label}</option>`).join("")}</select><label class="checkbox-label"><input name="root" value="0" type="checkbox" ${rootOnly ? "" : "checked"}><span>显示复合题子题</span></label></form>
      <div class="result-list library-list">${visible.map((record) => resultCard({ record })).join("")}</div>
      ${visible.length < records.length ? `<button class="load-more-button" type="button" data-action="load-more-puzzles">再显示 ${Math.min(C.state.puzzlePageSize, records.length - visible.length)} 条</button>` : ""}`;
    return shell("puzzles", content);
  }

  function safeProse(html, text) {
    if (html) return `<div class="content-prose">${html}</div>`;
    if (text) return `<div class="content-prose"><pre class="plain-content">${C.escapeHTML(text)}</pre></div>`;
    return `<div class="content-missing">${C.icon("file-question")}<p>官方资料中没有可展示的正文。</p></div>`;
  }

  function assetItem(asset, spoiler = false) {
    const path = C.sourcePath(asset.path || asset.localPath || asset.local_path || asset.url);
    const mime = asset.mime || asset.mediaType || asset.media_type || "application/octet-stream";
    const name = (asset.path || asset.local_path || asset.url || "附件").split("/").pop();
    if (mime.startsWith("image/")) return `<button class="asset-item image-asset" type="button" data-action="view-media" data-src="${C.escapeHTML(path)}" data-name="${C.escapeHTML(name)}"><img src="${C.escapeHTML(path)}" alt="${spoiler ? "已展开的剧透图片" : C.escapeHTML(name)}" loading="lazy"><span>${C.icon("maximize-2")}查看原图</span></button>`;
    if (mime.startsWith("audio/")) return `<div class="asset-item audio-asset"><audio controls preload="none" src="${C.escapeHTML(path)}"></audio><a href="${C.escapeHTML(path)}" download>${C.icon("download")} ${C.escapeHTML(name)}</a></div>`;
    if (mime.startsWith("video/")) return `<div class="asset-item video-asset"><video controls preload="metadata" src="${C.escapeHTML(path)}"></video><a href="${C.escapeHTML(path)}" download>${C.icon("download")} ${C.escapeHTML(name)}</a></div>`;
    if (mime === "application/pdf") return `<a class="asset-item file-asset" href="${C.escapeHTML(path)}" target="_blank" rel="noopener">${C.icon("file-text")}<span><strong>${C.escapeHTML(name)}</strong><small>PDF · 在新标签打开</small></span></a>`;
    return `<a class="asset-item file-asset" href="${C.escapeHTML(path)}" download>${C.icon("paperclip")}<span><strong>${C.escapeHTML(name)}</strong><small>${C.escapeHTML(mime)} · 仅下载，不执行</small></span></a>`;
  }

  function assetGrid(assets, spoiler = false) {
    if (!assets?.length) return "";
    return `<div class="asset-grid">${assets.map((asset) => assetItem(asset, spoiler)).join("")}</div>`;
  }

  function unembeddedAssets(html, assets) {
    const source = String(html || "");
    return (assets || []).filter((asset) => !source.includes(`data-asset-id="${asset.id}"`));
  }

  function spoilerPlaceholder(kind, record, extra = {}) {
    const config = {
      hints: ["lightbulb", "逐条查看官方提示", `${record.hintCount} 条，按官方顺序逐条展开。后续标题不会提前显示。`],
      answer: ["key-round", "显示最终答案", "这会直接揭示本题答案，需要再次确认。"],
      solution: ["book-open-check", "展开完整官方题解", "完整题解可能在开头直接出现答案与全部中间步骤。"],
      additional: ["message-square-text", "查看中间答案反馈", `${record.additionalAnswerCount} 条里程碑或错误答案反馈。`],
      extended: ["panel-bottom-open", "查看解题后内容", "这是提交或解锁后才显示的补充内容。"],
      archive: ["code-2", "查看交互源码与档案", "源码只作为文本显示，手册不会执行其中代码。"]
    }[kind];
    if (!config) return "";
    return `<section class="spoiler-section" data-spoiler-section="${kind}"><button class="spoiler-trigger ${kind === "answer" || kind === "solution" ? "spoiler-trigger-high" : ""}" type="button" data-action="reveal-spoiler" data-kind="${kind}" data-id="${C.escapeHTML(record.id)}">${C.icon(config[0])}<span><strong>${config[1]}</strong><small>${config[2]}</small></span>${C.icon("chevron-down")}</button><div class="spoiler-content" data-spoiler-content="${kind}"></div></section>`;
  }

  function availabilityBadges(record) {
    const values = [C.badge(C.formatEvent(record), "event"), C.badge(C.kindLabel(record.kind), "neutral")];
    if (record.contentStatus !== "available") values.push(C.badge(C.statusLabel(record.contentStatus), "warning"));
    if (record.hasInteractive) values.push(C.badge("交互题", "accent"));
    if (record.parentId) values.push(C.badge("有父题", "neutral"));
    return values.join("");
  }

  async function puzzleView(id) {
    const loaded = await C.loadRecord(id);
    if (!loaded) return notFoundView("没有找到这道题");
    const { catalog: record, core } = loaded;
    C.addRecent(id);
    const content = core?.content || {};
    const question = content.question || { html: core?.questionHtml || core?.question_html, text: core?.questionText || core?.question_text };
    const assets = content.assets || core?.assets || core?.questionAssets || core?.question_assets || [];
    const parentId = record.parentId || C.state.relations.parents[id];
    const solutionRef = C.state.relations.solutionRefs[id];
    const children = (C.state.relations.children[id] || []).map((childId) => C.state.byId.get(childId)).filter(Boolean);
    const visibleChildren = children.slice(0, C.state.childVisible);
    const provenance = core?.provenance || {};
    const sourceUrl = provenance.sourceUrl || provenance.source_url || core?.sourceUrl || record.sourceUrl;
    const questionHTML = question.html || question.safeHtml || question.markdownHtml || question.markdown_html || core?.questionHtml || core?.question_html;
    const questionText = question.text || core?.questionText || core?.question_text;
    const actions = `<button class="icon-button favorite-button ${C.state.favorites.has(id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${C.escapeHTML(id)}" aria-label="收藏题目">${C.icon("bookmark")}</button>`;
    const contentHtml = `<div class="breadcrumbs"><a href="#/puzzles">历年题库</a>${C.icon("chevron-right")}<span>${C.escapeHTML(C.formatEvent(record))}</span>${record.area ? `${C.icon("chevron-right")}<span>${C.escapeHTML(record.area)}</span>` : ""}</div>
      <article class="puzzle-detail" data-puzzle-id="${C.escapeHTML(id)}">
        ${pageHeader(record.area || C.kindLabel(record.kind), record.title || "未命名题目", record.authors?.length ? `作者：${record.authors.join("、")}` : "", actions)}
        <div class="badge-row puzzle-badges">${availabilityBadges(record)}</div>
        ${parentId ? `<a class="relation-banner" href="${C.routeHref("puzzle", parentId)}">${C.icon("corner-up-left")}<span><strong>返回父题</strong><small>${C.escapeHTML(C.state.byId.get(parentId)?.title || parentId)}${solutionRef ? " · 本题官解由父题提供" : ""}</small></span>${C.icon("arrow-right")}</a>` : ""}
        <section class="question-section"><div class="section-header"><div><span class="eyebrow">QUESTION</span><h2>题面</h2></div><span>${C.escapeHTML(C.statusLabel(record.contentStatus))}</span></div>${safeProse(questionHTML, questionText)}${assetGrid(unembeddedAssets(questionHTML, assets))}</section>
        <div class="spoiler-stack">
          ${record.hintCount ? spoilerPlaceholder("hints", record) : ""}
          ${record.additionalAnswerCount ? spoilerPlaceholder("additional", record) : ""}
          ${record.hasSolution || solutionRef ? spoilerPlaceholder("solution", record) : ""}
          ${record.hasAnswer ? spoilerPlaceholder("answer", record) : ""}
          ${record.hasExtended ? spoilerPlaceholder("extended", record) : ""}
          ${record.hasInteractive ? spoilerPlaceholder("archive", record) : ""}
        </div>
        ${children.length ? `<section class="children-section"><div class="section-header"><div><span class="eyebrow">COMPOSITE</span><h2>包含 ${children.length} 个子题</h2></div><span>默认按题族折叠检索</span></div><div class="children-list">${visibleChildren.map((child) => `<a href="${C.routeHref("puzzle", child.id)}"><span>${C.escapeHTML(child.title)}</span><small>${C.escapeHTML(child.area || C.kindLabel(child.kind))}</small>${C.icon("chevron-right")}</a>`).join("")}</div>${visibleChildren.length < children.length ? `<button class="load-more-button" type="button" data-action="load-more-children">再显示 ${Math.min(80, children.length - visibleChildren.length)} 个子题</button>` : ""}</section>` : ""}
      </article>`;
    const detail = `<div class="detail-toc"><span class="eyebrow">资料状态</span><dl><div><dt>题面格式</dt><dd>${C.escapeHTML(record.contentFormat || "未知")}</dd></div><div><dt>官方提示</dt><dd>${record.hintCount}</dd></div><div><dt>附件</dt><dd>${record.assetCount}</dd></div><div><dt>题解</dt><dd>${C.escapeHTML(C.statusLabel(record.solutionStatus))}</dd></div></dl>${sourceUrl ? `<a class="source-link" href="${C.escapeHTML(sourceUrl)}" target="_blank" rel="noopener">${C.icon("external-link")} 查看官方来源</a>` : ""}<hr><p>未展开的剧透内容不在当前页面正文中。刷新或重新打开链接后会恢复折叠。</p></div>`;
    return shell("puzzles", contentHtml, detail);
  }

  function spoilerAssets(data, key, assetIds = []) {
    const nested = data?.assets?.[key] || data?.[`${key}Assets`] || data?.[key]?.assets;
    if (Array.isArray(nested)) return assetGrid(nested, true);
    const ids = new Set(assetIds || data?.[key]?.assetIds || []);
    const contexts = key === "hints" ? ["hint:"] : key === "additional" ? ["additionalAnswer"] : [key];
    const assets = (Array.isArray(data?.assets) ? data.assets : []).filter((asset) => {
      if (ids.has(asset.id)) return true;
      return (asset.contexts || []).some((context) => contexts.some((prefix) => context === prefix || context.startsWith(prefix)));
    });
    return assetGrid(assets, true);
  }

  function renderSpoiler(kind, data, progress = 0) {
    if (kind === "hints") {
      const hints = data.hints || [];
      const shown = hints.slice(0, Math.max(1, progress || 1));
      const allAssets = Array.isArray(data.assets) ? data.assets : [];
      return `<div class="revealed-block"><div class="revealed-heading">${C.icon("lightbulb")}<div><span>官方提示</span><small>已显示 ${shown.length} / ${hints.length}</small></div></div><div class="hint-list">${shown.map((hint, index) => { const hintHtml = hint.html || hint.markdownHtml || hint.markdown_html || ""; const hintAssets = allAssets.filter((asset) => (hint.assetIds || []).includes(asset.id) || (asset.contexts || []).includes(`hint:${hint.number || index + 1}`)); return `<article class="hint-item"><span class="hint-number">${index + 1}</span><div>${hint.title ? `<h3>${C.escapeHTML(hint.title)}</h3>` : ""}${safeProse(hintHtml, hint.text)}${assetGrid(unembeddedAssets(hintHtml, hint.assets || hintAssets), true)}</div></article>`; }).join("")}</div>${shown.length < hints.length ? `<button class="secondary-button" type="button" data-action="next-hint">${C.icon("chevron-down")} 显示下一条提示</button>` : ""}</div>`;
    }
    if (kind === "answer") return `<div class="revealed-block answer-reveal"><span>最终答案</span><strong>${C.escapeHTML(data.answer || "（官方未填写答案）")}</strong><button class="icon-button" type="button" data-action="copy-answer" data-answer="${C.escapeHTML(data.answer || "")}" aria-label="复制答案">${C.icon("copy")}</button></div>`;
    if (kind === "additional") {
      const answers = data.additionalAnswers || data.additional_answers || [];
      return `<div class="revealed-block"><div class="revealed-heading">${C.icon("message-square-text")}<div><span>中间答案反馈</span><small>${answers.length} 条</small></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>提交内容</th><th>系统反馈</th><th>附加动作</th></tr></thead><tbody>${answers.map((item) => `<tr><td><code>${C.escapeHTML(item.answer)}</code></td><td>${item.messageHtml ? `<div class="content-prose compact">${item.messageHtml}</div>` : C.escapeHTML(item.messageText || item.message || "")}</td><td>${item.extraHtml ? `<div class="content-prose compact">${item.extraHtml}</div>` : C.escapeHTML(item.extraText || item.extra || "—")}</td></tr>`).join("")}</tbody></table></div>${spoilerAssets(data, "additional", answers.flatMap((item) => item.assetIds || []))}</div>`;
    }
    if (kind === "solution") {
      const solution = data.solution || {};
      const solutionHtml = solution.html || solution.markdownHtml || solution.markdown_html || "";
      const solutionAssets = (Array.isArray(data.assets) ? data.assets : []).filter((asset) => (solution.assetIds || []).includes(asset.id) || (asset.contexts || []).includes("solution"));
      return `<div class="revealed-block"><div class="revealed-heading">${C.icon("book-open-check")}<div><span>完整官方题解</span><small>${C.escapeHTML(C.statusLabel(solution.status || data.solutionStatus || ""))}</small></div></div>${safeProse(solutionHtml, solution.text)}${assetGrid(unembeddedAssets(solutionHtml, solution.assets || solutionAssets), true)}</div>`;
    }
    if (kind === "extended") {
      const extended = data.extended || data.extendedContent || data.extended_content || {};
      const extendedHtml = extended.html || extended.markdownHtml || extended.markdown_html || "";
      const extendedAssets = (Array.isArray(data.assets) ? data.assets : []).filter((asset) => (extended.assetIds || []).includes(asset.id) || (asset.contexts || []).includes("extended"));
      return `<div class="revealed-block"><div class="revealed-heading">${C.icon("panel-bottom-open")}<div><span>解题后内容</span><small>官方扩展内容</small></div></div>${safeProse(extendedHtml, extended.text)}${assetGrid(unembeddedAssets(extendedHtml, extended.assets || extendedAssets), true)}</div>`;
    }
    if (kind === "archive") {
      const archive = data.archive || {};
      const interactive = archive.interactive || data.interactive || {};
      const blocks = Object.entries(interactive).map(([name, value]) => `<details class="code-archive"><summary>${C.escapeHTML(name)}</summary><pre><code>${C.escapeHTML(typeof value === "string" ? value : JSON.stringify(value, null, 2))}</code></pre></details>`).join("");
      return `<div class="revealed-block"><div class="revealed-heading">${C.icon("code-2")}<div><span>交互源码与档案</span><small>只读显示，绝不执行</small></div></div>${blocks || "<p>没有可显示的交互源码。</p>"}</div>`;
    }
    return "";
  }

  function savedView() {
    const favoriteRecords = [...C.state.favorites].map((id) => C.state.byId.get(id)).filter(Boolean);
    const favoriteMechanisms = [...C.state.favorites].map((id) => C.mechanismById(id)).filter(Boolean);
    const recent = C.state.recents.map((id) => C.state.byId.get(id)).filter(Boolean);
    const content = `${pageHeader("个人工作区", "收藏与最近", "只保存在当前浏览器，不会上传。收藏不会记录你展开过哪些剧透。")}
      <section class="saved-section"><div class="section-header"><h2>收藏的题目</h2><span>${favoriteRecords.length}</span></div>${favoriteRecords.length ? `<div class="result-list">${favoriteRecords.map((record) => resultCard({ record })).join("")}</div>` : `<div class="small-empty-block">尚未收藏题目。</div>`}</section>
      <section class="saved-section"><div class="section-header"><h2>收藏的机制</h2><span>${favoriteMechanisms.length}</span></div>${favoriteMechanisms.length ? `<div class="mechanism-grid">${favoriteMechanisms.map(({ axis, item }) => mechanismCard(axis, item)).join("")}</div>` : `<div class="small-empty-block">尚未收藏机制。</div>`}</section>
      <section class="saved-section"><div class="section-header"><h2>最近查看</h2><button class="text-button" type="button" data-action="clear-recents">清除</button></div>${recent.length ? `<div class="result-list">${recent.map((record) => resultCard({ record })).join("")}</div>` : `<div class="small-empty-block">还没有查看记录。</div>`}</section>`;
    return shell("saved", content);
  }

  function aboutView() {
    const stats = C.state.manifest?.stats || C.state.manifest?.counts || {};
    const stat = (keys, fallback) => keys.map((key) => stats[key] ?? C.state.manifest?.[key]).find((value) => value !== undefined) ?? fallback;
    const content = `${pageHeader("资料说明", "完整，但不假装均匀", "本手册忠实保存当前能够从官方公开来源恢复的内容；资料缺失会明确标注，不由模型补写。")}
      <div class="stats-strip"><div><strong>${stat(["records", "recordCount", "record_count"], C.state.catalog.length)}</strong><span>规范化记录</span></div><div><strong>${stat(["hints", "hintCount", "hint_count"], "1252")}</strong><span>官方提示</span></div><div><strong>${stat(["assets", "assetCount", "asset_count"], "1748")}</strong><span>本地附件</span></div><div><strong>${stat(["additionalAnswers", "additionalAnswerCount"], "354")}</strong><span>中间答案反馈</span></div></div>
      <div class="about-grid"><section class="detail-block"><h2>覆盖范围</h2><p>CCBC 2–4 的官方历史帖恢复层，以及 CCBC 11、12、13/14、15、16 的现代官方存档。CCBC 1、5–10 当前没有可恢复的完整官方题目与解析。</p></section><section class="detail-block"><h2>防剧透设计</h2><p>安全题面、官方提示、答案与题解物理分开。普通搜索不加载剧透索引；题目详情只有在主动操作后才读取相应内容。</p></section><section class="detail-block"><h2>局限</h2><p>静态分包用于防止误看，不是权限系统。掌握开发者工具的人仍可主动读取本地文件。本手册只适合队内自用或在授权范围内发布。</p></section><section class="detail-block"><h2>权利与来源</h2><p>原题、提示、题解及附件的权利与署名仍归原作者和 CCBC 主办方。本项目不对原内容声明新的许可证；每条题目保留官方来源。</p></section></div>
      <div class="about-actions"><a class="secondary-button" href="../README.md" target="_blank">${C.icon("file-text")} 查看语料说明</a><button class="danger-button" type="button" data-action="clear-spoilers">${C.icon("shield-x")} 清除本次会话的剧透数据</button></div>`;
    return shell("about", content);
  }

  function notFoundView(message) {
    return shell("search", `<div class="empty-state">${C.icon("map-pin-off")}<h1>${C.escapeHTML(message)}</h1><p>链接可能已失效，或本次构建没有收录对应记录。</p><a class="primary-button" href="#/search">返回检索</a></div>`);
  }

  function errorView(error) {
    return `<div class="fatal-error"><div>${C.icon("triangle-alert")}<h1>手册没有正常加载</h1><p>${C.escapeHTML(error?.message || error)}</p><p>请通过本地网页服务打开，不要直接双击 HTML 文件。</p><button class="primary-button" type="button" data-action="reload">重新加载</button></div></div>`;
  }

  Object.assign(window, {
    CCBCViews: {
      shell,
      searchView,
      quickView,
      mechanismsView,
      mechanismView,
      symptomView,
      puzzlesView,
      puzzleView,
      savedView,
      aboutView,
      renderSpoiler,
      resultCard,
      errorView,
      notFoundView
    }
  });
})();
