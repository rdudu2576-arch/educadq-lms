import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
}

export default function SEO({ title, description, ogImage, ogUrl }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | EducaDQ` : "EducaDQ - Plataforma EAD";
    document.title = fullTitle;

    // Update or create meta tags
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, true);
    }

    setMeta("og:title", fullTitle, true);
    setMeta("og:type", "website", true);

    if (ogImage) {
      setMeta("og:image", ogImage, true);
    }

    if (ogUrl) {
      setMeta("og:url", ogUrl, true);
    }

    setMeta("og:site_name", "EducaDQ", true);

    return () => {
      document.title = "EducaDQ - Plataforma EAD";
    };
  }, [title, description, ogImage, ogUrl]);

  return null;
}
