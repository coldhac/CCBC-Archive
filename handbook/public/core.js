(function () {
  "use strict";

  const state = {
    manifest: null,
    catalog: [],
    byId: new Map(),
    relations: { parents: {}, children: {}, solutionRefs: {} },
    coreCache: new Map(),
    spoilerCache: new Map(),
    searchCache: new Map(),
    searchMode: "safe",
    route: { name: "mechanisms", params: {}, query: new URLSearchParams() },
    favorites: new Set(),
    recents: [],
    puzzlePageSize: 60,
    puzzleVisible: 60,
    childVisible: 80,
    lastSearch: "",
    scrollPositions: new Map()
  };

  const KIND_LABELS = {
    puzzle: "单题",
    subpuzzle: "子题",
    meta: "Meta",
    final_meta: "Final Meta"
  };

  const STATUS_LABELS = {
    available: "完整",
    incomplete_official: "官方资料不全",
    available_without_question: "仅存官解",
    answer_only: "仅存答案",
    external_only: "仅外链官解",
    missing_official: "官方未提供",
    not_applicable_inactive: "未启用",
    missing: "缺失"
  };

  const SEARCH_FIELD_LABELS = {
    safe: "题面",
    hints: "官方提示",
    answer: "最终答案",
    additionalAnswers: "中间答案反馈",
    solution: "完整题解",
    extended: "解题后内容"
  };

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .replace(/[\u200b\u200c\ufeff]/g, "")
      .toLocaleLowerCase("zh-CN")
      .replace(/\s+/g, " ")
      .trim();
  }

  function queryTokens(value) {
    const normalized = normalize(value);
    if (!normalized) return [];
    const chunks = normalized.split(/[\s,，;；/|]+/).filter(Boolean);
    const tokens = new Set(chunks);
    for (const chunk of chunks) {
      const cjk = [...chunk].filter((char) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char));
      if (cjk.length > 2) {
        for (let index = 0; index < cjk.length - 1; index += 1) {
          tokens.add(cjk[index] + cjk[index + 1]);
        }
      }
    }
    return [...tokens];
  }

  function formatEvent(record) {
    if (record.editions?.length) return record.editions.join(" / ");
    if (record.event?.editions?.length) return record.event.editions.join(" / ");
    const raw = record.eventId || record.event_id || record.event?.id || "CCBC";
    return raw.replace("ccbc", "CCBC ").replace("13-14", "13/14").toUpperCase();
  }

  function kindLabel(kind) {
    return KIND_LABELS[kind] || kind || "未知";
  }

  function statusLabel(status) {
    return STATUS_LABELS[status] || status || "未知";
  }

  function icon(name, label = "") {
    const aria = label ? ` aria-label="${escapeHTML(label)}"` : " aria-hidden=\"true\"";
    return `<i data-lucide="${escapeHTML(name)}"${aria}></i>`;
  }

  function badge(text, tone = "neutral") {
    return `<span class="badge badge-${tone}">${escapeHTML(text)}</span>`;
  }

  function sourcePath(path) {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    if (path.startsWith("/")) return path;
    if (path.startsWith("data/")) return path;
    return path;
  }

  async function fetchJSON(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`无法读取 ${path}（${response.status}）`);
    return response.json();
  }

  function pathsFromManifest(kind, fallback) {
    const manifest = state.manifest || {};
    const candidates = [
      manifest.paths?.[kind],
      manifest.files?.[kind],
      manifest[kind]
    ];
    return candidates.find(Boolean) || fallback;
  }

  function normalizeCatalog(payload) {
    const records = Array.isArray(payload) ? payload : payload.records || payload.catalog || [];
    return records.map((item) => ({
      ...item,
      id: item.id || item.record_id,
      eventId: item.eventId || item.event_id || item.event?.id,
      editions: item.editions || item.event?.editions || [],
      year: item.year || item.event?.year,
      parentId: item.parentId ?? item.parent_id ?? null,
      rootId: item.rootId || item.root_id || item.parentId || item.parent_id || item.id || item.record_id,
      contentStatus: item.contentStatus || item.content_status || item.content?.status,
      contentFormat: item.contentFormat || item.content_format || item.content?.format,
      solutionStatus: item.solutionStatus || item.solution_status || item.availability?.solutionStatus,
      hintCount: Number(item.hintCount ?? item.hint_count ?? item.availability?.hintCount ?? 0),
      additionalAnswerCount: Number(item.additionalAnswerCount ?? item.additional_answer_count ?? item.availability?.additionalAnswerCount ?? 0),
      assetCount: Number(item.assetCount ?? item.asset_count ?? item.availability?.assetCount ?? 0),
      hasAnswer: Boolean(item.hasAnswer ?? item.has_answer ?? item.availability?.hasAnswer),
      hasSolution: Boolean(item.hasSolution ?? item.has_solution ?? item.availability?.hasSolution),
      hasExtended: Boolean(item.hasExtended ?? item.has_extended ?? item.availability?.hasExtended),
      hasInteractive: Boolean(item.hasInteractive ?? item.has_interactive ?? item.availability?.hasInteractive),
      spoilerPath: item.spoilerPath || item.spoiler_path || null
    }));
  }

  function readStoredArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_error) {
      return [];
    }
  }

  async function initData() {
    state.manifest = await fetchJSON("data/manifest.json");
    const [catalogPayload, relationsPayload] = await Promise.all([
      fetchJSON(pathsFromManifest("catalog", "data/catalog.json")),
      fetchJSON(pathsFromManifest("relations", "data/relations.json"))
    ]);
    state.catalog = normalizeCatalog(catalogPayload);
    state.byId = new Map(state.catalog.map((record) => [record.id, record]));
    state.relations = {
      parents: relationsPayload.parents || {},
      children: relationsPayload.children || {},
      solutionRefs: relationsPayload.solutionRefs || relationsPayload.solution_refs || {}
    };
    const storedFavorites = readStoredArray("ccbc-handbook-favorites");
    const storedRecents = readStoredArray("ccbc-handbook-recents");
    state.favorites = new Set(storedFavorites.filter((id) => state.byId.has(id) || mechanismById(id)));
    state.recents = storedRecents.filter((id) => state.byId.has(id)).slice(0, 16);
  }

  function eventCorePath(eventId) {
    const manifest = state.manifest || {};
    const direct = manifest.core?.[eventId] || manifest.paths?.core?.[eventId] || manifest.files?.core?.[eventId];
    return direct || `data/core/${eventId}.json`;
  }

  async function loadCore(eventId) {
    if (state.coreCache.has(eventId)) return state.coreCache.get(eventId);
    const payload = await fetchJSON(eventCorePath(eventId));
    const records = Array.isArray(payload) ? payload : payload.records || [];
    const normalized = new Map(records.map((record) => [record.id || record.record_id, record]));
    state.coreCache.set(eventId, normalized);
    return normalized;
  }

  async function loadRecord(id) {
    const catalog = state.byId.get(id);
    if (!catalog) return null;
    const core = await loadCore(catalog.eventId);
    return { catalog, core: core.get(id) || null };
  }

  function spoilerPath(record) {
    if (record.spoilerPath) return record.spoilerPath;
    const manifestMap = state.manifest?.spoilers || state.manifest?.paths?.spoilers;
    if (manifestMap?.[record.id]) return manifestMap[record.id];
    const safeName = record.id.replaceAll(":", "__").replaceAll("/", "_");
    return `data/spoilers/${safeName}.json`;
  }

  async function loadSpoiler(id) {
    if (state.spoilerCache.has(id)) return state.spoilerCache.get(id);
    const record = state.byId.get(id);
    if (!record) throw new Error("未找到这道题");
    const payload = await fetchJSON(spoilerPath(record));
    state.spoilerCache.set(id, payload);
    return payload;
  }

  function searchPath(mode) {
    const manifest = state.manifest || {};
    return manifest.search?.[mode] || manifest.paths?.search?.[mode] || `search/${mode}.json`;
  }

  async function loadSearch(mode = "safe") {
    if (state.searchCache.has(mode)) return state.searchCache.get(mode);
    const payload = await fetchJSON(searchPath(mode));
    const docs = Array.isArray(payload) ? payload : payload.docs || payload.records || [];
    state.searchCache.set(mode, docs);
    return docs;
  }

  function scoreText(titleValue, textValue, query, tokens) {
    const title = normalize(titleValue);
    const text = normalize(textValue);
    const exact = normalize(query);
    let score = 0;
    if (title === exact) score += 120;
    else if (title.includes(exact)) score += 45;
    if (text.includes(exact)) score += 18;
    for (const token of tokens) {
      if (title.includes(token)) score += 12;
      if (text.includes(token)) score += token.length > 1 ? 3 : 1;
    }
    return score;
  }

  function scoreDoc(doc, query, tokens) {
    const fields = doc.fields && typeof doc.fields === "object"
      ? doc.fields
      : { [doc.field || "safe"]: doc.text || doc.searchText || doc.question || "" };
    let best = { score: 0, field: "safe" };
    for (const [field, text] of Object.entries(fields)) {
      if (!text) continue;
      const score = scoreText(field === "safe" ? doc.title : "", text, query, tokens);
      if (score > best.score) best = { score, field };
    }
    if (best.score && (doc.kind === "meta" || doc.kind === "final_meta")) best.score += 1;
    return best;
  }

  function snippet(text, query, maxLength = 150) {
    const source = String(text || "").replace(/\s+/g, " ").trim();
    if (!source) return "";
    const needle = normalize(query);
    const normalizedSource = normalize(source);
    const index = normalizedSource.indexOf(needle);
    const start = Math.max(0, index < 0 ? 0 : index - 48);
    const cropped = source.slice(start, start + maxLength);
    return `${start > 0 ? "…" : ""}${cropped}${start + maxLength < source.length ? "…" : ""}`;
  }

  function searchGuide(query) {
    const guide = window.CCBC_GUIDE || {};
    const exact = normalize(query);
    const tokens = queryTokens(query);
    const results = [];
    for (const symptom of guide.symptoms || []) {
      const text = [symptom.name, symptom.shortName, symptom.description, ...(symptom.aliases || []), ...(symptom.signals || [])].join(" ");
      const match = scoreDoc({ title: symptom.name, text }, query, tokens);
      if (match.score > 0 && (normalize(text).includes(exact) || tokens.some((token) => normalize(text).includes(token)))) {
        results.push({ type: "symptom", item: symptom, score: match.score });
      }
    }
    for (const axis of guide.axes || []) {
      for (const mechanism of axis.items || []) {
        const text = [mechanism.name, mechanism.description, ...(mechanism.aliases || []), ...(mechanism.signals || [])].join(" ");
        const match = scoreDoc({ title: mechanism.name, text }, query, tokens);
        if (match.score > 0 && (normalize(text).includes(exact) || tokens.some((token) => normalize(text).includes(token)))) {
          results.push({ type: "mechanism", axis, item: mechanism, score: match.score });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 12);
  }

  async function searchPuzzles(query, filters = {}) {
    if (!query.trim()) return [];
    const docs = await loadSearch(state.searchMode);
    const tokens = queryTokens(query);
    const grouped = new Map();
    for (const doc of docs) {
      const id = doc.id || doc.recordId || doc.record_id;
      const record = state.byId.get(id);
      if (!record) continue;
      if (filters.event && record.eventId !== filters.event) continue;
      if (filters.kind && record.kind !== filters.kind) continue;
      if (!filters.includeSubpuzzles && record.kind === "subpuzzle") continue;
      const match = scoreDoc({ ...doc, title: doc.title || record.title }, query, tokens);
      if (match.score <= 0) continue;
      const fields = doc.fields && typeof doc.fields === "object"
        ? doc.fields
        : { [doc.field || "safe"]: doc.text || doc.searchText || "" };
      const haystack = normalize(`${doc.title || record.title} ${Object.values(fields).join(" ")}`);
      if (!tokens.every((token) => haystack.includes(token)) && !haystack.includes(normalize(query))) continue;
      const rootId = doc.rootId || doc.root_id || record.rootId || id;
      const result = {
        doc,
        record,
        score: match.score,
        matchField: match.field,
        matchFieldLabel: SEARCH_FIELD_LABELS[match.field] || match.field,
        snippet: match.field === "safe" ? snippet(doc.snippetText || doc.text || doc.searchText, query) : ""
      };
      const existing = grouped.get(rootId);
      if (!existing || result.score > existing.score) grouped.set(rootId, result);
    }
    return [...grouped.values()].sort((a, b) => b.score - a.score).slice(0, 120);
  }

  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/mechanisms";
    const [pathPart, queryPart = ""] = raw.split("?");
    const parts = pathPart.split("/").filter(Boolean).map(decodeURIComponent);
    const query = new URLSearchParams(queryPart);
    let name = parts[0] || "mechanisms";
    const params = {};
    if (name === "puzzle" && parts[1]) params.id = parts.slice(1).join("/");
    if (name === "mechanism" && parts[1]) params.id = parts[1];
    if (name === "symptom" && parts[1]) params.id = parts[1];
    const allowed = new Set(["search", "quick", "mechanisms", "mechanism", "symptom", "puzzles", "puzzle", "saved", "about"]);
    if (!allowed.has(name)) name = "search";
    return { name, params, query };
  }

  function routeHref(name, param = "", query = "") {
    const suffix = param ? `/${encodeURIComponent(param)}` : "";
    return `#/${name}${suffix}${query ? `?${query}` : ""}`;
  }

  function mechanismById(id) {
    for (const axis of window.CCBC_GUIDE?.axes || []) {
      const item = (axis.items || []).find((entry) => entry.id === id);
      if (item) return { axis, item };
    }
    return null;
  }

  function axisById(id) {
    return (window.CCBC_GUIDE?.axes || []).find((axis) => axis.id === id) || null;
  }

  function stageGroupById(id) {
    return (window.CCBC_GUIDE?.stageGroups || []).find((group) => group.id === id) || null;
  }

  function stageGroupForSymptom(symptomId) {
    return (window.CCBC_GUIDE?.stageGroups || []).find((group) => (group.symptomIds || []).includes(symptomId)) || null;
  }

  function symptomById(id) {
    return (window.CCBC_GUIDE?.symptoms || []).find((entry) => entry.id === id) || null;
  }

  function saveLocalState() {
    localStorage.setItem("ccbc-handbook-favorites", JSON.stringify([...state.favorites]));
    localStorage.setItem("ccbc-handbook-recents", JSON.stringify(state.recents));
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    saveLocalState();
    return state.favorites.has(id);
  }

  function addRecent(id) {
    state.recents = [id, ...state.recents.filter((entry) => entry !== id)].slice(0, 16);
    saveLocalState();
  }

  function resetSpoilers() {
    state.spoilerCache.clear();
    state.searchCache.delete("hints");
    state.searchCache.delete("full");
    state.searchMode = "safe";
  }

  function refreshIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  }

  Object.assign(window, {
    CCBC: {
      state,
      KIND_LABELS,
      STATUS_LABELS,
      SEARCH_FIELD_LABELS,
      escapeHTML,
      normalize,
      queryTokens,
      formatEvent,
      kindLabel,
      statusLabel,
      icon,
      badge,
      sourcePath,
      fetchJSON,
      initData,
      loadRecord,
      loadSpoiler,
      loadSearch,
      searchGuide,
      searchPuzzles,
      snippet,
      parseHash,
      routeHref,
      mechanismById,
      axisById,
      symptomById,
      stageGroupById,
      stageGroupForSymptom,
      toggleFavorite,
      addRecent,
      resetSpoilers,
      refreshIcons
    }
  });
})();
