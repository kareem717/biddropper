export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="h-full w-full grid grid-cols-2">
			<div className="bg-foreground hidden md:col-span-1 md:flex flex-col justify-between items-start p-8" >
				<div className="text-background flex items-center text-lg font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mr-2 h-6 w-6"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
					</svg>
					Acme Inc
				</div>
				<blockquote className="space-y-2 text-background">
					<p className="text-lg">“This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.”</p>
					<footer className="text-sm">Sofia Davis</footer>
				</blockquote>
			</div>
			<main className="col-span-2 md:col-span-1 flex flex-col justify-center items-center">
				{children}
			</main>
		</div >
	);
}
