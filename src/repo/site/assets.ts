export function renderStyles(): string {
  return `<style>
      :root {
        /* GitHub Light Theme */
        --bg: #ffffff;
        --panel: #f6f8fa;
        --panel-soft: #ffffff;
        --text: #1f2328;
        --muted: #59636e;
        --line: #d1d9e0;
        --accent: #0969da;
        --accent-hover: #0550ae;
        --accent-strong: #0a3069;
        --shadow: 0 1px 3px rgba(27, 31, 36, 0.12), 0 8px 24px rgba(66, 74, 83, 0.12);
        --border-default: #d0d7de;
        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
        --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: var(--font-sans);
        line-height: 1.6;
      }

      a { 
        color: var(--accent); 
        text-decoration: none; 
      }
      a:hover {
        text-decoration: underline;
      }

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
        background: var(--panel);
        border-bottom: 1px solid var(--border-default);
        padding: 16px 0;
        box-shadow: 0 1px 0 rgba(27, 31, 36, 0.04);
      }

      .navbar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .nav-identity { display: flex; align-items: center; gap: 12px; }
      .nav-avatar { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border-default); }
      .nav-info { display: flex; flex-direction: column; line-height: 1.3; }
      .nav-name { font-weight: 600; font-size: 0.95rem; color: var(--text); }
      .nav-handle { font-size: 0.85rem; color: var(--muted); }
      .nav-handle a { color: var(--accent); }
      .nav-controls { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }

      .search {
        width: 300px;
        height: 32px;
        padding: 5px 12px;
        border: 1px solid var(--border-default);
        border-radius: 6px;
        background: var(--panel-soft);
        font-size: 0.875rem;
        color: var(--text);
      }
      .search:focus {
        outline: 2px solid var(--accent);
        outline-offset: -1px;
        border-color: var(--accent);
      }

      /* Main Content Layout */
      main { padding: 32px 0 64px; }

      /* Repository Section - Full Width */
      .repo-section {
        margin-top: 24px;
        padding: 24px;
        background: var(--panel-soft);
        border: 1px solid var(--border-default);
        border-radius: 6px;
      }

      .repo-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start;
        gap: 24px; 
        padding-bottom: 16px; 
        border-bottom: 1px solid var(--border-default);
      }
      
      .repo-title-area {
        flex: 1;
      }

      .repo-name { 
        display: inline-flex; 
        gap: 10px; 
        align-items: center; 
        font-weight: 600; 
        font-size: 1.125rem;
        color: var(--accent);
      }
      .repo-name:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }
      .repo-name img { 
        border: 1px solid var(--border-default); 
        border-radius: 6px;
      }
      
      .repo-description { 
        margin: 8px 0 0 42px;
        color: var(--muted); 
        font-size: 0.875rem;
        line-height: 1.5;
      }
      
      .repo-stats { 
        display: flex; 
        gap: 8px; 
        align-items: center;
        flex-wrap: wrap;
      }
      .repo-stats span { 
        padding: 5px 12px; 
        background: var(--panel-soft); 
        border: 1px solid var(--border-default); 
        border-radius: 6px; 
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--muted);
      }
      .repo-stats strong {
        font-weight: 600;
        color: var(--text);
      }

      /* Contribution Details - Recruiter Optimized */
      .contribution-list { display: grid; gap: 16px; margin-top: 16px; }
      .contribution { 
        padding: 16px; 
        border: 1px solid var(--border-default); 
        border-radius: 6px; 
        background: var(--bg); 
        transition: all 0.1s ease;
      }
      .contribution:hover {
        border-color: var(--muted);
        box-shadow: var(--shadow);
      }
      .pr-title { 
        font-weight: 600; 
        font-size: 1rem; 
        display: block; 
        margin-bottom: 8px;
        color: var(--accent);
      }
      .pr-title:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }

      .brief-description {
        margin: 0 0 12px 0;
        font-size: 0.875rem;
        color: var(--muted);
        line-height: 1.5;
      }

      .pr-facts {
        display: grid;
        gap: 6px;
        margin: 12px 0 0;
        padding-left: 20px;
        color: var(--muted);
        font-size: 0.875rem;
      }

      .pr-facts li {
        padding-left: 2px;
      }

      .pr-facts strong {
        color: var(--text);
        font-weight: 600;
      }

      .change-fact {
        line-height: 1.8;
      }

      .change-fact .diff-badge {
        margin-left: 4px;
      }

      /* GitHub-style diff badges */
      .diff-badge {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        padding: 2px 7px;
        border: 1px solid transparent;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 1.2;
        font-family: var(--font-mono);
      }
      .diff-badge.add {
        background: #dafbe1;
        border-color: #aceebb;
        color: #116329;
      }
      .diff-badge.del {
        background: #ffebe9;
        border-color: #ffcecb;
        color: #82071e;
      }

      .reviewed-by { 
        display: flex; 
        align-items: center; 
        gap: 6px;
        font-size: 0.75rem;
      }
      .review-label {
        font-weight: 600;
        color: var(--text);
      }
      .reviewers { 
        display: flex; 
        gap: 4px;
      }
      .reviewers img { 
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #1a7f37;
        transition: transform 0.1s ease;
      }
      .reviewers img:hover {
        transform: scale(1.15);
      }
      .merged-by { 
        color: var(--accent); 
        font-weight: 600;
      }

      .impact-note {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 12px;
        padding: 12px;
        background: #fff8c5;
        border-left: 3px solid #bf8700;
        border-radius: 6px;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .impact-icon {
        font-size: 1rem;
        line-height: 1;
        flex-shrink: 0;
      }

      .impact-note strong {
        color: var(--accent-strong);
        font-weight: 600;
      }

      .description-details {
        margin-top: 12px;
        cursor: pointer;
      }

      .description-details summary {
        color: var(--accent);
        font-size: 0.75rem;
        font-weight: 500;
        list-style: none;
        user-select: none;
        padding: 6px 0;
      }

      .description-details summary:hover {
        color: var(--accent-hover);
        text-decoration: underline;
      }

      .description-details summary::-webkit-details-marker {
        display: none;
      }

      .description-details[open] summary {
        margin-bottom: 8px;
      }

      .description { 
        display: grid;
        gap: 8px;
        margin-top: 8px; 
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        font-size: 0.875rem; 
        color: var(--muted);
        font-family: var(--font-sans);
        padding: 12px;
        background: var(--panel);
        border: 1px solid var(--border-default);
        border-radius: 6px;
      }
      .description.is-plain-markdown { white-space: pre-wrap; }
      .description > * { min-width: 0; }
      .description p { margin: 0 0 8px; }
      .description p:last-child { margin-bottom: 0; }
      .description h1,
      .description h2,
      .description h3,
      .description h4,
      .description h5,
      .description h6 { margin: 16px 0 8px; color: var(--text); font-weight: 600; line-height: 1.25; }
      .description h1 { font-size: 1.15rem; padding-bottom: 6px; border-bottom: 1px solid var(--border-default); }
      .description h2 { font-size: 1.05rem; padding-bottom: 6px; border-bottom: 1px solid var(--border-default); }
      .description h3 { font-size: 0.95rem; }
      .description h4,
      .description h5,
      .description h6 { font-size: 0.875rem; }
      .description ul,
      .description ol { margin: 6px 0; padding-left: 20px; }
      .description li { margin: 3px 0; }
      .description li > p { margin: 4px 0; }
      .description a,
      .description p,
      .description li { overflow-wrap: anywhere; }
      .description code { background: rgba(175, 184, 193, 0.2); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.85em; overflow-wrap: anywhere; }
      .description pre { max-width: 100%; margin: 8px 0; padding: 12px; overflow-x: auto; background: rgba(175, 184, 193, 0.2); border-radius: 6px; }
      .description pre code { padding: 0; background: transparent; border-radius: 0; }
      .description blockquote { margin: 8px 0; padding: 0 12px; color: var(--muted); border-left: 4px solid var(--border-default); }
      .description img { display: block; height: auto; max-width: 100%; border-radius: 6px; border: 1px solid var(--border-default); margin-top: 8px; }
      .description table { display: block; width: 100%; max-width: 100%; margin: 8px 0; overflow-x: auto; border-collapse: collapse; font-size: 0.875rem; }
      .description th,
      .description td { padding: 8px 12px; border: 1px solid var(--border-default); text-align: left; }
      .description th { background: var(--panel); font-weight: 600; color: var(--text); }
      .description hr { height: 1px; padding: 0; margin: 16px 0; background: var(--border-default); border: 0; }

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
        .navbar-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
        .nav-identity { align-self: flex-start; }
        .nav-controls { width: 100%; justify-content: flex-start; }
        .search { width: 100%; }
        .repo-header { flex-direction: column; }
        .repo-stats { justify-content: flex-start; }
      }
    </style>`;
}

