import { useEffect } from 'react';

type Props = {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath?: string;
  noindex?: boolean;
  /** Language variants for hreflang tags. Use { de: '/', en: '/en' } on pages
   *  that have a translation. Omit on pages that only exist in one language. */
  alternates?: { de?: string; en?: string };
  /** BCP-47 language code for og:locale + html lang. Defaults to 'de'. */
  locale?: 'de' | 'en';
};

export function PageMeta({
  title,
  description,
  ogImage,
  canonicalPath,
  noindex,
  alternates,
  locale = 'de',
}: Props) {
  useEffect(() => {
    // Accept both absolute and root-relative ogImage paths. Social crawlers
    // need absolute URLs, so we prefix relative paths with the canonical domain.
    const resolvedImage = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `https://www.ronki.de${ogImage}`
      : 'https://www.ronki.de/og-ronki.jpg';
    const resolvedUrl = canonicalPath ? `https://www.ronki.de${canonicalPath}` : undefined;

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:locale', locale === 'en' ? 'en_US' : 'de_DE', 'property');
    setMeta('og:image', resolvedImage, 'property');
    if (resolvedUrl) setMeta('og:url', resolvedUrl, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', resolvedImage);

    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      const robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (robotsTag) robotsTag.remove();
    }

    if (canonicalPath) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = `https://www.ronki.de${canonicalPath}`;
    }

    // Clear existing hreflang links from prior pages, then set current ones.
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
      .forEach((l) => l.remove());
    if (alternates) {
      if (alternates.de) setHreflang('de', alternates.de);
      if (alternates.en) setHreflang('en', alternates.en);
      // x-default points to the primary language variant (German = original audience)
      if (alternates.de) setHreflang('x-default', alternates.de);
    }
  }, [title, description, ogImage, canonicalPath, noindex, alternates, locale]);

  return null;
}

function setHreflang(lang: string, path: string) {
  const link = document.createElement('link');
  link.rel = 'alternate';
  link.hreflang = lang;
  link.href = `https://www.ronki.de${path}`;
  document.head.appendChild(link);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}
