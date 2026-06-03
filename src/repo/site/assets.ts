export function renderStyles(): string {
  return `<style>
      :root {
        color-scheme: light;
        --bg: #fafafa;
        --panel: #ffffff;
        --panel-soft: #f6f6f6;
        --text: #111111;
        --muted: #666666;
        --line: #e2e2e2;
        --accent: #111111;
        --accent-strong: #000000;
        --chip: #eeeeee;
        --shadow: 0 18px 45px rgba(0, 0, 0, 0.06);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .shell {
        width: min(1680px, calc(100% - 32px));
        margin: 0 auto;
      }

      .hero {
        padding: 18px 0;
        border-bottom: 1px solid var(--line);
      }

      .profile {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 18px;
        align-items: center;
      }

      .identity {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        min-width: 0;
      }

      .avatar {
        width: 48px;
        height: 48px;
        border: 1px solid var(--line);
        border-radius: 50%;
      }

      h1 {
        margin: 0;
        font-size: 1.05rem;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: 0;
      }

      .handle {
        margin: 2px 0 0;
        color: var(--accent);
        font-weight: 700;
        font-size: 0.9rem;
      }

      .bio {
        max-width: 620px;
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 0.88rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        min-width: 360px;
      }

      .stat {
        min-height: 54px;
        padding: 9px 12px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 4px;
      }

      .stat strong {
        display: block;
        font-size: 1.05rem;
        line-height: 1.1;
      }

      .stat span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 14px 0;
        background: rgba(250, 250, 250, 0.94);
        border-bottom: 1px solid var(--line);
        backdrop-filter: blur(16px);
      }

      .toolbar-inner {
        display: grid;
        grid-template-columns: minmax(220px, 360px) 1fr;
        gap: 16px;
        align-items: center;
      }

      .search {
        width: 100%;
        min-height: 42px;
        padding: 0 14px;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: var(--panel);
        color: var(--text);
        font: inherit;
      }

      .filters {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 2px;
      }

      .filter {
        flex: 0 0 auto;
        min-height: 38px;
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--panel);
        color: var(--muted);
        font: inherit;
        cursor: pointer;
      }

      .filter span {
        margin-left: 6px;
        color: var(--accent);
        font-weight: 700;
      }

      .filter.is-active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .filter.is-active span {
        color: #dcebe5;
      }

      main {
        padding: 28px 0 56px;
      }

      .repo-section {
        margin-top: 18px;
        padding: 22px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 4px;
        box-shadow: var(--shadow);
      }

      .repo-header {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 16px;
        align-items: start;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--line);
      }

      .repo-name {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        font-weight: 800;
        font-size: 1.1rem;
      }

      .repo-name img {
        border: 1px solid var(--line);
        border-radius: 50%;
      }

      .repo-header p {
        max-width: 1080px;
        margin: 10px 0 0;
        color: var(--muted);
      }

      .repo-stats {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .repo-stats span,
      .labels span {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 0 9px;
        background: var(--chip);
        border-radius: 999px;
        color: var(--accent-strong);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .contribution-list {
        display: grid;
        gap: 12px;
        margin-top: 18px;
      }

      @media (min-width: 1280px) {
        .contribution-list {
          gap: 14px;
        }
      }

      .contribution {
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: var(--panel-soft);
      }

      .pr-title {
        font-weight: 800;
        color: var(--accent-strong);
      }

      .contribution p {
        margin: 8px 0 0;
        color: var(--muted);
      }

      .description {
        display: grid;
        gap: 10px;
        margin-top: 10px;
        color: var(--muted);
      }

      .description :is(p, ul, figure, h4) {
        margin: 0;
      }

      .description h4 {
        color: var(--text);
        font-size: 0.95rem;
      }

      .description ul {
        padding-left: 20px;
      }

      .description a {
        color: var(--text);
        text-decoration: underline;
        text-decoration-color: #b8b8b8;
        text-underline-offset: 3px;
      }

      .description code {
        padding: 2px 5px;
        background: #ffffff;
        border: 1px solid var(--line);
        border-radius: 4px;
        color: var(--text);
        font-size: 0.9em;
      }

      .description img {
        display: block;
        max-width: 100%;
        height: auto;
        max-height: 620px;
        object-fit: contain;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: #ffffff;
      }

      .markdown-table-wrap {
        max-width: 100%;
        overflow-x: auto;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: #ffffff;
      }

      .markdown-table {
        width: 100%;
        min-width: 860px;
        border-collapse: collapse;
        color: var(--text);
        font-size: 0.88rem;
      }

      .markdown-table th,
      .markdown-table td {
        padding: 12px;
        border-right: 1px solid var(--line);
        border-bottom: 1px solid var(--line);
        vertical-align: top;
        text-align: left;
      }

      .markdown-table th:last-child,
      .markdown-table td:last-child {
        border-right: 0;
      }

      .markdown-table tr:last-child td {
        border-bottom: 0;
      }

      .markdown-table th {
        background: #f3f3f3;
        color: var(--text);
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .markdown-table img {
        width: 100%;
        max-height: 440px;
      }

      .description-fallback {
        color: var(--muted);
      }

      .reviewed-by {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-size: 0.88rem;
        font-weight: 700;
      }

      .reviewers {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .reviewers a {
        display: inline-flex;
      }

      .reviewers img {
        width: 24px;
        height: 24px;
        border: 1px solid #ffffff;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 0 0 1px var(--line);
      }

      .merged-by {
        color: var(--text);
        text-decoration: underline;
        text-decoration-color: #b8b8b8;
        text-underline-offset: 3px;
      }

      .meta-row,
      .labels {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .meta-row span {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        min-height: 30px;
        padding: 0 10px;
        border: 1px solid #d4d4d4;
        border-radius: 999px;
        background: #ffffff;
        color: var(--text);
        font-size: 0.88rem;
        font-weight: 700;
      }

      .meta-row strong {
        color: var(--muted);
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .empty {
        margin-top: 28px;
        padding: 24px;
        border: 1px dashed var(--line);
        border-radius: 4px;
        color: var(--muted);
        text-align: center;
      }

      footer {
        padding: 28px 0;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-size: 0.92rem;
      }

      @media (max-width: 760px) {
        .hero {
          padding: 14px 0;
        }

        .profile,
        .toolbar-inner,
        .repo-header {
          grid-template-columns: 1fr;
        }

        .stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          min-width: 0;
        }

        .bio {
          white-space: normal;
        }

        .repo-stats {
          justify-content: flex-start;
        }
      }

      @media (max-width: 460px) {
        .stats {
          grid-template-columns: 1fr;
        }

        .identity {
          grid-template-columns: 1fr;
        }

        .repo-section {
          padding: 16px;
        }
      }
    </style>`;
}

export function renderScript(): string {
  return `<script>
      const search = document.querySelector('#search');
      const filters = [...document.querySelectorAll('.filter')];
      const sections = [...document.querySelectorAll('.repo-section')];
      const empty = document.querySelector('#empty');
      let activeLanguage = 'all';

      function normalize(value) {
        return value.toLowerCase().trim();
      }

      function applyFilters() {
        const query = normalize(search.value);
        let visibleCount = 0;

        sections.forEach((section) => {
          const languages = section.dataset.languages.split('|');
          const languageMatch = activeLanguage === 'all' || languages.includes(activeLanguage);
          const queryMatch = !query || normalize(section.textContent).includes(query);

          section.hidden = !(languageMatch && queryMatch);
          if (!section.hidden) visibleCount += 1;
        });

        empty.hidden = visibleCount !== 0;
      }

      search.addEventListener('input', applyFilters);
      filters.forEach((filter) => {
        filter.addEventListener('click', () => {
          activeLanguage = filter.dataset.language;
          filters.forEach((item) => item.classList.toggle('is-active', item === filter));
          applyFilters();
        });
      });
    </script>`;
}
