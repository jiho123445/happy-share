# SEO URL Routing Fix — 2026-09-07

## Fixed issue
Google Search Console reported `https://www.nbnhappy.or.kr/notices` as a redirected page.

### Root cause
The build script generated a real `/notices/index.html`, but the React router did not recognize `/notices` as a valid top-level page. It therefore initialized as `main`, and the history synchronization changed the URL to `/`.

### Changes
1. Added permanent redirect `/notices` -> `/news` in `vercel.json`.
2. Removed bare `notices` from generated top-level static routes and the generated sitemap.
3. Added SPA fallback so `/notices` resolves to the news page during local/development routing.
4. Kept `/notices/:id` detail URLs unchanged because existing notice detail links and previews use that path.

## Expected result after deployment
- `/notices` -> permanent redirect -> `/news`
- `/notices/:id` -> individual notice detail page
- Sitemap no longer contains bare `/notices`
- Existing indexed or shared legacy notice-list links remain valid
