// app/components/CodeblockCopy.jsx
"use client";

import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useRef, useState } from "react";

export default function CodeblockCopy({ getText }: { getText?: () => string }) {
    const [copied, setCopied] = useState(false);
    const timeout = useRef<NodeJS.Timeout|undefined>(undefined)

    function resetCopied() {
        const currentTimeout = timeout.current
        if (currentTimeout) clearTimeout(currentTimeout);

        timeout.current = setTimeout(() => setCopied(false), 2000);
    }

    async function handleCopy() {
        if (!getText) return;

        try {
            const text = getText();
            if (!text) return;

            await navigator.clipboard.writeText(text);

            setCopied(true);
            resetCopied();
        } catch (err) {
            console.error("Copy failed", err);
        }
    }

    return (
        <button
            onClick={handleCopy}
            title="Copy code"
            className="absolute hover:cursor-pointer p-2 z-10 right-0 hidden group-hover:block hover:bg-muted rounded-bl-md"
        >
            {copied ? (
                <CheckIcon className="h-4 w-4" />
            ) : (
                <ClipboardIcon className="h-4 w-4" />
            )}
        </button>
    );
}
