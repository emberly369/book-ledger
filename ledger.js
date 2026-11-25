// Add real entries here. No example entries are published as actual records.
      let books = [];
let loaded = false;
const PAGE_SIZE = 12;
let visibleRows = [], rendered = 0;
let observer;
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



function recordType(b) { return b.type || 'Book'; }
function memberships(b) { return b.collections || []; }
function parentsOf(b) { return memberships(b).map(m => books.find(p => p.id === m.id)).filter(Boolean); }
function membersOf(b) { return books.filter(x => memberships(x).some(m => m.id === b.id)).sort((a,c) => (memberships(a).find(m=>m.id===b.id).sequence ?? Infinity) - (memberships(c).find(m=>m.id===b.id).sequence ?? Infinity) || a.title.localeCompare(c.title)); }
function normalize(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function matches(b,q) { const hay = normalize(JSON.stringify(b) + ' ' + parentsOf(b).map(p=>p.title).join(' ')); return normalize(q).split(/\s+/).every(term=>hay.includes(term)); }
function resetFilters() { for(const id of ['q','kind','status','topic','type']) $(id).value=''; $('sort').value='title'; }
function revealRecord(id, focus = false) {
  if (!books.some(b => b.id === id)) return;
  if (!visibleRows.some(b => b.id === id)) { resetFilters(); render(); }
  const index = visibleRows.findIndex(b => b.id === id);
  while (index >= rendered && rendered < visibleRows.length) appendBatch();
  const target = document.getElementById('entry-' + id);
  if (target) { const pane = $('ledger-scroll'); pane.scrollTop += target.getBoundingClientRect().top - pane.getBoundingClientRect().top - pane.clientTop - 8; if (focus) target.focus({preventScroll:true}); }
}
function followHash() {
  if (!loaded || !location.hash.startsWith('#entry-')) return;
  try { revealRecord(decodeURIComponent(location.hash.slice(7))); } catch {}
}
function recordLink(b) {
  const a = el('a', b.title);
  a.href = '#entry-' + encodeURIComponent(b.id);
  a.addEventListener('click', e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    location.hash = 'entry-' + encodeURIComponent(b.id);
    revealRecord(b.id, true);
  });
  return a;
}
function relationships(a,b) {
  const parents=parentsOf(b);
  if(parents.length){const p=el('p',null,'relationships meta');p.append(document.createTextNode('Part of: '));parents.forEach((parent,i)=>{if(i)p.append(document.createTextNode(' · '));p.append(recordLink(parent));const n=memberships(b).find(m=>m.id===parent.id).sequence;if(n!=null)p.append(document.createTextNode(' · '+n));});a.append(p);}
  const children=membersOf(b);
  if(recordType(b)==='Collection'||children.length){const d=el('details',null,'relationships');d.append(el('summary',children.length+' constituent records'));const ul=el('ul');for(const child of children){const li=el('li');li.append(recordLink(child),document.createTextNode(' · '+(child.physicalLibrary||'Unknown')));ul.append(li);}d.append(ul);a.append(d);}
}

      function render() {
        if (!loaded) return;
        const q = $('q').value.toLowerCase().trim();
        let rows = books.filter(b => (!q || matches(b,q)) && (!$('type').value || recordType(b) === $('type').value) && (!$('kind').value || b.kind === $('kind').value) && (!$('status').value || (b.physicalLibrary || (b.status === 'Physical copy' ? 'Acquired' : 'Unknown')) === $('status').value) && (!$('topic').value || (b.topics || []).includes($('topic').value)));
        let s = $('sort').value;
        rows.sort((a, b) => s === 'title' ? a.title.localeCompare(b.title) : s === 'author' ? (a.authors || []).join(', ').localeCompare((b.authors || []).join(', ')) : s === 'year' ? (a.year ?? Infinity) - (b.year ?? Infinity) : (b.added || '').localeCompare(a.added || ''));
        $('count').textContent = `${rows.filter(b=>recordType(b)!=='Collection').length} of ${books.filter(b=>recordType(b)!=='Collection').length} works · ${rows.filter(b=>recordType(b)==='Collection').length} of ${books.filter(b=>recordType(b)==='Collection').length} collections`;
        $('ledger-scroll').scrollTop = 0;
        $('results').replaceChildren();
        visibleRows = rows; rendered = 0;
        observer?.unobserve($('pagination'));
        $('pagination').hidden = true;
        if (!rows.length) {
          const d = el('div', null, 'empty');
          d.append(el('h2', books.length ? 'No matching works' : 'The first page awaits.'), el('p', books.length ? 'Try clearing your filters.' : 'The ledger is open. No works have been accessioned yet.', 'muted'));
          $('results').append(d);
          return
        }
        appendBatch();
      }

      function appendBatch() {
        const end = Math.min(rendered + PAGE_SIZE, visibleRows.length);
        for (const b of visibleRows.slice(rendered, end)) {
          const a = el('article', null, 'entry');
          a.id='entry-'+b.id; a.tabIndex=-1;
          a.append(el('div', `Entry ${b.id||'—'} · Added ${b.added||'unknown'}`, 'meta'), el('h3', b.title), el('p', `${(b.authors||[]).join(', ')||'Authorship unknown'}${b.year?' · '+b.year+(b.yearEnd?'–'+b.yearEnd:''):''}`));
          for (const t of [recordType(b), b.kind, ...(b.topics || [])].filter(Boolean)) a.append(el('span', t, 'tag'));
          if(b.description) a.append(el('p',b.description,'entry-description'));
          relationships(a,b);
          field(a, 'Physical library', b.physicalLibrary || (b.status === 'Physical copy' ? 'Acquired' : 'Unknown'));
          field(a, 'Digital copy', b.digitalCopy || (b.status === 'Digital copy' ? 'Available' : 'Unknown'));
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
        rendered = end;
        const hasMore = rendered < visibleRows.length;
        $('pagination').hidden = !hasMore;
        $('progress').textContent = rendered + ' of ' + visibleRows.length + ' shown';
        observer?.unobserve($('pagination'));
        if (hasMore) observer?.observe($('pagination'));
      }
      for (const id of ['q', 'kind', 'status', 'topic', 'type', 'sort']) $(id).addEventListener(id === 'q' ? 'input' : 'change', render);
      $('reset').addEventListener('click', () => {
        resetFilters();
        render()
      });
      $('more').addEventListener('click', appendBatch);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => {
          if (entries.some(e => e.isIntersecting) && rendered < visibleRows.length) appendBatch();
        }, {root: $('ledger-scroll'), rootMargin: '180px 0px'});
      }
      window.addEventListener('hashchange', followHash);
      load();

async function load() {
  try {
    const response = await fetch('./books.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    books = await response.json();
    if (!Array.isArray(books)) throw new Error('Invalid ledger data');
    for (const t of [...new Set(books.flatMap(b => b.topics || []))].sort()) $('topic').append(new Option(t, t));
    for(const t of [...new Set(books.map(recordType))].sort()) $('type').append(new Option(t,t));
    loaded = true;
    render();
    followHash();
  } catch (error) {
    $('count').textContent = 'Unable to load the ledger.';
    $('results').replaceChildren(el('p', 'Please reload or serve this site over HTTP.', 'empty'));
    console.error(error);
  }
}
