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

Who asks: still to be decided by the owner (asked on 2026-11-24): either he asks ChatGPT with
search and Claude himself and pastes the answers here, or the session that runs the check uses
its own fetch tool as one of the two assistants.

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

**Questions to assistants.** Pending the decision on who asks (see above).

### After 2.13.0 is deployed

To be recorded with the same commands and questions.
