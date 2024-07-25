"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EditAccountSchema } from "@/lib/db/queries/validation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client";
import { Icons } from "../Icons";
import { useAuth } from "@/components/providers/AuthProvider";
import { Textarea } from "../ui/textarea";
import { FC, ComponentPropsWithoutRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = EditAccountSchema;

export interface EditAccountFormProps extends ComponentPropsWithoutRef<"form"> {
  onSubmitProp?: (values: z.infer<typeof formSchema>) => void;
}

export const EditAccountForm: FC<EditAccountFormProps> = ({ onSubmitProp, ...props }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { account } = useAuth();

  if (!account) {
    throw new Error("Account not found");
  }

  const { mutateAsync: editAccount, isLoading: isEditingAccount } = trpc.account.editAccount.useMutation({
    onError: () => {
      toast.error("Something went wrong!", {
        description: "Please try again later."
      });
    },
    onSuccess: () => {
      toast.success("Account updated");
    },
  });

  const form = useForm<z.infer<typeof EditAccountSchema>>({
    resolver: zodResolver(EditAccountSchema),
    defaultValues: {
      ...account,
    },
  });

  async function onSubmit(values: z.infer<typeof EditAccountSchema>) {
    onSubmitProp?.(values);

    await editAccount({
      ...account,
      ...values,
    });
  }

  const handleConfirmDialog = async () => {
    await form.trigger()

    if (form.formState.isValid) {
      setIsDialogOpen(true);
    }
  }

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="jimmy77" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="I'm a contractor" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <Button className="w-full mt-8" onClick={handleConfirmDialog} disabled={isEditingAccount}>
        {isEditingAccount ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Update account"}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently update your account.
            </DialogDescription>
          </DialogHeader>
          {JSON.stringify(form.getValues())}
          <Button type="button" className="w-full" onClick={form.handleSubmit(onSubmit)} disabled={isEditingAccount}>
            {isEditingAccount ? <Icons.spinner className="w-4 h-4 animate-spin" /> : "Update account"}
          </Button>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
