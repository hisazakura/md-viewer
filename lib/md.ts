// mdToHtml.ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeSlug from 'rehype-slug'
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import rehypeStyle from "./plugin/rehypeStyle";

export async function mdToHtml(content: string) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: false }) // producing HAST
        .use(rehypeSanitize)
        .use(rehypeSlug)
        .use(rehypeStyle)
        .use(rehypeStringify)
        .process(content);

    return String(file);
}