export function renderScript(): string {
  return `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js"></script>
    <script>
      function renderMarkdownDescriptions() {
        const descriptions = document.querySelectorAll('.description-details');
        const canRenderMarkdown = window.marked && window.marked.parse && window.DOMPurify;

        if (window.marked && window.marked.setOptions) {
          window.marked.setOptions({ gfm: true, breaks: false });
        }

        descriptions.forEach((details) => {
          const source = details.querySelector('.description-markdown');
          const target = details.querySelector('.description');
          let markdown = '';

          if (source && source.textContent) {
            try {
              markdown = JSON.parse(source.textContent);
            } catch {
              markdown = source.textContent;
            }
          }

          markdown = markdown.trim();

          if (!target || !markdown) {
            details.hidden = true;
            return;
          }

          if (!canRenderMarkdown) {
            target.textContent = markdown;
            target.classList.add('is-plain-markdown');
            return;
          }

          const html = window.marked.parse(markdown);
          target.innerHTML = window.DOMPurify.sanitize(html);

          target.querySelectorAll('a[href]').forEach((link) => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });
        });
      }

      renderMarkdownDescriptions();

      const search = document.querySelector('#search');
      const sections = document.querySelectorAll('.repo-section');
      const empty = document.querySelector('#empty');

      function applyFilters() {
        const query = search ? search.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        sections.forEach((section) => {
          const matchQuery = !query || section.textContent.toLowerCase().includes(query);

          section.hidden = !matchQuery;
          if (!section.hidden) visibleCount++;
        });

        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      if (search) {
        search.addEventListener('input', applyFilters);
      }
    </script>`;
}
