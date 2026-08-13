(function () {
  "use strict";

  const C = window.CCBC;
  const V = window.CCBCViews;
  const app = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  const toastRoot = document.getElementById("toast-root");
  let rendering = false;
  let renderQueued = false;
  let modalOpener = null;

  function toast(message) {
    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = message;
    toastRoot.replaceChildren(element);
    window.setTimeout(() => element.classList.add("is-visible"), 10);
    window.setTimeout(() => {
      element.classList.remove("is-visible");
      window.setTimeout(() => element.remove(), 180);
    }, 2200);
  }

  function closeModal(value = false, restoreFocus = true) {
    const resolver = modalRoot._resolver;
    modalRoot.replaceChildren();
    modalRoot._resolver = null;
    document.body.classList.remove("modal-open");
    app.inert = false;
    if (resolver) resolver(value);
    const opener = modalOpener;
    modalOpener = null;
    if (restoreFocus && opener?.isConnected) window.requestAnimationFrame(() => opener.focus());
  }

  function beginModal() {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeModal(false, false);
    modalOpener = opener;
    app.inert = true;
    document.body.classList.add("modal-open");
  }

  function confirmModal({ icon = "shield-alert", eyebrow = "防剧透确认", title, message, confirmLabel = "确认显示", danger = true }) {
    beginModal();
    return new Promise((resolve) => {
      modalRoot._resolver = resolve;
      modalRoot.innerHTML = `<div class="modal-backdrop is-open" data-action="dismiss-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-panel>
        <div class="modal-icon ${danger ? "is-danger" : ""}">${C.icon(icon)}</div>
        <span class="eyebrow">${C.escapeHTML(eyebrow)}</span>
        <h2 id="modal-title">${C.escapeHTML(title)}</h2>
        <p>${C.escapeHTML(message)}</p>
        <div class="modal-actions"><button class="secondary-button" type="button" data-action="cancel-modal">取消</button><button class="${danger ? "danger-button" : "primary-button"}" type="button" data-action="confirm-modal">${C.escapeHTML(confirmLabel)}</button></div>
      </section></div>`;
      C.refreshIcons();
      modalRoot.querySelector("[data-action='cancel-modal']")?.focus();
    });
  }

  function searchModeModal() {
    beginModal();
    return new Promise((resolve) => {
      modalRoot._resolver = resolve;
      const options = [
        ["safe", "shield-check", "仅题面", "标题、届次、分区、作者和公开题面。默认且最安全。"],
        ["hints", "lightbulb", "包含官方提示", "提示会参与召回，但结果摘要不显示提示原文。"],
        ["full", "shield-alert", "完整剧透检索", "答案、中间答案、完整题解和解题后内容都会参与搜索。"]
      ];
      modalRoot.innerHTML = `<div class="modal-backdrop is-open" data-action="dismiss-modal"><section class="modal search-mode-modal" role="dialog" aria-modal="true" aria-labelledby="scope-title" data-modal-panel>
        <span class="eyebrow">搜索范围</span><h2 id="scope-title">允许搜索哪些内容？</h2><p>范围越大，越容易在结果中确认自己的方向，但也越可能意外知道历史题的关键机制。</p>
        <div class="mode-options">${options.map(([id, iconName, name, description]) => `<button type="button" class="mode-option ${C.state.searchMode === id ? "is-active" : ""} ${id === "full" ? "is-danger" : ""}" data-action="select-search-mode" data-mode="${id}">${C.icon(iconName)}<span><strong>${name}</strong><small>${description}</small></span>${C.state.searchMode === id ? C.icon("check") : C.icon("chevron-right")}</button>`).join("")}</div>
        <div class="modal-actions"><button class="secondary-button" type="button" data-action="cancel-modal">保持当前范围</button></div>
      </section></div>`;
      C.refreshIcons();
      modalRoot.querySelector("[data-action='cancel-modal']")?.focus();
    });
  }

  function mediaModal(src, name) {
    beginModal();
    modalRoot.innerHTML = `<div class="modal-backdrop media-backdrop is-open" data-action="dismiss-modal"><section class="media-viewer" role="dialog" aria-modal="true" aria-label="查看图片" data-modal-panel><div class="media-toolbar"><span>${C.escapeHTML(name || "题目图片")}</span><a class="icon-button" href="${C.escapeHTML(src)}" download aria-label="下载原图">${C.icon("download")}</a><button class="icon-button" type="button" data-action="cancel-modal" aria-label="关闭">${C.icon("x")}</button></div><div class="media-canvas"><img src="${C.escapeHTML(src)}" alt="${C.escapeHTML(name || "题目图片")}"></div></section></div>`;
    C.refreshIcons();
    modalRoot.querySelector("[data-action='cancel-modal']")?.focus();
  }

  function setMobileMenu(open, restoreFocus = false) {
    document.body.classList.toggle("mobile-menu-open", open);
    const trigger = document.querySelector("[data-action='mobile-menu']");
    trigger?.setAttribute("aria-expanded", String(open));
    trigger?.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    const workspace = document.querySelector(".workspace");
    const bottomNav = document.querySelector(".bottom-nav");
    if (workspace) workspace.inert = open;
    if (bottomNav) bottomNav.inert = open;
    if (open) document.querySelector("#main-sidebar a, #main-sidebar button")?.focus();
    else if (restoreFocus) trigger?.focus();
  }

  function activeNav(route) {
    if (["mechanism", "mechanisms"].includes(route.name)) return "mechanisms";
    if (["puzzle", "puzzles"].includes(route.name)) return "puzzles";
    if (route.name === "symptom") return "mechanisms";
    return route.name;
  }

  async function render({ preserveScroll = false } = {}) {
    if (rendering) {
      renderQueued = true;
      return;
    }
    rendering = true;
    const previousRoute = C.state.route;
    if (previousRoute?.name) C.state.scrollPositions.set(`${previousRoute.name}:${previousRoute.params?.id || ""}`, window.scrollY);
    const route = C.parseHash();
    C.state.route = route;
    try {
      let html;
      switch (route.name) {
        case "search": html = await V.searchView(route); break;
        case "quick": html = V.quickView(); break;
        case "mechanisms": html = V.mechanismsView(route); break;
        case "mechanism": html = V.mechanismView(route.params.id); break;
        case "symptom": html = V.symptomView(route.params.id); break;
        case "puzzles": html = V.puzzlesView(route); break;
        case "puzzle": html = await V.puzzleView(route.params.id); break;
        case "saved": html = V.savedView(); break;
        case "about": html = V.aboutView(); break;
        default: html = V.notFoundView("页面不存在");
      }
      app.innerHTML = html;
      document.body.dataset.route = activeNav(route);
      C.refreshIcons();
      document.title = route.name === "puzzle" ? `${C.state.byId.get(route.params.id)?.title || "题目"} · CCBC 卡题手册` : "CCBC 卡题手册";
      if (preserveScroll) {
        const position = C.state.scrollPositions.get(`${route.name}:${route.params?.id || ""}`) || 0;
        window.scrollTo({ top: position, behavior: "auto" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    } catch (error) {
      console.error(error);
      app.innerHTML = V.errorView(error);
      C.refreshIcons();
    } finally {
      rendering = false;
      if (renderQueued) {
        renderQueued = false;
        await render();
      }
    }
  }

  function updateHash(name, params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== "" && value !== false && value != null) query.set(key, value === true ? "1" : value);
    }
    location.hash = `#/${name}${query.size ? `?${query.toString()}` : ""}`;
  }

  async function setSearchMode(mode) {
    if (mode === C.state.searchMode) return;
    if (mode === "safe") {
      C.state.searchMode = "safe";
      C.state.searchCache.delete("hints");
      C.state.searchCache.delete("full");
      toast("已恢复仅题面检索");
      await render({ preserveScroll: true });
      return;
    }
    C.state.searchMode = mode;
    await C.loadSearch(mode);
    toast(mode === "full" ? "完整剧透检索已开启" : "官方提示检索已开启");
    await render({ preserveScroll: true });
  }

  async function revealSpoiler(button) {
    const kind = button.dataset.kind;
    const id = button.dataset.id;
    const section = button.closest("[data-spoiler-section]");
    const container = section?.querySelector("[data-spoiler-content]");
    if (!section || !container) return;
    if (section.classList.contains("is-revealed")) {
      section.classList.remove("is-revealed");
      button.setAttribute("aria-expanded", "false");
      return;
    }
    if (kind === "answer" || kind === "solution") {
      const accepted = await confirmModal({
        icon: kind === "answer" ? "key-round" : "book-open-check",
        title: kind === "answer" ? "直接显示最终答案？" : "展开完整官方题解？",
        message: kind === "answer" ? "这一步会直接揭底。答案不会在刷新后继续显示。" : "完整题解通常包含全部关键机制、中间结果和最终答案。内容不会在刷新后继续显示。",
        confirmLabel: kind === "answer" ? "确认显示答案" : "确认展开题解"
      });
      if (!accepted) return;
    }
    button.classList.add("is-loading");
    button.disabled = true;
    try {
      let data = await C.loadSpoiler(id);
      if (kind === "solution") {
        const refId = C.state.relations.solutionRefs[id];
        const ownSolution = data.solution || {};
        const hasOwnContent = ownSolution.html || ownSolution.text || ownSolution.markdownHtml || ownSolution.markdown_html;
        if (!hasOwnContent && refId) data = await C.loadSpoiler(refId);
      }
      container.innerHTML = V.renderSpoiler(kind, data, kind === "hints" ? 1 : 0);
      section.dataset.hintProgress = kind === "hints" ? "1" : "0";
      section.classList.add("is-revealed");
      button.setAttribute("aria-expanded", "true");
      C.refreshIcons();
      container.querySelector("button, a, summary")?.focus({ preventScroll: true });
    } catch (error) {
      container.innerHTML = `<div class="inline-error">${C.icon("triangle-alert")}<span>${C.escapeHTML(error.message)}</span></div>`;
      section.classList.add("is-revealed");
      C.refreshIcons();
    } finally {
      button.classList.remove("is-loading");
      button.disabled = false;
    }
  }

  async function nextHint(button) {
    const section = button.closest("[data-spoiler-section='hints']");
    const puzzle = button.closest("[data-puzzle-id]");
    if (!section || !puzzle) return;
    const id = puzzle.dataset.puzzleId;
    const data = await C.loadSpoiler(id);
    const current = Number(section.dataset.hintProgress || 1);
    const next = current + 1;
    section.dataset.hintProgress = String(next);
    section.querySelector("[data-spoiler-content]").innerHTML = V.renderSpoiler("hints", data, next);
    C.refreshIcons();
    section.querySelector("[data-action='next-hint']")?.focus({ preventScroll: true });
  }

  async function handleClick(event) {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;
    const action = actionElement.dataset.action;
    if (action === "dismiss-modal") {
      if (event.target === actionElement) closeModal(false);
      return;
    }
    if (action === "cancel-modal") { closeModal(false); return; }
    if (action === "confirm-modal") { closeModal(true); return; }
    if (action === "select-search-mode") {
      const mode = actionElement.dataset.mode;
      closeModal(mode);
      await setSearchMode(mode);
      return;
    }
    if (action === "search-mode") {
      const selected = await searchModeModal();
      if (selected) await setSearchMode(selected);
      return;
    }
    if (action === "focus-search") {
      if (C.state.route.name !== "search") {
        location.hash = "#/search";
        window.setTimeout(() => document.getElementById("global-search")?.focus(), 80);
      } else document.getElementById("global-search")?.focus();
      return;
    }
    if (action === "clear-search") {
      const input = actionElement.closest("form")?.querySelector("input[name='q']");
      if (input) { input.value = ""; input.focus(); }
      actionElement.classList.add("is-hidden");
      return;
    }
    if (action === "clear-filters") { location.hash = "#/search"; return; }
    if (action === "enable-hint-search") { await setSearchMode("hints"); return; }
    if (action === "favorite") {
      event.preventDefault();
      event.stopPropagation();
      const active = C.toggleFavorite(actionElement.dataset.id);
      document.querySelectorAll("[data-action='favorite']").forEach((button) => {
        if (button.dataset.id !== actionElement.dataset.id) return;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
        const isMechanism = Boolean(C.mechanismById(button.dataset.id));
        button.setAttribute("aria-label", active ? `取消收藏${isMechanism ? "机制" : "题目"}` : `收藏${isMechanism ? "机制" : "题目"}`);
      });
      toast(active ? "已收藏" : "已取消收藏");
      return;
    }
    if (action === "load-more-puzzles") {
      C.state.puzzleVisible += C.state.puzzlePageSize;
      await render({ preserveScroll: true });
      return;
    }
    if (action === "load-more-children") {
      C.state.childVisible += 80;
      await render({ preserveScroll: true });
      return;
    }
    if (action === "reveal-spoiler") { await revealSpoiler(actionElement); return; }
    if (action === "next-hint") { await nextHint(actionElement); return; }
    if (action === "copy-answer") {
      try {
        await navigator.clipboard.writeText(actionElement.dataset.answer || "");
        toast("已复制");
      } catch (_error) {
        toast("复制失败，请手动选择答案");
      }
      return;
    }
    if (action === "view-media") { mediaModal(actionElement.dataset.src, actionElement.dataset.name); return; }
    if (action === "clear-recents") {
      C.state.recents = [];
      localStorage.setItem("ccbc-handbook-recents", "[]");
      await render({ preserveScroll: true });
      return;
    }
    if (action === "clear-spoilers") {
      const accepted = await confirmModal({ title: "清除本次会话的剧透数据？", message: "这会恢复仅题面搜索并从内存中清除已加载的提示、答案和题解。收藏与最近记录不受影响。", confirmLabel: "清除剧透数据" });
      if (accepted) { C.resetSpoilers(); toast("剧透数据已清除"); await render({ preserveScroll: true }); }
      return;
    }
    if (action === "print") { window.print(); return; }
    if (action === "mobile-menu") { setMobileMenu(!document.body.classList.contains("mobile-menu-open")); return; }
    if (action === "close-mobile-menu") { setMobileMenu(false, true); return; }
    if (action === "reload") { location.reload(); return; }
  }

  function handleSubmit(event) {
    const form = event.target;
    if (form.matches("[data-search-form]")) {
      event.preventDefault();
      const data = new FormData(form);
      updateHash("search", { q: data.get("q")?.toString().trim(), event: data.get("event"), kind: data.get("kind"), sub: data.get("sub") === "1" });
    }
    if (form.matches("[data-library-form]")) {
      event.preventDefault();
      const data = new FormData(form);
      C.state.puzzleVisible = C.state.puzzlePageSize;
      updateHash("puzzles", { q: data.get("q")?.toString().trim(), event: data.get("event"), kind: data.get("kind"), root: data.get("root") === "0" ? "0" : "1" });
    }
  }

  function handleChange(event) {
    const form = event.target.closest("form");
    if (form?.matches("[data-search-form]") && event.target.matches("select, input[type='checkbox']")) form.requestSubmit();
    if (form?.matches("[data-library-form]") && event.target.matches("select, input[type='checkbox']")) form.requestSubmit();
  }

  function handleInput(event) {
    if (event.target.matches("input[name='q']")) {
      event.target.closest("form")?.querySelector(".clear-search")?.classList.toggle("is-hidden", !event.target.value);
    }
  }

  function handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      document.querySelector("[data-action='focus-search']")?.click();
    }
    if (event.key === "Escape") {
      if (modalRoot.firstChild) closeModal(false);
      else setMobileMenu(false, true);
    }
    if (event.key === "Tab" && modalRoot.firstChild) {
      const focusable = [...modalRoot.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex='-1'])")].filter((element) => element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  async function boot() {
    try {
      await C.initData();
      if (!location.hash) history.replaceState(null, "", "#/mechanisms");
      await render();
      window.addEventListener("hashchange", () => {
        setMobileMenu(false);
        C.state.childVisible = 80;
        render();
      });
      document.addEventListener("click", handleClick);
      document.addEventListener("submit", handleSubmit);
      document.addEventListener("change", handleChange);
      document.addEventListener("input", handleInput);
      document.addEventListener("keydown", handleKeydown);
    } catch (error) {
      console.error(error);
      app.innerHTML = V.errorView(error);
      C.refreshIcons();
    }
  }

  boot();
})();
