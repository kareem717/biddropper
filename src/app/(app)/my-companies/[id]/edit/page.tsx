import { EditCompanyForm } from "@/components/companies/EditCompanyForm";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full flex items-center justify-center px-2 mt-10">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>
            Edit Company
          </CardTitle>
          <CardDescription>
            Edit the company details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh]">
            <EditCompanyForm companyId={params.id} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}