import { inferNewsSentiment, inferRelatedSymbol, normalizeNewsItem } from '../helpers';
import type { OrbitNewsCategory, OrbitNewsItem, OrbitNewsProvider } from '../types';

interface FetchRssNewsOptions {
  url: string;
  limit: number;
  category: OrbitNewsCategory;
  provider: OrbitNewsProvider;
  sourceName?: string;
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '));
}

function getTagValue(block: string, tagName: string) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match?.[1] ? stripHtml(match[1]) : '';
}

function getTagAttribute(block: string, tagName: string, attribute: string) {
  const match = block.match(
    new RegExp(`<${tagName}[^>]*${attribute}="([^"]+)"`, 'i'),
  );
  return match?.[1] ? decodeHtml(match[1]) : '';
}

function buildExcerpt(description: string) {
  const cleaned = stripHtml(description);
  if (!cleaned) {
    return '';
  }

  return cleaned.length > 180 ? `${cleaned.slice(0, 177).trimEnd()}...` : cleaned;
}

function parseRssItems(xml: string) {
  return xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
}

export async function fetchRssNews({
  url,
  limit,
  category,
  provider,
  sourceName,
}: FetchRssNewsOptions): Promise<OrbitNewsItem[]> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`RSS feed failed with ${response.status}`);
  }

  const xml = await response.text();
  const items = parseRssItems(xml);

  const normalized = items
    .map((item, index) => {
      const title = getTagValue(item, 'title');
      const rawLink = getTagValue(item, 'link');
      const description = getTagValue(item, 'description');
      const source = getTagValue(item, 'source') || sourceName || '';
      const publishedAt = getTagValue(item, 'pubDate') || getTagValue(item, 'dc:date');
      const mediaImage =
        getTagAttribute(item, 'media:content', 'url') ||
        getTagAttribute(item, 'media:thumbnail', 'url') ||
        getTagAttribute(item, 'enclosure', 'url');
      const combinedText = `${title} ${description}`;

      return normalizeNewsItem(
        {
          id: `${provider}-${category}-${index}-${publishedAt || title.slice(0, 24)}`,
          title,
          source,
          publishedAt,
          sentiment: inferNewsSentiment(combinedText),
          relatedSymbol: inferRelatedSymbol(combinedText),
          excerpt: buildExcerpt(description),
          image: mediaImage,
          url: rawLink,
        },
        provider,
        category,
      );
    })
    .filter((item) => item !== null)
    .slice(0, limit) as OrbitNewsItem[];

  if (!normalized.length) {
    throw new Error('RSS feed returned no usable items');
  }

  return normalized;
}
