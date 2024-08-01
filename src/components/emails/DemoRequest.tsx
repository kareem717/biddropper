import { env } from "@/lib/env.mjs";
import { DemoRequestFormValues } from "../landing/demo/RequestForm";
import { Tailwind, Button, Container, render, Section, Row, Column, Text, Heading, Link, Hr, Head, Font } from "@react-email/components";
import tailwindConfig from "../../../tailwind.config";
import { FC } from "react";
import { Icons } from "../Icons";

interface DemoRequestEmailProps extends DemoRequestFormValues { }

export const DemoRequestEmail: FC<Readonly<DemoRequestEmailProps>> = ({
}) => (
  <Tailwind
    config={tailwindConfig}
  >
    <Head>
      <Font
        fontFamily="Roboto"
        fallbackFontFamily="Verdana"
        webFont={{
          url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Container className='font-sans bg-background text-foreground' >
      <Section>
        <Heading as="h2">We heard you need a demo!</Heading>
      </Section>
      <Section>
        <Text>
          Your demo request has been received. We will review your request and get
          back to you shortly. If you have any questions, please <Link href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
            email us
          </Link>.
        </Text>
      </Section>
      <Hr />
      <div className="flex flex-row justify-between w-full items-center">
        <Icons.biddropper className="w-30 h-20" href="https://biddropper.com" />
        <div className="flex flex-col tracking-wide text-muted-foreground">
          <Link className="font-bold text-lg text-primary" href="https://biddropper.com">biddropper.com</Link>
          <span>Ontario, Canada</span>
          <Link href="mailto:support@biddropper.com">support@biddropper.com</Link>
          <span>Copyright © 2024 Yakubu LLC</span>
        </div>
      </div>
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
    <Head>
      <Font
        fontFamily="Roboto"
        fallbackFontFamily="Verdana"
        webFont={{
          url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Container className='font-sans bg-background text-foreground' >
      <Section>
        <Heading as="h2">We heard you need a demo!</Heading>
      </Section>
      <Section>
        <Text>
          Your demo request has been received. We will review your request and get
          back to you shortly. If you have any questions, please <Link href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
            email us
          </Link>.
        </Text>
      </Section>
      <Section>
        {JSON.stringify(props)}
      </Section>
      <Hr />
      <div className="flex flex-row justify-between w-full items-center">
        <Icons.biddropper className="w-30 h-20" href="https://biddropper.com" />
        <div className="flex flex-col tracking-wide text-muted-foreground">
          <Link className="font-bold text-lg text-primary" href="https://biddropper.com">biddropper.com</Link>
          <span>+1 (647) 746-9659</span>
          <span>Ontario, Canada</span>
          <span>support@biddropper.com</span>
          <span>Copyright © 2024 Yakubu LLC</span>
        </div>
      </div>
    </Container>
  </Tailwind>
);

export const DemoRequestCallbackEmailHTML = ({ ...props }: DemoRequestEmailProps) => {
  return render(<DemoRequestCallbackEmail {...props} />);
}

