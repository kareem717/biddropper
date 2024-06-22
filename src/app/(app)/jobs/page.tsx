import { Icons } from "@/components/Icons";
import Link from "next/link";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentCard } from "@/components/app/ContentCard";
import { QuickSearch } from "@/components/app/QuickSearch";
import { buttonVariants } from "@/components/ui/button";

export default function ProjectsPage() {
  var projects = [];
  for (let i = 1; i <= 5; i++) {
    projects.push({
      id: `uuid-${i}`,
      name: `Job ${i}`,
    });
  }

  const ProjectCard = ({
    project,
  }: {
    project: { id: string; name: string };
  }) => {
    return (
      <ContentCard href={`/jobs/${project.id}`}>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            This is a project that is used to show the UI of the project.
          </CardDescription>
        </CardContent>
      </ContentCard>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-12 flex items-center justify-between gap-4">
        <QuickSearch />
        <Link href={"/jobs/create"} className={buttonVariants()}>
          <Icons.add className="w-4 h-4 mr-2" />
          <span>
            Create <span className="hidden sm:inline">New Job</span>
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-12">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        <ContentCard href={"/jobs/create"} className="flex items-center justify-center p-8">
          <Icons.add className="w-12 h-12 text-muted-foreground" />
        </ContentCard>
      </div>
    </div>
  );
};

