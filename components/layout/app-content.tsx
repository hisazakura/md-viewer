"use client";

import hljs from "highlight.js";
import { useEffect, useRef } from "react";
import { useMarkdownContext } from "@/context/md-provider";
import CodeblockCopy from "../extensions/codeblock-copy";
import { createRoot, Root } from "react-dom/client";

type CopyButtonMount = {
    root: Root;
    placeholder: HTMLDivElement;
};

export default function AppContent() {
    const { htmlFile } = useMarkdownContext();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const rootsRef = useRef<Map<HTMLElement, CopyButtonMount>>(new Map());

    function addCopyButton(element: HTMLElement) {
        const parent = element.parentElement;
        if (!parent || rootsRef.current.has(parent)) return;

        const placeholder = document.createElement("div");
        parent.insertBefore(placeholder, parent.firstChild);

        try {
            const root = createRoot(placeholder);
            root.render(<CodeblockCopy getText={() => element.textContent} />);
            rootsRef.current.set(parent, { root, placeholder });
        } catch (err) {
            console.error("Failed to mount Copy component", err);
        }
    }

    function unmountCopyButton(copyButton: CopyButtonMount) {
        const { root, placeholder } = copyButton;

        root.unmount();
        placeholder?.parentNode?.removeChild(placeholder);
    }

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = htmlFile ?? "";

        hljs.highlightAll();

        container
            .querySelectorAll<HTMLElement>("pre > code")
            .forEach(addCopyButton);

        const roots = rootsRef.current;
        return () => {
            roots.forEach(unmountCopyButton);
            roots.clear();
        };
    }, [htmlFile]);

    return (
        <div
            ref={containerRef}
            className="flex flex-1 flex-col gap-4 py-4 px-16"
        ></div>
    );
}
