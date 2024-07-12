import { DemoRequestDialog } from "@/components/landing/demo/RequestDialog";
import { Button } from "@/components/ui/button";
import demo from "@/config/demo";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Demo",
	description: "Demo",
};

export default function DemoPage() {
	return (
		<div className="flex flex-col gap-6 md:gap-8 w-full items-center justify-center mt-20">
			<div className="px-4 pb-4 sm:px-0 text-center space-y-4 md:space-y-8">
				<h1 className="md:text-5xl text-3xl mx-auto max-w-3xl">{demo.title}</h1>
				<h2 className="md:text-xl max-w-lg mx-auto">{demo.description}</h2>
			</div>
			<div className="flex flex-col items-center justify-center md:gap-16 gap-8 w-1/4">
				<DemoRequestDialog />
			</div>
		</div>
	);
}
