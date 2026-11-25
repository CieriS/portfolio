# What AI agents read and answer about the site

Issue #177. A repeatable check of what assistants with web access say about the profile when
given only the site URL, and of what the site serves to AI user agents. Run it before a change
to what agents read and again after it is deployed, then compare. An invented fact is a bug:
open an issue for it.

No personal data beyond what the site already publishes is recorded here.

## Method

### 1. Raw fetch (no account needed)

For each user agent, fetch one HTML page, `robots.txt`, the sitemap and every agent file, and
note status, content type and redirects:

```bash
for ua in "GPTBot/1.2 (+https://openai.com/gptbot)" "ClaudeBot/1.0 (+claudebot@anthropic.com)" "PerplexityBot/1.0 (+https://perplexity.ai/perplexitybot)"; do
  for p in /en /en/identity /robots.txt /sitemap.xml /llms.txt /llms-full.txt /it/llms-full.txt /en/identity.md /en/systems/yourfinance.md; do
    printf "%-14s %-28s " "${ua%%/*}" "$p"
    curl -s -o /dev/null -A "$ua" -w "%{http_code} %{content_type} %{size_download}B %{redirect_url}\n" "https://cieri.vercel.app$p"
  done
done
```

Expected after 2.13.0: 200 on every line, `text/plain` for the `.txt` files, `text/markdown`
for the `.md` files, no redirect. A 403 or a challenge page means Vercel's bot protection is in
the way (Firewall → Bot Management on the Vercel dashboard).

### 2. Fixed questions to assistants

Ask each question in a new conversation of at least two assistants with web access, giving only
`https://cieri.vercel.app`. The questions do not change between runs:

1. "Who is Samuele Cieri and what does he do?"
2. "What role is he looking for?"
3. "Which projects has he built, and which have public code?"
4. "How can I get his CV?"
5. "What did he study and is it finished?"

For each answer note: correct facts, wrong facts, invented facts, sources cited. The reference
for "correct" is the site itself (`data/`), as of the run's date.

Who asks (decided on 2026-11-24): no personal assistant account is used. The questions go to
the **web fetch tool of the Claude Code session** that runs the check: it reads the pages it is
given, starting from `https://cieri.vercel.app/en`, and follows links on the site. It is a fetch,
**not an assistant with a search index**: it says what a page-reading agent understands, not
whether ChatGPT, Perplexity or Google would find and cite the site. Same tool, same start URL and
same questions on every run.

## Results

### 2026-11-24 — baseline, before 2.13.0 (production at v2.12.0)

**Raw fetch.** Same result for `GPTBot`, `ClaudeBot` and `PerplexityBot`:

| Path | Status | Content type |
| --- | --- | --- |
| `/en`, `/en/identity` | 200 | `text/html` |
| `/robots.txt` | 200 | `text/plain` (`User-Agent: *`, `Allow: /`, `Host:`, `Sitemap:`) |
| `/sitemap.xml` | 200 | `application/xml` |
| `/llms.txt`, `/llms-full.txt`, `/en/identity.md` | 404 | `text/html` (the branded 404) |

No redirect and no bot challenge: Vercel's bot protection does not block these user agents.

**Questions (web fetch, starting from `/en`).** 4 pages fetched (`/en`, `/en/identity`,
`/en/execution`, `/en/systems`); no invented fact.

| Question | Answer | Correct? |
| --- | --- | --- |
| Who is he | Software Developer at Tas since 2022 (Angular, TypeScript), Scrum Master, moving into Data Engineering; Computer Engineering part-time in Bologna | correct |
| Role sought | Data Engineer, full remote | correct |
| Projects | aria-er (public, repository and v1.2.0 linked) and yourFinance (private, demo on request, v1.3.1) | correct |
| CV | on request: leave an e-mail, a link arrives; LinkedIn is the fastest contact | correct, but the tool saw a "Password" label and could not tell whether a password is needed |
| Studies | Computer Engineering at Bologna, part-time, paused 2023–2024, not finished | correct; dates read as `12.11.2021 … Now` from the timeline |

Reading notes from the tool: the layout of the timeline and the project topology came out as lists
in approximate order; the case studies were not opened (the projects page was enough).

## AI crawler names (#175)

Checked on 2026-11-24 on the vendors' pages; the policy is in `lib/agents/crawlers.ts` (all
allowed, by group, `/api/` closed).

| Group | User agents | Source |
| --- | --- | --- |
| Search and answer indexing | `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` | [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/guides/bots) |
| Fetch on a user's request | `ChatGPT-User`, `Claude-User`, `Perplexity-User` (OpenAI and Perplexity say these may ignore robots.txt) | same pages |
| Model training | `GPTBot`, `ClaudeBot`, `Google-Extended` and `Applebot-Extended` (control tokens, not crawlers), `CCBot` | same pages, [Google](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers), [Apple](https://support.apple.com/en-us/119829) |

### 2026-11-25 — after 2.13.0 is deployed (merge `613112e`)

**Raw fetch.** Same result for `GPTBot`, `ClaudeBot` and `PerplexityBot`, no redirect, no bot
challenge:

| Path | Before | After |
| --- | --- | --- |
| `/en`, `/en/identity` | 200 `text/html` | 200 `text/html` |
| `/robots.txt` | 200, `*` only, `Host:` | 200, AI crawlers by group, `Disallow: /api/`, no `Host:` |
| `/sitemap.xml` | 200 | 200 |
| `/llms.txt` | 404 | 200 `text/plain` (2.8 KB) |
| `/llms-full.txt`, `/it/llms-full.txt` | 404 | 200 `text/plain` (21.8 KB, 22.9 KB) |
| `/en/identity.md`, `/en/systems/yourfinance.md` | 404 | 200 `text/markdown`, `X-Robots-Tag: noindex` |

`/en/identity` carries `<link rel="alternate" type="text/markdown" href="https://cieri.vercel.app/en/identity.md">`.

**Questions (web fetch, starting from `/en`).** 4 pages fetched again (`/en`, `/en/identity`,
`/en/execution`, `/en/systems`). All five answers correct, no wrong or invented fact, so no issue
opened.

| Question | Difference from the baseline |
| --- | --- |
| Who is he | same facts, plus the internship → apprenticeship → permanent path and the CSM date |
| Role sought | same |
| Projects | same |
| CV | the "Password" doubt is gone: email address, then "Send link" |
| Studies | same; dates still read as `DD.MM.YYYY` from the HTML timeline |

**What did not change.** The fetch tool neither noticed nor used `/llms.txt` or the `.md`
versions: it reads the converted body of a page, and the `rel="alternate"` link sits in `<head>`,
which it does not see. Agents that look for `llms.txt` on their own, or are pointed to it, get the
new files; a plain page fetch still reads the HTML, which already answered correctly. Decorative
text ("Move the cursor…", "Thread A/B/C") still reaches the converted page.

