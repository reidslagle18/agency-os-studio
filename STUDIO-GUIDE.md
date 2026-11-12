# Agency OS Studio

## Start working

Open the deployed studio. Use Clients to add a company, manufacturing state, sales markets and program. Create independent Product lines for its flower, carts, gummies, beverages, concentrates or other products. Each line has its own positioning, brand guide, fixed elements and variant freedoms.

Add Variants under the relevant line. A source strain, a flavor and a formulation are separate fields. Record creative intent and verified product facts separately. Leave unknown facts blank. Add product evidence and supplier specifications when available.

Choose Compile brief for one variant or Compile line briefs for the line. This automation immediately assembles a production brief from the client, line guide, variant, siblings, market references and release holds. Each job retains the original guide revision and data snapshot. Copy or download it from Production queue.

Use Market reviews to record official source URLs, applicability, checked/effective dates, a reviewer and required design changes. Source links are starting points, not completed research. Unresolved, future and older-than-seven-day records do not clear market holds. Reviewed is an internal evidence status, not a compliance certificate.

Asset library accepts PNG, JPEG and WebP images up to 8 MB, grouped by client and line. You can mark an asset as exploration, reference, selected direction or needing revision. It is an organizer, not a vector/print layout editor.

## Saving and backups

Records are saved in this browser’s local storage. Images use browser IndexedDB. There are no shared accounts or cloud synchronization in this release. Choose Export backup to save records and images together. Import backup restores a workspace after confirmation. Keep backups outside the browser, particularly before clearing data or changing devices.

Browser storage is specific to the site address. Use the stable production URL for real work; moving between preview URLs does not transfer your data. Export/import a backup when moving addresses.

## Actual automation versus optional services

Working without paid connections: client and line management, variant records, line-specific brief compilation, batch briefs, revision snapshots, market-review records, production holds and asset organization.

Optional provider adapters are implemented for live web research and image generation but are disconnected by default. They have not been tested against a paid provider account. No scheduled runs are configured.

To enable on Vercel, configure OPENAI_API_KEY and a strong STUDIO_ACCESS_TOKEN in the project’s server-side environment variables. Redeploy. Enter the matching studio access code in Connections for each browser session. Never put the OpenAI API key into the browser or a source file. Optional RESEARCH_MODEL and IMAGE_MODEL environment variables choose compatible models; defaults are gpt-5-mini and gpt-image-2.

Set provider spending limits before enabling. Requests require explicit user action and a billed-usage confirmation. There are no automatic retries. If a request times out, check the provider dashboard before repeating it. Research is a draft requiring human source verification. It does not automatically set reviews to Reviewed. Artwork generation requires current recorded market reviews and a fresh brief snapshot, but that is not legal certification.

## Boundaries of this first release

This is a working single-user operations studio and brief automation, not the completed agency platform. It does not yet include a full editable design canvas, print-file assembly, automatic source ingestion, automatic national regulatory certification, background jobs, account authentication, multi-user cloud storage, CRM or client portal. Paid adapters need account configuration and end-to-end verification before relying on them. These limits are explicit in the app.

## Development checks

Run `pnpm install`, `pnpm test`, then `pnpm build`. Deploy with Vercel. Test only on Vercel previews per project instructions; no local dev server is required.

Provider API references consulted:
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/reference/resources/images/methods/generate
