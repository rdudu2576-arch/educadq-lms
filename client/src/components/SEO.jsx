import { useEffect } from "react";
export default function SEO(_a) {
    var title = _a.title, description = _a.description, ogImage = _a.ogImage, ogUrl = _a.ogUrl;
    useEffect(function () {
        var fullTitle = title ? "".concat(title, " | EducaDQ") : "EducaDQ - Plataforma EAD";
        document.title = fullTitle;
        // Update or create meta tags
        var setMeta = function (name, content, property) {
            var attr = property ? "property" : "name";
            var el = document.querySelector("meta[".concat(attr, "=\"").concat(name, "\"]"));
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
        return function () {
            document.title = "EducaDQ - Plataforma EAD";
        };
    }, [title, description, ogImage, ogUrl]);
    return null;
}
