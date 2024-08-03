import { EditJobForm } from "@/components/jobs/EditJobForm";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function JobEditPage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2 mt-10">
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
    </div>
  );
}