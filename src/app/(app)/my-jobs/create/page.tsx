import { CreateJobForm } from "@/components/jobs/CreateJobForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function JobCreatePage() {
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2 mt-10">
        <CardHeader>
          <CardTitle>Create a new job</CardTitle>
          <CardDescription>
            Fill out the form below to create a new job.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-2xl">
          <CreateJobForm className="max-h-[70vh] overflow-y-auto"/>
        </CardContent>
      </Card>
    </div>
  );
}