// rehypeAddTailwind.ts
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Element } from "hast";

interface NodeHandler {
    canHandle: (
        node: Element,
        index: number,
        parent: Element | null
    ) => boolean;
    handle: (node: Element, index: number, parent: Element | null) => void;
}
function getClassList(node: Element): string[] {
    const props = node.properties ?? {};
    const raw = props.className ?? props.class ?? [];
    if (Array.isArray(raw)) {
        // could be string[] or (string | {…})[] depending on how HAST came in
        return raw
            .flatMap((r) => (typeof r === "string" ? r.split(/\s+/) : []))
            .filter(Boolean);
    }
    if (typeof raw === "string") return raw.split(/\s+/).filter(Boolean);
    return [];
}

function setClassList(node: Element, classes: string[]) {
    node.properties = node.properties ?? {};
    // canonicalize to array-of-strings (hast commonly uses string[] for className)
    node.properties.className = Array.from(new Set(classes.filter(Boolean)));
}

function addClass(node: Element, className: string | string[]) {
    const existing = getClassList(node);
    const toAdd = Array.isArray(className)
        ? className.flatMap((c) => c.split(/\s+/))
        : String(className).split(/\s+/);
    const merged = Array.from(new Set(existing.concat(toAdd).filter(Boolean)));
    setClassList(node, merged);
}

function hasClass(
    node: Element,
    classNameOrPredicate: string | ((cls: string) => boolean)
): boolean {
    const classes = getClassList(node);
    if (typeof classNameOrPredicate === "string") {
        // exact match
        return classes.includes(classNameOrPredicate);
    }
    return classes.some(classNameOrPredicate);
}

function replaceClass(
    node: Element,
    prevClassName: string,
    newClassName: string
) {
    const classes = getClassList(node).filter((c) => c !== prevClassName);
    const toAdd = newClassName.split(/\s+/).filter(Boolean);
    setClassList(node, [...classes, ...toAdd]);
}

const defaultClassMap: Record<string, string> = {
    h1: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    h2: "scroll-m-20 text-2xl font-semibold tracking-tight",
    h3: "scroll-m-20 text-xl font-semibold tracking-tight",
    h4: "scroll-m-20 text-lg font-semibold tracking-tight",
    h5: "scroll-m-20 font-semibold tracking-tight",
    h6: "scroll-m-20 font-semibold tracking-tight",
    p: "leading-7",
    a: "hover:underline",
    blockquote: "mb-4 border-l-2 pl-6 italic",
    pre: "rounded-md border overflow-clip mb-4 relative group",
    table: "w-full",
    thead: "m-0 border-t p-0 bg-muted",
    tr: "m-0 border-t p-0",
    th: "border px-4 py-2 text-left font-bold",
    td: "border px-4 py-2 text-left",
    ol: "mb-4 ml-6 list-decimal [&>li]:mt-2 [&>li]:pl-2",
};

function applyDefaultClass(node: Element) {
    const tag = node.tagName?.toLowerCase();
    const classes = tag && defaultClassMap[tag];
    if (classes) addClass(node, classes);
}

const additionalHandler: NodeHandler[] = [
    {
        // p -> add margin except inside blockquote
        canHandle: (node) => node.tagName?.toLowerCase() === "p",
        handle: (node, _index, parent) =>
            (!parent || (parent as Element).tagName !== "blockquote") &&
            addClass(node, "mb-4"),
    },
    {
        // inline code (code inside a paragraph) or code element - add bg unless has language-*
        canHandle: (node) => node.tagName?.toLowerCase() === "code",
        handle: (node) =>
            !hasClass(node, (c) => c.startsWith("language-")) &&
            addClass(
                node,
                "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
            ),
    },
    {
        // align on td/th
        canHandle: (node) => ["td", "th"].includes(node.tagName?.toLowerCase()),
        handle: (node) => {
            const align = String(node.properties?.align ?? "").toLowerCase();
            // remove left alignment and add the proper class
            if (["center", "right"].includes(align))
                replaceClass(node, "text-left", `text-${align}`);
        },
    },
    {
        // ul default classes (skip if it's a task list container)
        canHandle: (node) => node.tagName?.toLowerCase() === "ul",
        handle: (node) =>
            !hasClass(node, (c) => c.includes("contains-task-list")) &&
            addClass(node, "mb-4 ml-6 list-disc [&>li]:mt-2 [&>li]:pl-2"),
    },
    {
        // li that has task list item class
        canHandle: (node) => node.tagName?.toLowerCase() === "li",
        handle: (node) =>
            hasClass(node, (c) => c.includes("task-list-item")) &&
            addClass(node, "mb-4 list-none pl-0"),
    },
    {
        // wrap table in a div (use index param to replace safely)
        canHandle: (node, _index, parent) =>
            parent !== null && node.tagName === "table",
        handle: (node, index, parent) => {
            if (!parent || index === null) return;
            const wrapper: Element = {
                type: "element",
                tagName: "div",
                properties: {
                    className: ["mb-4", "w-full", "overflow-y-auto"],
                },
                children: [node],
            };
            parent.children[index] = wrapper;
        },
    },
];

function applyAdditionalHandlers(
    node: Element,
    index: number,
    parent: Element
) {
    additionalHandler
        .find((e) => e.canHandle(node, index, parent))
        ?.handle(node, index, parent);
}

const rehypeStyle: Plugin = () => {
    return (tree) => {
        // apply default class
        visit(tree, "element", applyDefaultClass);

        // apply additional handlers
        visit(tree, "element", applyAdditionalHandlers);
    };
};

export default rehypeStyle;
