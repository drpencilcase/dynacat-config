(function () {
  function shuffleList(ul) {
    var items = Array.from(ul.children).filter(function (el) {
      return el.classList.contains('art-byline');
    });
    if (items.length < 2) return;
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      ul.insertBefore(items[j], items[i]);
    }
    var limit = parseInt(ul.dataset.displayLimit, 10);
    if (limit > 0 && items.length > limit) {
      Array.from(ul.children)
        .filter(function (el) { return el.classList.contains('art-byline'); })
        .slice(limit)
        .forEach(function (el) { el.remove(); });
    }
  }

  // Only fires when a new shuffle-list element is *added* to the DOM.
  // insertBefore on <li> items adds <li> nodes, not <ul> nodes, so the
  // filter below won't match them — no infinite loop.
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('.articles[data-shuffle="true"]')) {
          shuffleList(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('.articles[data-shuffle="true"]').forEach(shuffleList);
        }
      });
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
