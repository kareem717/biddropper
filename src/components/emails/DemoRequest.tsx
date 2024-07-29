import { env } from "@/lib/env.mjs";
import { DemoRequestFormValues } from "../landing/demo/RequestForm";
import { Tailwind, Button, Container, render } from "@react-email/components";
import tailwindConfig from "../../../tailwind.config";
import { FC } from "react";

interface DemoRequestEmailProps extends DemoRequestFormValues { }

export const DemoRequestEmail: FC<Readonly<DemoRequestEmailProps>> = ({
  ...props
}) => (
  <Tailwind
    config={tailwindConfig}
  >
    <Container className="bg-background text-primary">
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
      </div>lo
    </Container>
  </Tailwind>
);

export const DemoRequestEmailHTML = ({ ...props }: DemoRequestEmailProps) => {
  return render(<DemoRequestEmail {...props} />);
}
export const DemoRequestCallbackEmail: React.FC<Readonly<DemoRequestEmailProps>> = ({
  ...props
}) => (
  <Tailwind
    config={tailwindConfig}
  >
    <Container className="bg-background text-primary">
      <pre>{JSON.stringify(props, null, 2)}</pre>

    </Container>
  </Tailwind>
);

export const DemoRequestCallbackEmailHTML = ({ ...props }: DemoRequestEmailProps) => {
  return render(<DemoRequestCallbackEmail {...props} />);
}

