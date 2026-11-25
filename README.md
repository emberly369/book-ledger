# Dorian’s Ledger of Interesting Books

Static archive, founded November 25, 2026. No dependencies or build step.

## Local use
Run `python -m http.server 8000` and open `http://localhost:8000`. Direct file opening may block JSON fetching.

## Publishing
In Settings → Pages, choose Deploy from a branch, `main`, `/ (root)`, Save. Expected URL: https://emberly369.github.io/book-ledger/.

## Records
Edit the array in `books.json`. Example shape (not a real accession):

```json
{
  "id": "0001",
  "title": "",
  "authors": [],
  "year": null,
  "added": "YYYY-MM-DD",
  "kind": "Unknown",
  "status": "Prospective",
  "topics": [],
  "discovery": "",
  "interest": "",
  "contributions": "",
  "attestations": [],
  "evidence": [],
  "questions": [],
  "revisions": [],
  "link": ""
}
```

Authorship: Human, AI, Collaborative, Unknown. Acquisition: Prospective, Digital copy, Physical copy. Attribute accounts and date revisions; retain disputed claims separately from evidence. Publish only material cleared for public disclosure.

## Collections and descriptions
`description` summarizes the work independently of `interest` (why it was selected). `type` is Book, Collection, Volume, Essay, Short story, or another explicit record type; missing type defaults to Book. `yearEnd` optionally gives the end of a publication span. A constituent record has `collections: [{"id":"0021","sequence":1}]`; multiple memberships are supported. IDs are stable and point to existing records. Search includes each record's own contents and direct parent titles; type, subject, authorship and physical-library filters apply to the record itself. Collection details list all direct members, including those outside current filters; following a hidden member clears filters. Counts separate collection records from other works. Acquisition is independently recorded, never inherited. No nested collection traversal is implied.

## Browsing
Results render in batches of 12. Scrolling near the end appends the next batch; Load more is also available for keyboard use and browsers without IntersectionObserver. Filters and sorting operate on the full dataset and reset the displayed batch. Record links reveal their target even beyond the first batch. The JSON file is still fetched in full.
