import { useEffect } from 'react';

type Props = {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath?: string;
  noindex?: boolean;
};

export function PageMeta({ title, description, ogImage, canonicalPath, noindex }: Props) {
  useEffect(() => {
    const resolvedImage = ogImage || 'https://ronki.de/og-ronki.jpg';
    const resolvedUrl = canonicalPath ? `https://ronki.de${canonicalPath}` : undefined;

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:locale', 'de_DE', 'property');
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
      link.href = `https://ronki.de${canonicalPath}`;
    }
  }, [title, description, ogImage, canonicalPath, noindex]);

  return null;
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
