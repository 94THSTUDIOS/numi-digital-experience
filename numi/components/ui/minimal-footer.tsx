import Link from "next/link";

export function MinimalFooter() {
	return (
		<footer className="w-full bg-[#FDF0E8] py-12 px-4 sm:px-6 md:px-10 lg:px-16 pt-20 border-t-2 border-[#9C2A2A]/10 relative z-50">
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8">
				
				{/* LEFT: Logo */}
				<div className="w-full md:w-1/2 flex items-center">
					<img 
						src="/images/Numi Logo Big.svg" 
						alt="Numi Logo" 
						className="w-full max-w-[20rem] sm:max-w-md lg:max-w-lg object-contain"
					/>
				</div>

				{/* RIGHT: Links & Credits */}
				<div className="w-full md:w-1/2 flex flex-col sm:flex-row justify-start md:justify-end gap-12 sm:gap-16 lg:gap-32">
					
					{/* Navigation Links */}
					<div className="flex flex-col gap-4 text-[#9C2A2A] font-body font-semibold text-xl lg:text-2xl">
						<Link href="/about" className="hover:opacity-70 transition-opacity">About</Link>
						<Link href="/play" className="hover:opacity-70 transition-opacity">Let&apos;s Play</Link>
						<Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
					</div>

					{/* Credits */}
					<div className="flex flex-col gap-2 text-[#9C2A2A] font-body">
						<h4 className="uppercase font-light text-sm tracking-wider mb-2 leading-tight">
							Designed with<br/>Care By
						</h4>
						<span className="font-bold text-lg lg:text-xl">Maxine Vieja</span>
						<span className="font-bold text-lg lg:text-xl">Horasha Smith</span>
						<span className="font-bold text-lg lg:text-xl">Yasmin Hussen</span>
					</div>

				</div>
			</div>

			{/* COPYRIGHT */}
			<div className="max-w-7xl mx-auto mt-16 md:mt-24 flex justify-start md:justify-end">
				<span className="text-[#9C2A2A] font-body font-bold text-xl lg:text-2xl">
					© 2026 Numi
				</span>
			</div>
		</footer>
	);
}

