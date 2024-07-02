import { env } from "@/lib/env.mjs";
import * as React from "react";
import { Icons } from "../Icons";

interface SupportRequestEmailProps {
  name: string;
  requestText: string;
  requestId: string;
}

export const SupportRequestEmail: React.FC<Readonly<SupportRequestEmailProps>> = ({
  name,
  requestText,
  requestId,
}) => (
  <div className="flex flex-col items-center justify-center bg-background p-4">
    <h1>
      We heard you need support!{" "}
    </h1>
    <p>
      Your support request has been received. We will review your request and get
      back to you shortly. If you have any questions, please email us at{" "}
      <a href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
        {env.NEXT_PUBLIC_SUPPORT_EMAIL}
      </a>{" "}
      and include your request ID <span className="font-mono text-muted-foreground">({requestId})</span> in the email.
    </p>
    <hr />
    <p>
      Name: {name}
    </p>
    <p>
      Request: <span className="text-muted-foreground text-sm">{requestText}</span>
    </p>
    <hr />
    <Icons.biddropper className="h-40 w-40" />
    <a href={env.NEXT_PUBLIC_APP_URL}>biddropper.com</a>
    <p>Ontario, Canada</p>
  </div>
);
