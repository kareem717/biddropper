import { EditJobForm } from "@/components/jobs/EditJobForm";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function JobEditPage({ params }: { params: { id: string } }) {
  return (
    <Card className="w-[50vw] max-w-4xl">
      <CardHeader>
        <CardTitle>
          Edit Job
        </CardTitle>
        <CardDescription>
          Edit the job details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh]">
          <EditJobForm jobId={params.id} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}