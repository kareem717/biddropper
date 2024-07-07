export default async function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	return (
		<div className="h-full w-full relative">
			{children}
		</div>
	);
}
