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
      ["mechanisms", "compass", "卡点导航", "卡点"],
      ["quick", "scan-line", "一页速查", "速查"],
      ["puzzles", "library", "历年题库", "题库"],
      ["search", "search", "资料搜索", "搜索"],
      ["saved", "bookmark", "收藏与最近", "收藏"],
      ["about", "info", "关于资料", "关于"],
    ];
    const navItems = nav.map(([route, iconName, label]) => `
      <a class="nav-item ${active === route ? "is-active" : ""}" href="${C.routeHref(route)}" data-nav="${route}" ${active === route ? "aria-current=\"page\"" : ""}>
        ${C.icon(iconName)}<span>${label}</span>
      </a>`).join("");
    const spoilerLabel = C.state.searchMode === "safe" ? "题面检索" : C.state.searchMode === "hints" ? "含提示检索" : "完整剧透检索";
    const spoilerTone = C.state.searchMode === "safe" ? "safe" : "danger";
    return `
      <div class="app-shell">
        <aside class="sidebar" id="main-sidebar" aria-label="主导航">
          <a class="brand" href="#/mechanisms" aria-label="CCBC 卡题手册首页">
            <span class="brand-mark">C17</span>
            <span class="brand-copy"><strong>卡题手册</strong><small>CCBC FIELD MANUAL</small></span>
          </a>
          <button class="icon-button mobile-menu-close" type="button" data-action="close-mobile-menu" aria-label="关闭导航">${C.icon("x")}</button>
          <nav class="side-nav">${navItems}</nav>
          <div class="sidebar-footer">
            <button class="spoiler-status spoiler-status-${spoilerTone}" data-action="search-mode" type="button">
              ${C.icon(C.state.searchMode === "safe" ? "shield-check" : "shield-alert")}
              <span><small>当前搜索范围</small><strong>${spoilerLabel}</strong></span>
            </button>
            <p>资料更新于 ${C.escapeHTML(buildDateLabel())}</p>
          </div>
        </aside>
        <button class="mobile-menu-scrim" type="button" data-action="close-mobile-menu" aria-label="关闭导航"></button>
        <div class="workspace">
          <header class="topbar">
            <button class="icon-button mobile-menu-button" type="button" data-action="mobile-menu" aria-label="打开导航" aria-controls="main-sidebar" aria-expanded="false">${C.icon("menu")}</button>
            <a class="mobile-brand" href="#/mechanisms"><span class="brand-mark">C17</span><strong>卡题手册</strong></a>
            <button class="top-search-trigger" type="button" data-action="focus-search">
              ${C.icon("search")}<span>搜索历年题目与资料</span><kbd>Ctrl K</kbd>
            </button>
            <button class="icon-button" type="button" data-action="search-mode" aria-label="切换搜索范围">${C.icon(C.state.searchMode === "safe" ? "shield-check" : "shield-alert")}</button>
          </header>
          <div class="content-frame ${detail ? "has-detail" : ""}">
            <main class="main-content" id="main-content">${content}</main>
            ${detail ? `<aside class="detail-panel">${detail}</aside>` : ""}
          </div>
        </div>
        <nav class="bottom-nav" aria-label="移动端导航">${nav.filter(([route]) => route !== "about").map(([route, iconName, , mobileLabel]) => `
          <a class="bottom-nav-item ${active === route ? "is-active" : ""}" href="${C.routeHref(route)}" ${active === route ? "aria-current=\"page\"" : ""}>${C.icon(iconName)}<span>${mobileLabel}</span></a>`).join("")}</nav>
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
      <div class="result-card-top"><div class="badge-row">${badges.join("")}</div><button class="icon-button favorite-button ${C.state.favorites.has(record.id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${C.escapeHTML(record.id)}" aria-label="${C.state.favorites.has(record.id) ? "取消收藏这道题" : "收藏这道题"}" aria-pressed="${C.state.favorites.has(record.id)}">${C.icon("bookmark")}</button></div>
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
      <div class="search-box search-box-large">${C.icon("search")}<input id="global-search" name="q" value="${C.escapeHTML(query)}" placeholder="输入题名、分区、作者或题面原文" autocomplete="off"><button class="icon-button clear-search ${query ? "" : "is-hidden"}" type="button" data-action="clear-search" aria-label="清空搜索">${C.icon("x")}</button><button class="primary-button" type="submit">检索</button></div>
      <div class="filter-bar">
        <label><span>届次</span><select name="event"><option value="">全部</option>${events.map((id) => `<option value="${C.escapeHTML(id)}" ${event === id ? "selected" : ""}>${C.escapeHTML(C.formatEvent({ eventId: id }))}</option>`).join("")}</select></label>
        <label><span>类型</span><select name="kind"><option value="">全部</option>${Object.entries(C.KIND_LABELS).map(([id, label]) => `<option value="${id}" ${kind === id ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label class="checkbox-label"><input type="checkbox" name="sub" value="1" ${includeSubpuzzles ? "checked" : ""}><span>包含复合题子题</span></label>
        <button class="search-scope-button ${C.state.searchMode === "safe" ? "" : "is-spoiler"}" type="button" data-action="search-mode">${C.icon(C.state.searchMode === "safe" ? "shield-check" : "shield-alert")} ${searchModeText}</button>
      </div>
    </form>`;

    let body = "";
    if (!query) {
      body = `<a class="quick-banner search-navigation-banner" href="#/mechanisms"><span>${C.icon("compass")}</span><div><strong>遇到卡点？从阶段导航开始</strong><p>不依赖自然语言搜索，逐步缩小到下一条可验证路径。</p></div>${C.icon("arrow-right")}</a>
      ${recentAndFavorites()}`;
    } else if (!results.length && !guideResults.length) {
      body = `<div class="empty-state">${C.icon("search-x")}<h2>没有找到直接匹配</h2><p>试着描述可观察现象，不必先猜机制名。例如“每行都有一个颜色”“得到八个无意义字母”。</p><div class="empty-actions"><button class="secondary-button" data-action="clear-filters" type="button">清除筛选</button>${C.state.searchMode === "safe" ? `<button class="danger-button" data-action="enable-hint-search" type="button">允许搜索官方提示</button>` : ""}</div></div>`;
    } else {
      body = `${guideResults.length ? `<section class="result-section"><div class="section-header"><div><span class="eyebrow">下一步</span><h2>卡点与机制</h2></div><span>${guideResults.length} 项</span></div><div class="result-list guide-results">${guideResults.map(guideSearchCard).join("")}</div></section>` : ""}
        ${results.length ? `<section class="result-section"><div class="section-header"><div><span class="eyebrow">历史先例</span><h2>历年题目</h2></div><span>按题族折叠 · ${results.length} 项</span></div><div class="result-list">${results.map(resultCard).join("")}</div></section>` : ""}`;
    }
    return shell("search", `<div class="search-page"><div class="search-intro"><span class="eyebrow">ARCHIVE SEARCH</span><h1>${query ? "检索结果" : "资料搜索"}</h1><p>${query ? `当前搜索范围：${searchModeText}` : "用于查找历年题目和原始资料。没思路时请使用卡点导航；历史提示与题解默认不会出现在结果里。"}</p></div>${form}${body}</div>`);
  }

  function quickSectionHeading(number, title, description, iconName) {
    return `<header class="quick-reference-heading"><span class="quick-reference-icon">${C.icon(iconName)}</span><div><span class="eyebrow">${C.escapeHTML(number)}</span><h2>${C.escapeHTML(title)}</h2>${description ? `<p>${C.escapeHTML(description)}</p>` : ""}</div></header>`;
  }

  function quickChecklist(items, cueKey) {
    return `<ol class="quick-checklist">${items.map((item, index) => {
      const cueValue = item[cueKey];
      const cue = Array.isArray(cueValue) ? cueValue.join(" · ") : cueValue || "";
      return `<li><details><summary><span class="quick-check-number">${index + 1}</span><span class="quick-check-summary">${cue ? `<small>${C.escapeHTML(cue)}</small>` : ""}<strong>${C.escapeHTML(item.name || item.title || item.label || "")}</strong></span>${C.icon("chevron-down")}</summary><div class="quick-check-detail"><p>${C.icon("play")}<span>${C.escapeHTML(item.try || item.description || "")}</span></p>${item.check ? `<span class="quick-check-proof">${C.icon("check")} ${C.escapeHTML(item.check)}</span>` : ""}</div></details></li>`;
    }).join("")}</ol>`;
  }

  function quickCodeGroups(codes) {
    const specs = [
      { id: "letters", label: "字母与文字", icon: "text", names: ["A1Z26", "凯撒 / ROT", "Atbash", "NATO 字母表", "罗马数字"] },
      { id: "symbols", label: "符号与姿态", icon: "scan", names: ["摩尔斯", "盲文", "旗语", "猪圈密码", "颜色顺序"] },
      { id: "grids", label: "网格与键位", icon: "table-2", names: ["手机九键", "Polybius / 5×5 棋盘", "Playfair", "键盘位置", "栅栏 / 密码棒"] },
      { id: "data", label: "数字与数据", icon: "binary", names: ["二进制", "三进制及一般进制", "ASCII", "Unicode", "Base64 / Base32 / 十六进制"] },
    ];
    const byName = new Map(codes.map((item) => [item.name, item]));
    const assigned = new Set(specs.flatMap((group) => group.names));
    const remaining = codes.filter((item) => !assigned.has(item.name));
    const groups = remaining.length ? [...specs, { id: "other", label: "其他表示", icon: "braces", names: remaining.map((item) => item.name) }] : specs;
    return groups.map((group) => `<section class="quick-code-group" data-code-group="${group.id}"><header>${C.icon(group.icon)}<h3>${C.escapeHTML(group.label)}</h3></header><div>${group.names.map((name) => byName.get(name)).filter(Boolean).map((item) => `<details class="quick-code-item"><summary><span><strong>${C.escapeHTML(item.name)}</strong><small>${C.escapeHTML(item.pattern || "")}</small></span>${C.icon("chevron-down")}</summary><div class="quick-code-detail"><p>${C.escapeHTML(item.use || item.description || "")}</p>${item.check ? `<dl><div><dt>校验</dt><dd>${C.escapeHTML(item.check)}</dd></div>${item.pitfalls?.length ? `<div><dt>易错</dt><dd>${C.escapeHTML(item.pitfalls.join("；"))}</dd></div>` : ""}</dl>` : ""}</div></details>`).join("")}</div></section>`).join("");
  }

  function quickView() {
    const quick = window.CCBC_GUIDE?.quick || {};
    const firstMinute = quick.firstMinute || [];
    const ladder = quick.stuckLadder || [];
    const sorting = quick.sorting || [];
    const extraction = quick.extraction || [];
    const signals = quick.signals || [];
    const codes = quick.codes || [];
    const handoff = quick.teamHandoff || [];
    const hintLevels = quick.hintLevels || [];
    const ladderFallbacks = ["检查资源与交互", "识别对象与来源", "重新描述规则", "整理分组与输入", "排查执行与矛盾", "检查排序与提取", "校验结果与格式"];
    const content = `<article class="quick-reference">
      ${pageHeader("现场手册", "一页速查", "从当前状态进入对应检查表；先验证最小动作，再扩大尝试。", `<button class="secondary-button" type="button" data-action="print">${C.icon("printer")} 打印</button>`)}
      <nav class="quick-jumpbar" aria-label="速查目录"><span>跳到</span>
        <button type="button" data-action="quick-jump" data-target="quick-start" aria-controls="quick-start">${C.icon("route")} 现场流程</button>
        <button type="button" data-action="quick-jump" data-target="quick-finish" aria-controls="quick-finish">${C.icon("scan-text")} 排序与提取</button>
        <button type="button" data-action="quick-jump" data-target="quick-signals" aria-controls="quick-signals">${C.icon("radar")} 信号反查</button>
        <button type="button" data-action="quick-jump" data-target="quick-codes" aria-controls="quick-codes">${C.icon("binary")} 常用码表</button>
      </nav>

      <section class="quick-reference-section quick-start" id="quick-start" tabindex="-1">
        ${quickSectionHeading("01 · 起步", "先走一遍现场流程", "拿到题先清点；卡住后从七个问题里找到最早答不上来的一个。", "route")}
        <div class="quick-first-minute"><h3>拿到题先做</h3><ol>${firstMinute.map((item, index) => `<li><span>${index + 1}</span><div><strong>${C.escapeHTML(item.label)}</strong><p>${C.escapeHTML(item.action)}</p></div></li>`).join("")}</ol></div>
        <div class="quick-ladder"><h3>卡住后依次问</h3><ol>${ladder.map((item, index) => `<li><details><summary><span class="quick-ladder-step">${item.step || index + 1}</span><span><strong>${C.escapeHTML(item.label || item.title || "")}</strong><small>${C.icon("corner-down-right")} 答不上：${C.escapeHTML(ladderFallbacks[index] || "回查当前步骤")}</small></span>${C.icon("chevron-down")}</summary><div><p>${C.escapeHTML(item.question || item.description || "")}</p>${item.yes ? `<span>${C.icon("check")} 答得上：${C.escapeHTML(item.yes)}</span>` : ""}${item.no ? `<span class="quick-ladder-no">${C.icon("corner-down-right")} 答不上：${C.escapeHTML(item.no)}</span>` : ""}</div></details></li>`).join("")}</ol></div>
      </section>

      <section class="quick-reference-section" id="quick-finish" tabindex="-1">
        ${quickSectionHeading("02 · 收束", "主体做完，先排顺序再提取", "不要同时改动顺序和取字规则；每轮只换一个变量。", "scan-text")}
        <div class="quick-check-columns">
          <section class="quick-check-panel quick-check-sorting"><header>${C.icon("arrow-down-narrow-wide")}<div><h3>排序检查</h3><span>${sorting.length} 种常见顺序</span></div></header>${quickChecklist(sorting, "signals")}</section>
          <section class="quick-check-panel quick-check-extraction"><header>${C.icon("scan-line")}<div><h3>提取检查</h3><span>${extraction.length} 种常见出口</span></div></header>${quickChecklist(extraction, "question")}</section>
        </div>
      </section>

      <section class="quick-reference-section" id="quick-signals" tabindex="-1">
        ${quickSectionHeading("03 · 反查", "从可见信号缩小候选机制", "先做最小实验；数量或外观只能生成候选，不能单独证明机制。", "radar")}
        <div class="quick-signal-table-wrap"><table class="quick-signal-table"><thead><tr><th>看到什么</th><th>优先怀疑</th><th>先试一下</th></tr></thead><tbody>${signals.map((row) => `<tr><th scope="row">${C.escapeHTML(row.signal)}</th><td data-label="候选"><div class="quick-candidate-list">${(Array.isArray(row.candidates) ? row.candidates : [row.candidates]).filter(Boolean).map((candidate) => `<span>${C.escapeHTML(candidate)}</span>`).join("")}</div></td><td data-label="实验"><span class="quick-experiment">${C.icon("flask-conical")} ${C.escapeHTML(row.try || row.quickTest || "")}</span></td></tr>`).join("")}</tbody></table></div>
      </section>

      <section class="quick-reference-section" id="quick-codes" tabindex="-1">
        ${quickSectionHeading("04 · 查表", "常用编码与表示", "先按识别特征定位；展开单项查看用法、校验方式和易错点。", "binary")}
        <div class="quick-code-groups">${quickCodeGroups(codes)}</div>
      </section>

      <details class="quick-support"><summary>${C.icon("users")}<span><strong>团队交接与提示强度</strong><small>换人接手或请求提示前核对</small></span>${C.icon("chevron-down")}</summary><div class="quick-support-grid"><section><h3>交接最小记录</h3><ul>${handoff.map((item) => `<li>${C.icon("check")}<span>${C.escapeHTML(item)}</span></li>`).join("")}</ul></section><section><h3>提示分级</h3><ol>${hintLevels.map((item) => `<li><strong>${C.escapeHTML(item.level)} · ${C.escapeHTML(item.label)}</strong><span>${C.escapeHTML(item.content)}</span></li>`).join("")}</ol></section></div></details>
    </article>`;
    return shell("quick", content);
  }

  function mechanismCard(axis, item) {
    return `<article class="mechanism-card"><a class="result-card-link" href="${C.routeHref("mechanism", item.id)}" aria-label="打开 ${C.escapeHTML(item.name)}"></a><span class="mechanism-icon">${C.icon(item.icon || axis.icon || "route")}</span><span class="mechanism-code">${C.escapeHTML(item.id.toUpperCase())}</span><h3>${C.escapeHTML(item.shortLabel || item.name)}</h3><p>${C.escapeHTML(item.cue || item.description || "")}</p><footer><span>查看快速验证</span>${C.icon("arrow-right")}</footer></article>`;
  }

  function mechanismModeSwitch(view) {
    return `<nav class="mechanism-mode-switch" aria-label="机制导航方式">
      <a class="${view === "diagnose" ? "is-active" : ""}" href="#/mechanisms" ${view === "diagnose" ? "aria-current=\"page\"" : ""}>${C.icon("compass")}<span><strong>按卡点找路</strong><small>不知道下一步时</small></span></a>
      <a class="${view === "atlas" ? "is-active" : ""}" href="#/mechanisms?view=atlas" ${view === "atlas" ? "aria-current=\"page\"" : ""}>${C.icon("library-big")}<span><strong>机制图鉴</strong><small>知道要查哪一类时</small></span></a>
    </nav>`;
  }

  function stageCard(group, index) {
    const symptoms = (group.symptomIds || []).map((id) => C.symptomById(id)).filter(Boolean);
    return `<a class="stage-card" href="#/mechanisms?stage=${encodeURIComponent(group.id)}">
      <span class="stage-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="stage-icon">${C.icon(group.icon || "circle-dot")}</span>
      <span class="stage-copy"><strong>${C.escapeHTML(group.label)}</strong><small>${C.escapeHTML(group.example || group.description || "")}</small></span>
      <span class="stage-count">${symptoms.length} 种卡点</span>${C.icon("arrow-right")}
    </a>`;
  }

  function diagnoseView(route) {
    const groups = window.CCBC_GUIDE?.stageGroups || [];
    const selected = C.stageGroupById(route.query.get("stage"));
    if (!selected) {
      return `${pageHeader("现场导航", "你现在卡在哪一步？", "先选阶段，不必先猜题型。每一屏只处理一个问题。")}
        <div class="stage-flow" aria-label="解题阶段">${groups.map(stageCard).join("")}</div>
        <aside class="navigation-note">${C.icon("lightbulb")}<div><strong>拿不准阶段？</strong><p>选最接近当前产物的一项。走错不会丢失任何内容，随时可以返回重选。</p></div></aside>`;
    }
    const symptoms = (selected.symptomIds || []).map((id) => C.symptomById(id)).filter(Boolean);
    return `<div class="breadcrumbs"><a href="#/mechanisms">卡点导航</a>${C.icon("chevron-right")}<span>${C.escapeHTML(selected.label)}</span></div>
      ${pageHeader(`第 ${groups.findIndex((group) => group.id === selected.id) + 1} 阶段`, selected.question, selected.description || "")}
      <div class="symptom-choice-list">${symptoms.map((item, index) => `<a class="symptom-choice" href="${C.routeHref("symptom", item.id)}">
        <span class="choice-index">${index + 1}</span><span class="choice-copy"><strong>${C.escapeHTML(item.shortName || item.name)}</strong><small>${C.escapeHTML(item.description || item.nextStep || "")}</small></span><span class="choice-next">${(item.suggestions || []).length} 条候选路径</span>${C.icon("arrow-right")}
      </a>`).join("")}</div>
      <a class="back-choice" href="#/mechanisms">${C.icon("arrow-left")} 不是这个阶段，返回重选</a>`;
  }

  function atlasPreview(axis, item) {
    if (!item) return "";
    return `<aside class="atlas-preview">
      <div class="atlas-preview-heading"><span class="mechanism-icon">${C.icon(item.icon || axis.icon || "route")}</span><span class="mechanism-code">${C.escapeHTML(item.id.toUpperCase())}</span></div>
      <h2>${C.escapeHTML(item.shortLabel || item.name)}</h2>
      <p class="atlas-cue">${C.escapeHTML(item.cue || item.description || "")}</p>
      <div class="atlas-preview-block"><span>看到这些时考虑</span><ul>${(item.signals || []).slice(0, 3).map((signal) => `<li>${C.escapeHTML(signal)}</li>`).join("")}</ul></div>
      <div class="atlas-preview-test"><span>${C.icon("timer")} 90 秒验证</span><p>${C.escapeHTML(item.quickTest || "取最小样本验证规则能否稳定复现。")}</p></div>
      <a class="primary-button" href="${C.routeHref("mechanism", item.id)}">查看完整条目 ${C.icon("arrow-right")}</a>
    </aside>`;
  }

  function atlasView(route) {
    const axes = window.CCBC_GUIDE?.axes || [];
    const axis = C.axisById(route.query.get("axis")) || axes[0];
    if (!axis) return "";
    const requestedItem = route.query.get("item");
    const selectedItem = (axis.items || []).find((item) => item.id === requestedItem) || axis.items?.[0];
    return `${pageHeader("机制图鉴", "从一个问题开始查", "四个轴不是互斥题型；同一道题通常会同时命中多个轴。")}
      <nav class="axis-question-grid" aria-label="选择机制轴">${axes.map((entry) => `<a class="axis-question ${entry.id === axis.id ? "is-active" : ""}" href="#/mechanisms?view=atlas&axis=${encodeURIComponent(entry.id)}" ${entry.id === axis.id ? "aria-current=\"page\"" : ""}>
        ${C.icon(entry.icon || "layers-3")}<span><strong>${C.escapeHTML(entry.userQuestion || entry.name)}</strong><small>${C.escapeHTML(entry.name)}</small></span>${C.icon("chevron-right")}
      </a>`).join("")}</nav>
      <div class="atlas-layout">
        <div class="atlas-groups">${(axis.groups || []).map((group) => {
          const items = (group.itemIds || []).map((id) => (axis.items || []).find((item) => item.id === id)).filter(Boolean);
          return `<section class="atlas-group"><header><h2>${C.escapeHTML(group.label)}</h2><p>${C.escapeHTML(group.description || "")}</p></header><div class="atlas-item-list">${items.map((item) => `<a class="atlas-item ${item.id === selectedItem?.id ? "is-active" : ""}" href="#/mechanisms?view=atlas&axis=${encodeURIComponent(axis.id)}&item=${encodeURIComponent(item.id)}" ${item.id === selectedItem?.id ? "aria-current=\"page\"" : ""}><span class="mechanism-icon">${C.icon(item.icon || axis.icon || "route")}</span><span><strong>${C.escapeHTML(item.shortLabel || item.name)}</strong><small>${C.escapeHTML(item.cue || item.description || "")}</small></span>${C.icon("chevron-right")}</a>`).join("")}</div></section>`;
        }).join("")}</div>
        ${atlasPreview(axis, selectedItem)}
      </div>`;
  }

  function mechanismsView(route) {
    const view = route?.query?.get("view") === "atlas" ? "atlas" : "diagnose";
    const content = `${mechanismModeSwitch(view)}${view === "atlas" ? atlasView(route) : diagnoseView(route)}`;
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
    const content = `<div class="breadcrumbs"><a href="#/mechanisms">卡点导航</a>${C.icon("chevron-right")}<a href="#/mechanisms?view=atlas&axis=${encodeURIComponent(axis.id)}&item=${encodeURIComponent(item.id)}">${C.escapeHTML(axis.userQuestion || axis.name)}</a>${C.icon("chevron-right")}<span>${C.escapeHTML(item.shortLabel || item.name)}</span></div>
      ${pageHeader(axis.name, item.name, item.description || "", `<button class="icon-button favorite-button ${C.state.favorites.has(item.id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${C.escapeHTML(item.id)}" aria-label="${C.state.favorites.has(item.id) ? "取消收藏机制" : "收藏机制"}" aria-pressed="${C.state.favorites.has(item.id)}">${C.icon("bookmark")}</button>`)}
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
    const stage = C.stageGroupForSymptom(id);
    const stageHref = stage ? `#/mechanisms?stage=${encodeURIComponent(stage.id)}` : "#/mechanisms";
    const suggestions = (item.suggestions || []).map((suggestion) => {
      if (suggestion.mechanismId) {
        const found = C.mechanismById(suggestion.mechanismId);
        if (!found) return "";
        return `<a class="path-card" href="${C.routeHref("mechanism", found.item.id)}"><span class="path-icon">${C.icon(found.item.icon || found.axis.icon || "route")}</span><span class="path-copy"><small>${C.escapeHTML(found.axis.name)}</small><strong>${C.escapeHTML(found.item.shortLabel || found.item.name)}</strong><p>${C.escapeHTML(suggestion.why || "")}</p><span class="path-test">${C.icon("timer")} ${C.escapeHTML(found.item.quickTest || "查看最小验证实验")}</span></span>${C.icon("arrow-right")}</a>`;
      }
      if (suggestion.axis) {
        const axis = C.axisById(suggestion.axis);
        if (!axis) return "";
        return `<a class="path-card" href="#/mechanisms?view=atlas&axis=${encodeURIComponent(axis.id)}"><span class="path-icon">${C.icon(axis.icon || "layers-3")}</span><span class="path-copy"><small>机制图鉴</small><strong>${C.escapeHTML(suggestion.label || axis.userQuestion || axis.name)}</strong><p>${C.escapeHTML(suggestion.why || "")}</p><span class="path-test">浏览 ${axis.items?.length || 0} 个紧凑条目</span></span>${C.icon("arrow-right")}</a>`;
      }
      return `<article class="path-card path-card-action"><span class="path-icon">${C.icon("clipboard-check")}</span><span class="path-copy"><small>现场动作</small><strong>${C.escapeHTML(suggestion.label || "先做一次检查")}</strong><p>${C.escapeHTML(suggestion.why || "")}</p><span class="path-test">${C.icon("check")} 完成后再判断是否需要换方向</span></span></article>`;
    }).join("");
    const content = `<div class="breadcrumbs"><a href="#/mechanisms">卡点导航</a>${C.icon("chevron-right")}<a href="${stageHref}">${C.escapeHTML(stage?.label || "选择阶段")}</a>${C.icon("chevron-right")}<span>${C.escapeHTML(item.shortName || item.name)}</span></div>
      ${pageHeader(stage?.label || "卡点诊断", item.name, item.description || item.nextStep || "")}
      <div class="symptom-detail">
        <section class="detail-block detail-block-accent"><span class="block-label">现在先做</span><h2>下一小步</h2><p>${C.escapeHTML(item.nextStep || "先把可观察事实和自己的猜测分开记录。")}</p></section>
        <section class="detail-block"><span class="block-label">核对</span><h2>问自己这些问题</h2><ul class="check-list">${(item.quickQuestions || item.signals || []).map((question) => `<li>${C.icon("check-square")}<span>${C.escapeHTML(question)}</span></li>`).join("")}</ul></section>
      </div>
      <section class="path-section"><div class="section-header"><div><span class="eyebrow">候选路径</span><h2>接下来可以试什么</h2></div><span>${(item.suggestions || []).length} 条</span></div><div class="path-list">${suggestions}</div></section>
      <details class="symptom-aliases"><summary>常见说法与自查步骤</summary><div><div class="tag-cloud">${(item.aliases || []).map((entry) => C.badge(entry, "neutral")).join("")}</div><ol>${(item.steps || []).map((step) => `<li>${C.escapeHTML(step)}</li>`).join("")}</ol></div></details>
      ${representativePuzzles(item.representativeIds)}`;
    return shell("mechanisms", content);
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
    const actions = `<button class="icon-button favorite-button ${C.state.favorites.has(id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${C.escapeHTML(id)}" aria-label="${C.state.favorites.has(id) ? "取消收藏题目" : "收藏题目"}" aria-pressed="${C.state.favorites.has(id)}">${C.icon("bookmark")}</button>`;
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
      <div class="about-actions"><a class="secondary-button" href="#/puzzles">${C.icon("library")} 浏览历年题库</a><button class="danger-button" type="button" data-action="clear-spoilers">${C.icon("shield-x")} 清除本次会话的剧透数据</button></div>`;
    return shell("about", content);
  }

  function notFoundView(message) {
    return shell("mechanisms", `<div class="empty-state">${C.icon("map-pin-off")}<h1>${C.escapeHTML(message)}</h1><p>链接可能已失效，或本次构建没有收录对应记录。</p><a class="primary-button" href="#/mechanisms">返回卡点导航</a></div>`);
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
