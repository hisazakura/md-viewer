import MarkdownContent from "@/components/layout/app-content";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { MarkdownProvider } from "@/context/md-provider";

export default function Page() {
    return (
        <MarkdownProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-white z-10">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                    </header>
                    <MarkdownContent />
                </SidebarInset>
            </SidebarProvider>
        </MarkdownProvider>
    );
}
