import { env } from "@/lib/env.mjs";
import * as React from "react";
import { Icons } from "../Icons";
import { DemoRequestFormValues } from "../landing/demo/RequestForm";

interface DemoRequestEmailProps extends DemoRequestFormValues { }

export const DemoRequestEmail = () => (
  <div className="flex flex-col items-center justify-center bg-background p-4">
    <h1>
      We heard you need a demo!
    </h1>
    <p>
      Your demo request has been received. We will review your request and get
      back to you shortly. If you have any questions, please email us at{" "}
      <a href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
        {env.NEXT_PUBLIC_SUPPORT_EMAIL}
      </a>
    </p>
    <hr />
    <a href={env.NEXT_PUBLIC_APP_URL}>biddropper.com</a>
    <p>Ontario, Canada</p>
  </div>
);

export const DemoRequestCallbackEmail: React.FC<Readonly<DemoRequestEmailProps>> = ({
  ...props
}) => (
  <div className="flex flex-col items-center justify-center bg-background p-4">
    <pre>{JSON.stringify(props, null, 2)}</pre>
  </div>
);