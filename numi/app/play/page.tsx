import { Player } from "@/components/ui/player"
import { TopNavbar } from "@/components/ui/top-navbar"
import { FloatingBubblesBackground } from "@/components/ui/floating-bubbles-background"
import { MinimalFooter } from "@/components/ui/minimal-footer"

export default function PlayPage() {
    return (
        <FloatingBubblesBackground>
            <TopNavbar />
            <main className="w-full min-h-screen relative flex flex-col">
                <div className="flex-1 flex items-center justify-center pt-20 md:pt-32 lg:pt-40 pb-20">
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-center h-full">
                        <Player />
                    </div>
                </div>
                <MinimalFooter />
            </main >
        </FloatingBubblesBackground>
    );
}
