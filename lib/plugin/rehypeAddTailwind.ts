// rehypeAddTailwind.ts
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Element } from "hast";

type HastElement = Element & { properties?: Record<string, any> };

interface NodeHandler {
    canHandle: (node: HastElement) => boolean;
    handle: (node: HastElement) => void;
}

const addClass = (node: HastElement, className: string) => {
    node.properties = node.properties || {};
    const prev = node.properties.className ?? node.properties.class ?? [];
    const classes = Array.isArray(prev)
        ? prev.slice()
        : String(prev).split(" ").filter(Boolean);
    classes.push(...className.split(" ").filter(Boolean));
    node.properties.className = classes;
};

const hasClass = (node: HastElement, className: string) =>
    node.properties &&
    node.properties.className &&
    node.properties.className.includes(className);

const replaceClass = (
    node: HastElement,
    prevClassName: string,
    newClassName: string
) => {
    node.properties.className = (node.properties.className as string[]).filter(
        (c: string) => c !== prevClassName
    );
    addClass(node, newClassName);
};

const handlers: NodeHandler[] = [
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "h1",
        handle: (node: HastElement) => {
            addClass(
                node,
                "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
            );
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "h2",
        handle: (node: HastElement) => {
            addClass(node, "scroll-m-20 text-2xl font-semibold tracking-tight");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "h3",
        handle: (node: HastElement) => {
            addClass(node, "scroll-m-20 text-xl font-semibold tracking-tight");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "h4",
        handle: (node: HastElement) => {
            addClass(node, "scroll-m-20 text-lg font-semibold tracking-tight");
        },
    },
    {
        canHandle: (node: HastElement) =>
            ["h5", "h6"].includes(node.tagName?.toLowerCase()),
        handle: (node: HastElement) => {
            addClass(node, "scroll-m-20 font-semibold tracking-tight");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "p",
        handle: (node: HastElement) => {
            addClass(node, "leading-7");
            const parent = (node as any).parent;
            if (parent && parent.tagName !== "blockquote")
                addClass(node, "mb-4");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "a",
        handle: (node: HastElement) => {
            addClass(node, "hover:underline");
        },
    },
    {
        canHandle: (node: HastElement) =>
            node.tagName?.toLowerCase() === "blockquote",
        handle: (node: HastElement) => {
            addClass(node, "mb-4 border-l-2 pl-6 italic");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "pre",
        handle: (node: HastElement) => {
            addClass(node, "rounded-md border overflow-clip mb-4");
        },
    },
    {
        canHandle: (node: HastElement) =>
            node.tagName?.toLowerCase() === "code",
        handle: (node: HastElement) => {
            if (!hasClass(node, "language-"))
                addClass(
                    node,
                    "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
                );
        },
    },
    {
        canHandle: (node: HastElement) =>
            node.tagName?.toLowerCase() === "table",
        handle: (node: HastElement) => {
            addClass(node, "w-full");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "thead",
        handle: (node: HastElement) => {
            addClass(node, "m-0 border-t p-0 bg-muted");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "tr",
        handle: (node: HastElement) => {
            addClass(node, "m-0 border-t p-0");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "th",
        handle: (node: HastElement) => {
            addClass(node, "border px-4 py-2 text-left font-bold");
            // read align attribute if present and convert to text-center / text-right
            const align = (node.properties?.align || "") as string;
            if (align.toLowerCase() === "center")
                replaceClass(node, "text-left", "text-center");
            else if (align.toLowerCase() === "right")
                replaceClass(node, "text-left", "text-right");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "td",
        handle: (node: HastElement) => {
            addClass(node, "border px-4 py-2 text-left");
            // read align attribute if present and convert to text-center / text-right
            const align = (node.properties?.align || "") as string;
            if (align.toLowerCase() === "center")
                replaceClass(node, "text-left", "text-center");
            else if (align.toLowerCase() === "right")
                replaceClass(node, "text-left", "text-right");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "ul",
        handle: (node: HastElement) => {
            if (!hasClass(node, "contains-task-list")) addClass(node, "mb-4 ml-6 list-disc [&>li]:mt-2 [&>li]:pl-2");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "ol",
        handle: (node: HastElement) => {
            addClass(node, "mb-4 ml-6 list-decimal [&>li]:mt-2 [&>li]:pl-2");
        },
    },
    {
        canHandle: (node: HastElement) => node.tagName?.toLowerCase() === "li",
        handle: (node: HastElement) => {
            if (hasClass(node, "task-list-item")) addClass(node, "mb-4 list-none pl-0")
        },
    },
];

const rehypeAddTailwind: Plugin = () => {
    return (tree) => {
        visit(tree, "element", (node: HastElement) =>
            handlers.find((e) => e.canHandle(node))?.handle(node)
        );

        // Post-pass: wrap every table in a div wrapper with overflow styles.
        // We can't easily replace parent pointers in unist without more plumbing, but we can mutate tree children in place.
        visit(
            tree,
            "element",
            (node: any, index: number | null, parent: any) => {
                if (!parent || !Array.isArray(parent.children)) return;
                if (node.tagName === "table") {
                    const wrapper: HastElement = {
                        type: "element",
                        tagName: "div",
                        properties: {
                            className: ["mb-4", "w-full", "overflow-y-auto"],
                        },
                        children: [node],
                    };
                    parent.children.splice(
                        parent.children.indexOf(node),
                        1,
                        wrapper
                    );
                }
            }
        );
    };
};

export default rehypeAddTailwind;
