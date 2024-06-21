import { SidebarLink } from "@/components/SidebarItems";
import { Building2, Cog, HomeIcon } from "lucide-react";

type AdditionalLinks = {
	title: string;
	links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
	{ href: "/dashboard", title: "Home", icon: HomeIcon },
	{ href: "/settings", title: "Settings", icon: Cog },
	{ href: "/companies", title: "Companies", icon: Building2 },
];

export const additionalLinks: AdditionalLinks[] = [];
