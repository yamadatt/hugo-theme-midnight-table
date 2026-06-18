(function () {
  var indexUrl = "/index.json";
  var state = {
    index: null,
    overlay: null,
    input: null,
    results: null,
    status: null,
    previousFocus: null,
    matches: [],
    activeIndex: -1
  };

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFKC");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function createSearch() {
    var overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.hidden = true;
    overlay.innerHTML = [
      '<div class="search-backdrop" data-search-close></div>',
      '<section class="search-panel" role="dialog" aria-modal="true" aria-label="検索">',
      '  <div class="search-box">',
      '    <span class="search-box-icon">⌕</span>',
      '    <input class="search-input" type="search" placeholder="検索" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="search-results">',
      '    <button class="search-close" type="button" data-search-close aria-label="閉じる">×</button>',
      '  </div>',
      '  <div class="search-status" aria-live="polite"></div>',
      '  <div class="search-results" id="search-results" role="listbox"></div>',
      '</section>'
    ].join("");

    document.body.appendChild(overlay);
    state.overlay = overlay;
    state.input = overlay.querySelector(".search-input");
    state.results = overlay.querySelector(".search-results");
    state.status = overlay.querySelector(".search-status");

    overlay.addEventListener("click", function (event) {
      if (event.target.closest("[data-search-close]")) {
        closeSearch();
      }
    });

    state.input.addEventListener("input", function () {
      renderResults(state.input.value);
    });

    state.input.addEventListener("keydown", handleResultKeys);

    state.results.addEventListener("mousemove", function (event) {
      var result = event.target.closest(".search-result");
      if (!result) return;
      setActiveResult(Number(result.getAttribute("data-result-index")));
    });
  }

  function ensureSearch() {
    if (!state.overlay) {
      createSearch();
    }
    if (state.index) {
      return Promise.resolve(state.index);
    }
    return fetch(indexUrl, { headers: { "Accept": "application/json" } })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Search index failed");
        }
        return response.json();
      })
      .then(function (items) {
        state.index = items.map(function (item) {
          var categories = Array.isArray(item.categories) ? item.categories : [];
          var tags = Array.isArray(item.tags) ? item.tags : [];
          var haystack = [
            item.title,
            item.summary,
            item.content,
            categories.join(" "),
            tags.join(" ")
          ].join(" ");
          return {
            title: item.title,
            url: item.url,
            date: item.date,
            summary: item.summary,
            categories: categories,
            tags: tags,
            haystack: normalize(haystack),
            titleText: normalize(item.title),
            taxonomyText: normalize(categories.concat(tags).join(" "))
          };
        });
        return state.index;
      });
  }

  function scoreItem(item, terms, query) {
    var score = 0;
    if (item.titleText.indexOf(query) !== -1) score += 40;
    if (item.taxonomyText.indexOf(query) !== -1) score += 20;

    terms.forEach(function (term) {
      if (item.titleText.indexOf(term) !== -1) score += 20;
      if (item.taxonomyText.indexOf(term) !== -1) score += 10;
      if (item.haystack.indexOf(term) !== -1) score += 2;
    });

    return score;
  }

  function renderResults(rawQuery) {
    if (!state.index) {
      state.status.textContent = "読み込み中";
      state.results.innerHTML = "";
      state.matches = [];
      state.activeIndex = -1;
      return;
    }

    var query = normalize(rawQuery).trim();
    if (!query) {
      state.status.textContent = "";
      state.results.innerHTML = "";
      state.matches = [];
      state.activeIndex = -1;
      syncActiveResult();
      return;
    }

    var terms = query.split(/\s+/).filter(Boolean);
    var matches = state.index
      .map(function (item) {
        return { item: item, score: scoreItem(item, terms, query) };
      })
      .filter(function (entry) {
        return entry.score > 0 && terms.every(function (term) {
          return entry.item.haystack.indexOf(term) !== -1;
        });
      })
      .sort(function (a, b) {
        return b.score - a.score || b.item.date.localeCompare(a.item.date);
      })
      .slice(0, 12);

    if (!matches.length) {
      state.status.textContent = "検索結果はありません";
      state.results.innerHTML = "";
      state.matches = [];
      state.activeIndex = -1;
      syncActiveResult();
      return;
    }

    state.matches = matches;
    state.activeIndex = 0;
    state.status.textContent = matches.length + "件";
    state.results.innerHTML = matches.map(function (entry, index) {
      var item = entry.item;
      var taxonomy = item.categories.concat(item.tags).slice(0, 5).join(" / ");
      return [
        '<a class="search-result" id="search-result-' + index + '" role="option" aria-selected="false" data-result-index="' + index + '" href="' + escapeHtml(item.url) + '">',
        '  <span class="search-result-title">' + escapeHtml(item.title) + '</span>',
        '  <span class="search-result-meta">' + escapeHtml([item.date, taxonomy].filter(Boolean).join(" ・ ")) + '</span>',
        item.summary ? '  <span class="search-result-summary">' + escapeHtml(item.summary) + '</span>' : "",
        '</a>'
      ].join("");
    }).join("");
    syncActiveResult();
  }

  function setActiveResult(index) {
    if (!state.matches.length) {
      state.activeIndex = -1;
      syncActiveResult();
      return;
    }

    state.activeIndex = (index + state.matches.length) % state.matches.length;
    syncActiveResult();
  }

  function syncActiveResult() {
    if (!state.input || !state.results) return;

    var resultElements = state.results.querySelectorAll(".search-result");
    resultElements.forEach(function (result) {
      result.classList.remove("is-active");
      result.setAttribute("aria-selected", "false");
    });

    if (state.activeIndex < 0 || !resultElements[state.activeIndex]) {
      state.input.removeAttribute("aria-activedescendant");
      return;
    }

    var activeResult = resultElements[state.activeIndex];
    activeResult.classList.add("is-active");
    activeResult.setAttribute("aria-selected", "true");
    state.input.setAttribute("aria-activedescendant", activeResult.id);
    activeResult.scrollIntoView({ block: "nearest" });
  }

  function handleResultKeys(event) {
    if (!state.overlay || state.overlay.hidden) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResult(state.activeIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResult(state.activeIndex - 1);
      return;
    }

    if (event.key === "Home" && state.matches.length) {
      event.preventDefault();
      setActiveResult(0);
      return;
    }

    if (event.key === "End" && state.matches.length) {
      event.preventDefault();
      setActiveResult(state.matches.length - 1);
      return;
    }

    if (event.key === "Enter" && state.activeIndex >= 0 && state.matches[state.activeIndex]) {
      event.preventDefault();
      window.location.href = state.matches[state.activeIndex].item.url;
    }
  }

  function openSearch() {
    if (!state.overlay) {
      createSearch();
    }
    state.previousFocus = document.activeElement;
    state.overlay.hidden = false;
    document.documentElement.classList.add("search-open");
    state.input.focus();
    state.input.select();
    renderResults(state.input.value);

    ensureSearch()
      .then(function () {
        renderResults(state.input.value);
      })
      .catch(function () {
        if (state.status) {
          state.status.textContent = "検索を読み込めませんでした";
        }
      });
  }

  function closeSearch() {
    if (!state.overlay || state.overlay.hidden) return;
    state.overlay.hidden = true;
    document.documentElement.classList.remove("search-open");
    if (state.previousFocus && typeof state.previousFocus.focus === "function") {
      state.previousFocus.focus();
    }
  }

  function setMenuOpen(open) {
    var topbar = document.querySelector(".topbar");
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!topbar || !toggle) return;

    topbar.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function isMenuOpen() {
    var topbar = document.querySelector(".topbar");
    return Boolean(topbar && topbar.classList.contains("nav-open"));
  }

  document.addEventListener("click", function (event) {
    var menuToggle = event.target.closest("[data-menu-toggle]");
    if (menuToggle) {
      event.preventDefault();
      setMenuOpen(!isMenuOpen());
      return;
    }

    if (event.target.closest(".nav a") || event.target.closest(".nav [data-search-open]")) {
      setMenuOpen(false);
    } else if (!event.target.closest(".topbar")) {
      setMenuOpen(false);
    }

    if (event.target.closest("[data-search-open]")) {
      openSearch();
    }
  });

  document.addEventListener("keydown", function (event) {
    var key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && key === "k") {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key === "Escape") {
      closeSearch();
      setMenuOpen(false);
    }
  });
})();
