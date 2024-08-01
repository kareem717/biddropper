import { EditCompanyForm } from "@/components/companies/EditCompanyForm";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditCompanyPage({ params }: { params: { id: string } }) {
  return (
    <Card className="w-[50vw] max-w-4xl">
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
  );
}