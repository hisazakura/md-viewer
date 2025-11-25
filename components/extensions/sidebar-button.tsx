import type { LucideIcon } from "lucide-react";

interface SidebarMenuButtonContentProps {
    icon?: LucideIcon;
    label?: string;
    depth?: 1 | 2 | 3;
    href?: string
}

function Leaf() {
    return (
        <span className="relative w-6 h-8">
            <span className="absolute left-1/2 w-px h-full bg-neutral-300"></span>
        </span>
    );
}

export function SidebarMenuButtonContent({
    icon: Icon,
    label,
    depth,
    href
}: SidebarMenuButtonContentProps) {
    return (
        <a href={href} className="flex px-3 py-1 h-8 gap-x-1 items-center w-full">
            {(depth ?? 1) > 1 && (
                <div className="flex flex-row gap-x-1">
                    {Array.from({ length: (depth ?? 1) - 1 }).map((_, i) => (
                        <Leaf key={i} />
                    ))}
                </div>
            )}
            {Icon && <Icon className="h-4 min-w-6" />}
            <span className="truncate block max-w-full">{label}</span>
        </a>
    );
}
