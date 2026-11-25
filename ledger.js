// Add real entries here. No example entries are published as actual records.
      let books = [];
let loaded = false;
      // Entry shape: {id:'001', title:'', authors:[], year:null, added:'YYYY-MM-DD', kind:'Unknown', status:'Prospective', topics:[], discovery:'', interest:'', contributions:'', attestations:[], evidence:[], questions:[], revisions:[], link:''}
      const $ = id => document.getElementById(id);
      const el = (tag, txt, cls) => {
        const e = document.createElement(tag);
        if (txt != null) e.textContent = txt;
        if (cls) e.className = cls;
        return e
      };

      function field(parent, label, value) {
        if (!value || (Array.isArray(value) && !value.length)) return;
        const p = el('p');
        p.append(el('strong', label + ': '), document.createTextNode(Array.isArray(value) ? value.join(' · ') : value));
        parent.append(p)
      }


      function render() {
        if (!loaded) return;
        const q = $('q').value.toLowerCase().trim();
        let rows = books.filter(b => (!q || JSON.stringify(b).toLowerCase().includes(q)) && (!$('kind').value || b.kind === $('kind').value) && (!$('status').value || b.status === $('status').value) && (!$('topic').value || (b.topics || []).includes($('topic').value)));
        let s = $('sort').value;
        rows.sort((a, b) => s === 'title' ? a.title.localeCompare(b.title) : s === 'author' ? (a.authors || []).join(', ').localeCompare((b.authors || []).join(', ')) : s === 'year' ? (a.year ?? Infinity) - (b.year ?? Infinity) : (b.added || '').localeCompare(a.added || ''));
        $('count').textContent = `${rows.length} of ${books.length} works`;
        $('results').replaceChildren();
        if (!rows.length) {
          const d = el('div', null, 'empty');
          d.append(el('h2', books.length ? 'No matching works' : 'The first page awaits.'), el('p', books.length ? 'Try clearing your filters.' : 'The ledger is open. No works have been accessioned yet.', 'muted'));
          $('results').append(d);
          return
        }
        for (const b of rows) {
          const a = el('article', null, 'entry');
          a.append(el('div', `Entry ${b.id||'—'} · Added ${b.added||'unknown'}`, 'meta'), el('h3', b.title), el('p', `${(b.authors||[]).join(', ')||'Authorship unknown'}${b.year?' · '+b.year:''}`));
          for (const t of [b.kind, b.status, ...(b.topics || [])].filter(Boolean)) a.append(el('span', t, 'tag'));
          field(a, 'Why it caught our attention', b.interest);
          const d = el('details');
          d.append(el('summary', 'Provenance and archival record'));
          for (const [k, v] of [
              ['Discovery', b.discovery],
              ['Contributions', b.contributions],
              ['Attributed accounts', b.attestations],
              ['Evidence', b.evidence],
              ['Open questions', b.questions],
              ['Revision history', b.revisions]
            ]) field(d, k, v);
          if (b.link) {
            try {
              const u = new URL(b.link);
              if (['https:', 'http:'].includes(u.protocol)) {
                const l = el('a', 'Visit work or source');
                l.href = u.href;
                l.rel = 'noopener noreferrer';
                d.append(l)
              }
            } catch {}
          }
          a.append(d);
          $('results').append(a)
        }
      }
      for (const id of ['q', 'kind', 'status', 'topic', 'sort']) $(id).addEventListener(id === 'q' ? 'input' : 'change', render);
      $('reset').addEventListener('click', () => {
        for (const id of ['q', 'kind', 'status', 'topic']) $(id).value = '';
        $('sort').value = 'recent';
        render()
      });
      load();

async function load() {
  try {
    const response = await fetch('./books.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    books = await response.json();
    if (!Array.isArray(books)) throw new Error('Invalid ledger data');
    for (const t of [...new Set(books.flatMap(b => b.topics || []))].sort()) $('topic').append(new Option(t, t));
    loaded = true;
    render();
  } catch (error) {
    $('count').textContent = 'Unable to load the ledger.';
    $('results').replaceChildren(el('p', 'Please reload or serve this site over HTTP.', 'empty'));
    console.error(error);
  }
}
