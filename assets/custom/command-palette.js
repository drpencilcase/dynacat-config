(function () {
  'use strict';

  // ── Customise these to match your setup ───────────────────────────────────
  var KAGI_SEARCH  = 'https://kagi.com/search?q=';   // change to your search engine
  var SUGGEST_URL  = '/api/search/autocomplete?q=';   // Glance built-in autocomplete endpoint
  var DEBOUNCE_MS  = 220;
  // ─────────────────────────────────────────────────────────────────────────

  // ── Index ──────────────────────────────────────────────────────────

  var _items = [];

  function _nameFromSrc(src) {
    if (!src) return '';
    try {
      var pathname = new URL(src, location.origin).pathname;
      var file = pathname.split('/').pop().replace(/\.[^.]+$/, '');
      if (file === 'favicon' || file === 'icon' || file === 'logo' || file === 'apple-touch-icon') {
        file = new URL(src, location.origin).hostname.replace(/^www\./, '').split('.')[0];
      }
      return file.split(/[-_]/).map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
    } catch (_) { return ''; }
  }

  function _nameFromHref(href) {
    if (!href) return '';
    try {
      var stem = new URL(href).hostname.replace(/^www\./, '').split('.')[0];
      return stem.charAt(0).toUpperCase() + stem.slice(1);
    } catch (_) { return href; }
  }

  function _widgetCategory(el) {
    var w = el.closest('.widget');
    if (!w) return '';
    var h = w.querySelector('.widget-title, .widget-header');
    return h ? h.textContent.trim().toLowerCase() : '';
  }

  function _buildIndex() {
    _items = [];

    document.querySelectorAll('.docker-container').forEach(function (el) {
      var link = el.querySelector('.min-width-0 a') || el.querySelector('a');
      var icon = el.querySelector('.docker-container-icon') || el.querySelector('img');
      if (!link || !link.href) return;
      var name = (link.textContent || '').trim()
        || _nameFromSrc(icon && icon.src)
        || _nameFromHref(link.href);
      _items.push({ name: name, href: link.href, icon: (icon && icon.src) || '', category: _widgetCategory(el) || 'services', type: 'local' });
    });

    document.querySelectorAll('.monitor-site').forEach(function (el) {
      var link = el.querySelector('a');
      var icon = el.querySelector('.monitor-site-icon') || el.querySelector('img');
      if (!link || !link.href) return;
      var name = (link.textContent || '').trim()
        || _nameFromSrc(icon && icon.src)
        || _nameFromHref(link.href);
      _items.push({ name: name, href: link.href, icon: (icon && icon.src) || '', category: _widgetCategory(el) || 'monitor', type: 'local' });
    });

    document.querySelectorAll('.bookmarks-link').forEach(function (el) {
      if (!el.href) return;
      var container = el.closest('.bookmarks-icon-container') || el.parentElement;
      var icon = container && container.querySelector('img');
      var name = _nameFromSrc(icon && icon.src) || _nameFromHref(el.href);
      _items.push({ name: name, href: el.href, icon: (icon && icon.src) || '', category: 'bookmarks', type: 'local' });
    });
  }

  // ── Filter & suggestions ───────────────────────────────────────────

  var _filtered   = [];
  var _sel        = 0;
  var _suggestTid = null;
  var _activeQ    = '';

  function _searchItem(q) {
    return { name: 'Search Kagi', query: q, href: KAGI_SEARCH + encodeURIComponent(q), icon: '', category: 'web search', type: 'search' };
  }

  function _filter(q) {
    _sel = 0;
    _activeQ = q;
    if (!q) {
      _filtered = _items.slice(0, 10);
      return;
    }
    var lq = q.toLowerCase();
    var local = _items.filter(function (it) {
      return it.name.toLowerCase().indexOf(lq) !== -1;
    }).slice(0, 6);
    _filtered = local.concat([_searchItem(q)]);
  }

  function _fetchSuggestions(q) {
    if (_suggestTid) clearTimeout(_suggestTid);
    if (!q) return;
    _suggestTid = setTimeout(function () {
      fetch(SUGGEST_URL + encodeURIComponent(q))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (q !== _activeQ) return; // stale
          var suggestions = Array.isArray(data)
            ? data.map(function (d) { return d.phrase || ''; }).filter(Boolean)
            : [];
          _injectSuggestions(q, suggestions.slice(0, 5));
        })
        .catch(function () {});
    }, DEBOUNCE_MS);
  }

  function _injectSuggestions(q, suggestions) {
    var locals = _filtered.filter(function (it) { return it.type === 'local'; });
    var web    = suggestions.map(function (s) {
      return { name: s, href: KAGI_SEARCH + encodeURIComponent(s), icon: '', category: 'kagi suggestion', type: 'suggestion' };
    });
    _filtered = locals.concat(web, [_searchItem(q)]);
    if (_sel >= _filtered.length) _sel = 0;
    _render();
  }

  // ── Render ─────────────────────────────────────────────────────────

  var SEARCH_SVG =
    '<svg class="dy-cp-icon dy-cp-icon--svg" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    '</svg>';

  function _render() {
    var list = document.getElementById('dy-cp-results');
    if (!list) return;
    list.innerHTML = '';

    if (_filtered.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'dy-cp-empty';
      empty.textContent = 'No results';
      list.appendChild(empty);
      return;
    }

    var firstWebIdx = -1;
    _filtered.forEach(function (it, i) {
      if (firstWebIdx === -1 && it.type !== 'local') firstWebIdx = i;
    });

    _filtered.forEach(function (item, i) {
      if (i === firstWebIdx && firstWebIdx > 0) {
        var sep = document.createElement('li');
        sep.className = 'dy-cp-divider';
        list.appendChild(sep);
      }

      var li = document.createElement('li');
      li.className = 'dy-cp-item dy-cp-item--' + item.type + (i === _sel ? ' is-selected' : '');

      var iconHtml;
      if (item.type === 'suggestion' || item.type === 'search') {
        iconHtml = SEARCH_SVG;
      } else {
        iconHtml = item.icon
          ? '<img class="dy-cp-icon" src="' + item.icon + '" alt="">'
          : '<span class="dy-cp-icon-placeholder"></span>';
      }

      var nameHtml;
      if (item.type === 'search') {
        nameHtml = 'Search Kagi for <em class="dy-cp-query">' + _esc(item.query) + '</em>';
      } else {
        nameHtml = _esc(item.name);
      }

      li.innerHTML =
        iconHtml +
        '<div class="dy-cp-item-info">' +
          '<span class="dy-cp-item-name">' + nameHtml + '</span>' +
          '<span class="dy-cp-item-meta">' + _esc(item.category) + '</span>' +
        '</div>';

      (function (href, idx) {
        li.addEventListener('click', function () { _navigate(href); });
        li.addEventListener('mouseenter', function () { _sel = idx; _render(); });
      }(item.href, i));

      list.appendChild(li);
    });

    var selected = list.querySelector('.is-selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Open / close / navigate ────────────────────────────────────────

  var _open = false;

  function _show(seed) {
    _open = true;
    var overlay = document.getElementById('dy-cp');
    var input   = document.getElementById('dy-cp-input');
    if (!overlay || !input) return;
    overlay.removeAttribute('hidden');
    _buildIndex();
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    input.value = seed || '';
    _filter(seed || '');
    _render();
    input.focus();
    if (seed) _fetchSuggestions(seed);
  }

  function _hide() {
    if (!_open) return;
    _open = false;
    if (_suggestTid) { clearTimeout(_suggestTid); _suggestTid = null; }
    var overlay = document.getElementById('dy-cp');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    setTimeout(function () { overlay.setAttribute('hidden', ''); }, 180);
  }

  function _navigate(href) {
    _hide();
    window.location.href = href;
  }

  // ── Keyboard handlers ──────────────────────────────────────────────

  function _onDocKeydown(e) {
    if (_open) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (document.activeElement && document.activeElement.isContentEditable) return;
    if (e.key.length !== 1) return;
    e.preventDefault();
    _show(e.key);
  }

  function _onInputKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      _hide();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      _sel = Math.min(_sel + 1, _filtered.length - 1);
      _render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _sel = Math.max(_sel - 1, 0);
      _render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (_filtered[_sel]) _navigate(_filtered[_sel].href);
    }
  }

  function _onInputInput(e) {
    var q = e.target.value;
    _filter(q);
    _render();
    _fetchSuggestions(q);
  }

  // ── DOM setup ──────────────────────────────────────────────────────

  function _mount() {
    if (document.getElementById('dy-cp')) return;
    var overlay = document.createElement('div');
    overlay.id = 'dy-cp';
    overlay.className = 'dy-cp-overlay';
    overlay.setAttribute('hidden', '');
    overlay.innerHTML =
      '<div class="dy-cp-modal">' +
        '<div class="dy-cp-input-row">' +
          '<svg class="dy-cp-search-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>' +
            '<line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
          '</svg>' +
          '<input id="dy-cp-input" type="text" class="dy-cp-input"' +
            ' placeholder="Search services, bookmarks & web…"' +
            ' autocomplete="off" spellcheck="false">' +
          '<kbd class="dy-cp-esc-hint">esc</kbd>' +
        '</div>' +
        '<ul id="dy-cp-results" class="dy-cp-results"></ul>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = document.getElementById('dy-cp-input');
    input.addEventListener('keydown', _onInputKeydown);
    input.addEventListener('input', _onInputInput);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) _hide();
    });
  }

  function _init() {
    _mount();
    _buildIndex();
    document.addEventListener('keydown', _onDocKeydown);
    document.addEventListener('htmx:afterSettle', _buildIndex);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
}());
