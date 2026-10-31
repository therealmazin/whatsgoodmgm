# One-time setup (do together, ~15 min)

1. **Sanity revalidation webhook**: manage.sanity.io -> project r4b3vt07 -> API -> Webhooks -> create:
   POST https://whatsgoodmgm.com/api/revalidate?secret=<REVALIDATE_SECRET from .env.local>,
   dataset production, trigger on create/update/delete. Verify: edit an event in Studio,
   site updates within seconds.
2. **GitHub secrets** (backups only): repo Settings -> Secrets and variables -> Actions ->
   add SANITY_PROJECT_ID and SANITY_WRITE_TOKEN. Verify: Actions tab -> "Sanity backup" ->
   Run workflow -> green run with export artifact.
3. **Schedule the weekly agent**: create a scheduled Claude Code cloud agent (routine),
   Mondays 6:00 AM Central, connected to this repo, with env vars:
   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET=production, SANITY_WRITE_TOKEN.
   Prompt: "Follow AGENT_RUNBOOK.md at the repo root, start to finish, and end with the digest."
   First run: temporarily add "run everything in dry-run mode (add --dry-run to the ingest and
   write-extracted commands, skip tag-interests)" to the prompt, review the digest, then remove it.
   (Skipping tag-interests matters: that script has no dry-run mode and always writes.)
4. **Private dataset** (submissions hold submitter emails): create a Viewer token at
   manage.sanity.io -> project r4b3vt07 -> API -> Tokens, add it to Vercel as SANITY_READ_TOKEN
   (Production and Preview), deploy, then set the dataset to private
   (`npx sanity dataset visibility set production private`, or API -> Datasets in manage).
   Order matters: the site must be reading with a token before the dataset goes private.
   Verify: an anonymous `https://r4b3vt07.api.sanity.io/v2026-07-01/data/query/production?query=count(*)`
   returns an error or 0, and whatsgoodmgm.com still lists events.
