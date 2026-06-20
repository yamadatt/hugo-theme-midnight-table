window.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.toc-sidebar');
  if (!sidebar) return;

  const headings = Array.from(document.querySelectorAll('.prose h2, .prose h3'));
  const tocLinks = Array.from(document.querySelectorAll('.toc-sidebar a'));
  
  if (headings.length === 0 || tocLinks.length === 0) return;

  let activeLink = null;

  function updateActiveToc() {
    // ヘッダーの高さや余白を考慮したオフセット（120px）
    const scrollPosition = window.scrollY + 120;
    
    // 現在のスクロール位置より上にある、最も近い見出しを見つける
    let currentHeading = null;
    for (let i = 0; i < headings.length; i++) {
      if (headings[i].offsetTop <= scrollPosition) {
        currentHeading = headings[i];
      } else {
        break;
      }
    }

    // ページの最上部に近い場合はアクティブ表示をクリア
    if (window.scrollY < 100) {
      currentHeading = null;
    }

    // 見出しのIDに一致する目次リンクを探す
    let targetLink = null;
    if (currentHeading) {
      const id = currentHeading.getAttribute('id');
      targetLink = tocLinks.find(link => {
        const href = link.getAttribute('href');
        if (!href) return false;
        // href が '#id' もしくは URLエンコードされた '#id' と一致するかチェック
        const decodedHref = decodeURIComponent(href);
        return href === '#' + id || decodedHref === '#' + id;
      });
    }

    if (activeLink !== targetLink) {
      if (activeLink) activeLink.classList.remove('active');
      if (targetLink) {
        targetLink.classList.add('active');
        activeLink = targetLink;
        
        // アクティブな目次項目がサイドバーの表示領域内に収まるようにスクロール調整
        const sidebarContainer = document.querySelector('.toc-sidebar-container');
        if (sidebarContainer) {
          const linkOffset = targetLink.offsetTop;
          const containerHeight = sidebarContainer.clientHeight;
          const containerScroll = sidebarContainer.scrollTop;
          
          if (linkOffset < containerScroll || linkOffset > containerScroll + containerHeight - 40) {
            sidebarContainer.scrollTo({
              top: linkOffset - containerHeight / 2,
              behavior: 'smooth'
            });
          }
        }
      } else {
        activeLink = null;
      }
    }
  }

  // スクロール時に requestAnimationFrame を用いて処理を軽量化
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveToc();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // 初回読み込み時にも実行
  updateActiveToc();
});
