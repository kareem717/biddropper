import { Metadata } from "next";
import { ContactCard } from "@/components/jobs/landing/contact/ContactCard";

export const metadata: Metadata = {
	title: "Contact",
	description: "Contact",
};

export default function ContactPage() {
	return (
		<div className="flex justify-center items-center my-20 w-full">
			<ContactCard className="max-w-2xl mx-6 md:mx-12" />
		</div>
	);
}
