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
