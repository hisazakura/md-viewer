"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import SidebarOutlineButton from "../extensions/sidebar-outline-button";
import { useEffect, useState } from "react";
import { useMarkdownContext } from "@/context/md-provider";

interface Heading {
    label: string;
    depth: 1 | 2 | 3;
    slug: string
}

export function extractHeadersFromHtml(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const headerTags = doc.querySelectorAll("h1, h2, h3");

    return Array.from(headerTags).map(
        (el) =>
            ({
                depth: Number(el.tagName.substring(1)),
                label: el.textContent || "",
                slug: el.id
            } as Heading)
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { htmlFile } = useMarkdownContext();
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        setHeadings(extractHeadersFromHtml(htmlFile));
    }, [htmlFile]);

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <div className="flex items-center h-14 border-b">
                    
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Outline</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {headings.map((heading, idx) => {
                                return (
                                    <SidebarMenuItem key={idx}>
                                        <SidebarMenuButton asChild>
                                            <SidebarOutlineButton depth={heading.depth} label={heading.label} slug={heading.slug} />
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
