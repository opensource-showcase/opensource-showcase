export function renderStyles(): string {
  return `<style>
      :root {
        /* Professional Light Theme - Full Width Layout */
        --bg: #f9f9f9;
        --panel: #ffffff;
        --panel-soft: #f4f4f5;
        --text: #09090b;
        --muted: #71717a;
        --line: #e4e4e7;
        --accent: #18181b;
        --accent-strong: #000000;
        --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
      }

      a { color: inherit; text-decoration: none; }

      /* Full Width Container */
      .shell {
        width: 95%;
        max-width: 1800px;
        margin: 0 auto;
      }

      /* Sticky Professional Navbar */
      .navbar {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--line);
        padding: 12px 0;
      }

      .navbar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .nav-identity { display: flex; align-items: center; gap: 12px; }
      .nav-avatar { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line); }
      .nav-info { display: flex; flex-direction: column; line-height: 1.2; }
      .nav-name { font-weight: 700; font-size: 0.95rem; }
      .nav-handle { font-size: 0.8rem; color: var(--muted); }
      .nav-controls { display: flex; align-items: center; gap: 16px; }

      .search {
        width: 300px;
        height: 36px;
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--panel);
        font-size: 0.85rem;
      }

      .filters { display: flex; gap: 4px; background: var(--panel-soft); padding: 3px; border-radius: 6px; border: 1px solid var(--line); }
      .filter { height: 30px; padding: 0 12px; border: none; background: transparent; cursor: pointer; border-radius: 4px; font-weight: 500; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }
      .filter.is-active { background: var(--panel); box-shadow: var(--shadow); font-weight: 600; }

      /* Main Content Layout */
      main { padding: 32px 0 64px; }

      .repo-section {
        margin-top: 24px;
        padding: 24px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 12px;
        box-shadow: var(--shadow);
      }

      .repo-header { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
      .repo-name { display: inline-flex; gap: 10px; align-items: center; font-weight: 600; font-size: 1.15rem; }
      .repo-name img { border: 1px solid var(--line); border-radius: 6px; }
      .repo-header > div:first-child p { margin: 10px 0 0; color: var(--muted); font-size: 0.9rem; }
      .repo-stats { display: flex; gap: 8px; align-items: center; }
      .repo-stats span { padding: 4px 10px; background: var(--panel-soft); border: 1px solid var(--line); border-radius: 6px; font-size: 0.8rem; font-weight: 500; }

      /* Contribution Details */
      .contribution-list { display: grid; gap: 16px; margin-top: 20px; }
      .contribution { padding: 20px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel-soft); }
      .pr-title { font-weight: 600; font-size: 1.05rem; display: block; margin-bottom: 8px; }

      .description-details {
        margin-top: 12px;
        cursor: pointer;
      }

      .description-details summary {
        color: var(--accent);
        font-size: 0.9rem;
        font-weight: 600;
        list-style: none;
        user-select: none;
        padding: 8px 0;
      }

      .description-details summary::-webkit-details-marker {
        display: none;
      }

      .description-details[open] summary {
        margin-bottom: 8px;
      }

      .description { 
        display: grid;
        gap: 10px;
        margin-top: 12px; 
        font-size: 0.9rem; 
        color: var(--muted);
        padding: 14px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 6px;
      }
      .description p { margin: 0 0 8px; }
      .description p:last-child { margin-bottom: 0; }
      .description h4 { margin: 16px 0 8px; font-size: 0.95rem; color: var(--text); }
      .description ul { margin: 8px 0; padding-left: 20px; }
      .description li { margin: 4px 0; }
      .description code { background: #eee; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 0.88em; }
      .description img { max-width: 100%; border-radius: 6px; border: 1px solid var(--line); margin-top: 12px; }

      .markdown-table-wrap { margin-top: 12px; border: 1px solid var(--line); border-radius: 6px; overflow-x: auto; background: var(--panel); }
      .markdown-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
      .markdown-table th, .markdown-table td { padding: 10px; border: 1px solid var(--line); text-align: left; }
      .markdown-table th { background: var(--panel-soft); font-weight: 600; }

      .impact-note {
        margin-top: 12px;
        padding: 12px 16px;
        background: #fff9e6;
        border-left: 3px solid #ffc107;
        border-radius: 6px;
        font-size: 0.9rem;
      }

      .impact-note strong {
        color: var(--accent-strong);
      }

      .reviewed-by { 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        margin-top: 16px; 
        padding-top: 14px; 
        border-top: 1px solid var(--line); 
        font-size: 0.88rem; 
        color: var(--muted);
      }
      .reviewers { display: flex; gap: 4px; }
      .reviewers img { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--line); }
      .merged-by { color: var(--accent); font-weight: 500; }

      .meta-row { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
      .meta-row span { padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; font-size: 0.85rem; font-weight: 500; background: var(--panel); }
      .meta-row strong { font-weight: 600; margin-right: 4px; }

      .labels { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
      .labels span { padding: 3px 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 4px; font-size: 0.75rem; font-weight: 500; }

      .empty { 
        padding: 48px; 
        text-align: center; 
        border: 1px dashed var(--line); 
        border-radius: 8px;
        color: var(--muted);
      }

      footer {
        padding: 24px 0;
        border-top: 1px solid var(--line);
        text-align: center;
        color: var(--muted);
        font-size: 0.85rem;
      }

      @media (max-width: 768px) {
        .navbar-inner { flex-direction: column; gap: 16px; }
        .nav-controls { width: 100%; flex-direction: column; }
        .search { width: 100%; }
        .repo-header { flex-direction: column; }
        .repo-stats { justify-content: flex-start; }
      }
    </style>`;
}

export function renderScript(languageFiltersHtml: string): string {
  return `<script>
      // Inject language filters
      const filtersContainer = document.querySelector('#filters-container');
      if (filtersContainer) {
        filtersContainer.innerHTML = \`${languageFiltersHtml}\`;
      }

      const search = document.querySelector('#search');
      const filters = document.querySelectorAll('.filter');
      const sections = document.querySelectorAll('.repo-section');
      const empty = document.querySelector('#empty');
      let activeLanguage = 'all';

      function applyFilters() {
        const query = search.value.toLowerCase().trim();
        let visibleCount = 0;

        sections.forEach((section) => {
          const languages = section.dataset.languages.split('|');
          const matchLang = activeLanguage === 'all' || languages.includes(activeLanguage);
          const matchQuery = !query || section.textContent.toLowerCase().includes(query);

          section.hidden = !(matchLang && matchQuery);
          if (!section.hidden) visibleCount++;
        });

        empty.hidden = visibleCount !== 0;
      }

      if (search) {
        search.addEventListener('input', applyFilters);
      }

      filters.forEach((filter) => {
        filter.addEventListener('click', () => {
          activeLanguage = filter.dataset.language;
          filters.forEach((f) => f.classList.toggle('is-active', f === filter));
          applyFilters();
        });
      });
    </script>`;
}
