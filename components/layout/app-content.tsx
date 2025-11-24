"use client";

import hljs from "highlight.js";
import { useEffect } from "react";
import { useMarkdownContext } from "@/context/md-provider";

export default function AppContent() {
    const { htmlFile } = useMarkdownContext();

    useEffect(() => hljs.highlightAll(), [htmlFile]);

    return (
        <div
            className="flex flex-1 flex-col gap-4 py-4 px-16"
            dangerouslySetInnerHTML={{ __html: htmlFile }}
        ></div>
    );
}
