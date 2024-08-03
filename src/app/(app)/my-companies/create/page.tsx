import { CreateCompanyForm } from "@/components/companies/CreateCompanyForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function CreateCompanyPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2 mt-10">
        <CardHeader>
          <CardTitle>Create a new company</CardTitle>
          <CardDescription>
            Fill out the form below to create a new company.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-2xl">
          <CreateCompanyForm className="max-h-[70vh] overflow-y-auto"/>
        </CardContent>
      </Card>
    </div>
  );
}