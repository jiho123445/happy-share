/**
 * Vercel Edge Middleware — bot-aware prerendering for share/search previews.
 *
 * The main site is a client-rendered SPA (React + Vite). That's fine for
 * real visitors, but link-preview bots (KakaoTalk, Facebook, etc.) and
 * some search crawlers only read the raw HTML response — they don't wait
 * for JavaScript to run — so every shared link previously showed the same
 * generic foundation-wide title/description no matter which notice,
 * program, or gallery post was linked.
 *
 * This middleware runs on Vercel's edge, before the SPA is served. For
 * /notices/:id, /programs/:id, and /gallery/:id it checks the request's
 * User-Agent: if it looks like a known bot, it fetches that specific
 * item from Firestore (public read, no auth needed) and returns a small
 * standalone HTML page with correct <title>/description/og:* tags for
 * that item, plus a link to the full site. Everyone else (real browsers)
 * is passed straight through to the normal SPA, completely unchanged.
 *
 * Data source: the `foundation/global` Firestore document, which stores
 * notices/programs/gallery as arrays (see firestore.rules — publicly
 * readable by design, since the homepage itself needs to read it without
 * requiring visitors to log in).
 */

export const config = {
  matcher: ['/notices/:id', '/programs/:id', '/gallery/:id'],
};

const PROJECT_ID = 'gen-lang-client-0288068906';
const DATABASE_ID = 'ai-studio-c345f36f-becb-4d51-8f4b-58287995f527';
const SITE_ORIGIN = 'https://nbnhappy.or.kr';
const SITE_NAME = '사단법인 너브내행복나눔재단';

// Known link-preview / search bot user-agent substrings (lowercase).
const BOT_UA_PATTERNS = [
  'kakaotalk',
  'facebookexternalhit',
  'twitterbot',
  'slackbot',
  'telegrambot',
  'whatsapp',
  'discordbot',
  'linkedinbot',
  'googlebot',
  'yeti', // Naver's crawler
  'bingbot',
  'daumoa', // Daum's crawler
];

function isBotRequest(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

// Minimal unwrapper for Firestore REST API's typed value format
// (e.g. { stringValue: "..." }, { arrayValue: { values: [...] } }).
function unwrapFirestoreValue(value: any): any {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(unwrapFirestoreValue);
  }
  if ('mapValue' in value) {
    const out: Record<string, any> = {};
    const fields = value.mapValue.fields || {};
    for (const key of Object.keys(fields)) {
      out[key] = unwrapFirestoreValue(fields[key]);
    }
    return out;
  }
  return null;
}

function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

function renderPreviewHtml(opts: {
  title: string;
  description: string;
  image?: string;
  canonicalPath: string;
}): string {
  const { title, description, image, canonicalPath } = opts;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const ogImage = image || `${SITE_ORIGIN}/og-image.jpg`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(ogImage)}" />
<meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}" />
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(SITE_NAME)}에서 전체 내용 보기</a></p>
</body>
</html>`;
}

async function fetchFoundationGlobal(): Promise<any | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/foundation/global`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const fields = json.fields || {};
    const out: Record<string, any> = {};
    for (const key of Object.keys(fields)) {
      out[key] = unwrapFirestoreValue(fields[key]);
    }
    return out;
  } catch {
    return null;
  }
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  if (!isBotRequest(userAgent)) {
    // Real visitors: don't touch the request, let the normal SPA load.
    return;
  }

  const noticeMatch = url.pathname.match(/^\/notices\/([^/]+)\/?$/);
  const programMatch = url.pathname.match(/^\/programs\/([^/]+)\/?$/);
  const galleryMatch = url.pathname.match(/^\/gallery\/([^/]+)\/?$/);

  const id = decodeURIComponent(
    noticeMatch?.[1] || programMatch?.[1] || galleryMatch?.[1] || ''
  );
  if (!id) return;

  const data = await fetchFoundationGlobal();
  if (!data) return; // Firestore unreachable — fall through to normal SPA.

  let html: string | null = null;

  if (noticeMatch) {
    const notice = (data.notices || []).find((n: any) => n.id === id);
    if (notice) {
      html = renderPreviewHtml({
        title: notice.title || SITE_NAME,
        description: truncate(notice.content || '', 120),
        image: notice.attachments?.find((a: any) =>
          /^(jpe?g|png|webp|gif)$/i.test(a.type || '') || /\.(jpe?g|png|webp|gif)$/i.test(a.url || '')
        )?.url,
        canonicalPath: `/notices/${encodeURIComponent(id)}`,
      });
    }
  } else if (programMatch) {
    const program = (data.programs || []).find((p: any) => p.id === id);
    if (program) {
      html = renderPreviewHtml({
        title: program.title || SITE_NAME,
        description: truncate(program.summary || '', 120),
        canonicalPath: `/programs/${encodeURIComponent(id)}`,
      });
    }
  } else if (galleryMatch) {
    const item = (data.gallery || []).find((g: any) => g.id === id);
    if (item) {
      html = renderPreviewHtml({
        title: item.title || SITE_NAME,
        description: truncate(item.description || '', 120),
        image: item.imageUrl,
        canonicalPath: `/gallery/${encodeURIComponent(id)}`,
      });
    }
  }

  if (!html) return; // Item not found — fall through to normal SPA (which shows its own not-found state).

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
