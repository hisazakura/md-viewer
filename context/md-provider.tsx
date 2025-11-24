"use client";

import { mdToHtml } from "@/lib/md";
import { useSearchParams } from "next/navigation";
import {
    createContext,
    ReactNode,
    Suspense,
    useContext,
    useEffect,
    useState,
} from "react";

interface MarkdownContextType {
    markdownFile: string;
    htmlFile: string;
    setMarkdownFile: (markdownFile: string) => void;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(
    undefined
);

export function MarkdownFetcher() {
    const searchParams = useSearchParams();

    const { setMarkdownFile } = useMarkdownContext();

    useEffect(() => {
        const url = searchParams.get("url");
        if (!url) return;

        fetch(url)
            .then((res) => res.text())
            .then((text) => setMarkdownFile(text));
    }, [searchParams, setMarkdownFile]);

    return null;
}

export function MarkdownProvider({ children }: { children: ReactNode }) {
    const [markdownFile, setMarkdownFile] = useState<string>("");
    const [htmlFile, setHtmlFile] = useState<string>("");

    useEffect(() => {
        mdToHtml(markdownFile).then((result) => setHtmlFile(result));
    }, [markdownFile]);

    return (
        <MarkdownContext.Provider
            value={{ markdownFile, htmlFile, setMarkdownFile }}
        >
            <Suspense>
                <MarkdownFetcher />
            </Suspense>
            {children}
        </MarkdownContext.Provider>
    );
}

export function useMarkdownContext() {
    const ctx = useContext(MarkdownContext);
    if (!ctx)
        throw new Error("useAppContext must be used within MarkdownProvider");
    return ctx;
}
