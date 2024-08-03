"use client";

import { EditAccountForm } from "@/components/settings/EditAccountFrom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-2">
      <Tabs defaultValue="account" className="max-w-[400px] w-full">
        <TabsList className="w-full">
          <TabsTrigger value="account" className="w-full">Account</TabsTrigger>
          <TabsTrigger value="billing" className="w-full">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you&#39;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <EditAccountForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center w-full text-muted-foreground">
              Coming soon...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
