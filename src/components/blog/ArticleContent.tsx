import React from "react";

export function sanitizeAndFormatArticleHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  let html = rawHtml;

  // 1. Remove Quill UI helper elements
  html = html.replace(/<span class="ql-ui" contenteditable="false"><\/span>/gi, "");

  // 2. Handle Quill lists:
  // Split/rebuild <ol> blocks containing data-list="bullet" or data-list="ordered" into semantic <ul> and <ol>
  html = html.replace(/<ol>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
    // Only bullet items
    if (/data-list="bullet"/i.test(listContent) && !/data-list="ordered"/i.test(listContent)) {
      const cleanItems = listContent
        .replace(/<li data-list="bullet"[^>]*>/gi, "<li>")
        .replace(/<li data-list="bullet">/gi, "<li>");
      return `<ul class="article-bullet-list">${cleanItems}</ul>`;
    }
    // Only ordered items
    if (/data-list="ordered"/i.test(listContent) && !/data-list="bullet"/i.test(listContent)) {
      const cleanItems = listContent
        .replace(/<li data-list="ordered"[^>]*>/gi, "<li>")
        .replace(/<li data-list="ordered">/gi, "<li>");
      return `<ol class="article-ordered-list">${cleanItems}</ol>`;
    }
    // Mixed items (both bullet and ordered in the same block)
    if (/data-list="(bullet|ordered)"/i.test(listContent)) {
      const items = listContent.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
      let result = "";
      let currentType: "bullet" | "ordered" | null = null;
      let currentGroup: string[] = [];

      const flushGroup = () => {
        if (!currentType || currentGroup.length === 0) return;
        const tag = currentType === "bullet" ? "ul" : "ol";
        const cls = currentType === "bullet" ? "article-bullet-list" : "article-ordered-list";
        result += `<${tag} class="${cls}">${currentGroup.join("")}</${tag}>`;
        currentGroup = [];
      };

      for (const item of items) {
        const isBullet = /data-list="bullet"/i.test(item);
        const itemType = isBullet ? "bullet" : "ordered";
        const cleanItem = item.replace(/<li\s+data-list="[^"]*"/gi, "<li");

        if (itemType !== currentType) {
          flushGroup();
          currentType = itemType;
        }
        currentGroup.push(cleanItem);
      }
      flushGroup();
      return result || match;
    }

    return match;
  });

  // 3. Ensure external links have target="_blank" and rel="noopener noreferrer"
  html = html.replace(/<a\s+([^>]*?)href="([^"]*)"([^>]*)>/gi, (match, before, href, after) => {
    if (!/target=/i.test(match)) {
      return `<a ${before}href="${href}" target="_blank" rel="noopener noreferrer"${after}>`;
    }
    return match;
  });

  return html;
}

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const isHtml =
    content.includes("<p>") ||
    content.includes("<h") ||
    content.includes("<div>") ||
    content.includes("<ul>") ||
    content.includes("<ol>");

  if (isHtml) {
    const formattedHtml = sanitizeAndFormatArticleHtml(content);

    return (
      <div
        className="article-rich-content"
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    );
  }

  // Fallback for markdown-style plain text content
  return (
    <div className="article-rich-content space-y-4 text-slate-700 leading-relaxed text-base sm:text-lg">
      {content.split("\n\n").map((block, idx) => {
        const lines = block.trim().split("\n");
        if (lines[0].startsWith("### ")) {
          const heading = lines[0].replace("### ", "");
          const rest = lines.slice(1).join(" ");
          return (
            <div key={idx} className="space-y-2 pt-2">
              <h3 className="text-xl font-bold text-slate-900">{heading}</h3>
              {rest && <p className="text-slate-600 leading-relaxed">{rest}</p>}
            </div>
          );
        }
        if (lines[0].startsWith("- ")) {
          return (
            <ul key={idx} className="list-disc pl-6 space-y-1.5 my-3">
              {lines.map((li, lidx) => (
                <li key={lidx}>{li.replace("- ", "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="text-slate-600 leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
