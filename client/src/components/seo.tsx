import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object | object[];
}

export function SEO({ title, description, canonical, ogImage, ogType = "website", structuredData }: SEOProps) {
  useEffect(() => {
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.setAttribute("content", description);

    // OG tags
    const ogTags: Record<string, string> = {
      "og:title": title,
      "og:type": ogType,
      "og:site_name": "Online Boater Ed",
    };
    if (description) ogTags["og:description"] = description;
    if (canonical) ogTags["og:url"] = canonical;
    if (ogImage) ogTags["og:image"] = ogImage;

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // Twitter card tags
    const twitterTags: Record<string, string> = {
      "twitter:card": ogImage ? "summary_large_image" : "summary",
      "twitter:title": title,
    };
    if (description) twitterTags["twitter:description"] = description;
    if (ogImage) twitterTags["twitter:image"] = ogImage;

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Structured data (JSON-LD) — supports single object or array
    if (structuredData) {
      // Remove any existing SEO JSON-LD scripts
      document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());

      const items = Array.isArray(structuredData) ? structuredData : [structuredData];
      items.forEach((data, i) => {
        const script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Cleanup structured data on unmount
      document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
    };
  }, [title, description, canonical, ogImage, ogType, structuredData]);

  return null;
}
