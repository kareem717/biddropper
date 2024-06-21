"use client";

import { CreateCompanyForm } from "@/components/companies/CreateCompanyForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CreateCompanyPage() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="my-40">
        <CardHeader>
          <CardTitle>Create a new company</CardTitle>
          <CardDescription>
            Fill out the form below to create a new company.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <CreateCompanyForm />
        </CardContent>
      </Card>
    </div>
  );
}