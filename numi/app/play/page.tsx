import { Player } from "@/components/ui/player"
import { TopNavbar } from "@/components/ui/top-navbar"
import { FloatingBubblesBackground } from "@/components/ui/floating-bubbles-background"

export default function PlayPage() {
    return (
        <FloatingBubblesBackground>
            <main className="w-full h-screen overflow-hidden relative flex flex-col pt-0">
                <TopNavbar />

                <div className="flex-1 w-full h-full p-4 md:p-8 flex items-center justify-center max-w-7xl mx-auto">
                    {/* 
                      Instead of hardcoding the HTML and scripts here, 
                      we use the <Player /> component we built earlier which 
                      handles script injection and canvas mounting cleanly! 
                    */}
                    <Player />
                </div>
            </main >
        </FloatingBubblesBackground>
    );
}
