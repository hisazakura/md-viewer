import { Heading1, Heading2, Heading3, LucideIcon } from "lucide-react";
import { SidebarMenuButtonContent } from "./sidebar-button";

interface SidebarOutlineDefaultProps {
    label?: string;
    depth?: 1 | 2 | 3;
    slug?: string
}

function depthIcon(depth: 1 | 2 | 3): LucideIcon | null {
    if (depth === 1) return Heading1;
    if (depth === 2) return Heading2;
    if (depth === 3) return Heading3;
    return null;
}

export default function SidebarOutlineButton({
    label,
    depth,
    slug
}: SidebarOutlineDefaultProps) {
    return <SidebarMenuButtonContent icon={depthIcon(depth ?? 1) ?? Heading1} depth={depth} label={label} href={`#${slug}`}/>
}
