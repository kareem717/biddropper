import { env } from "@/lib/env.mjs";
import { Tailwind, Container, render, Section, Text, Heading, Link, Hr, Head, Font } from "@react-email/components";
import tailwindConfig from "../../../tailwind.config";
import { FC } from "react";
import { Icons } from "@/components/Icons";

interface SupportRequestEmailProps {
  name: string;
  requestText: string;
  requestId: string;
}

const SupportRequestEmail: FC<Readonly<SupportRequestEmailProps>> = ({
  name,
  requestText,
  requestId,
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
        <Heading as="h2">Hey {name ? name : 'there'}, we heard you need help!</Heading>
      </Section>
      <Section>
        Your support request has been received. We will review your request and get
        back to you shortly. If you have any questions, please  <Link href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
          email us
        </Link>. and include your request ID <span className="font-mono text-muted-foreground">({requestId})</span> in the email.
      </Section>
      <Section>
        <Text className="px-4 text-muted-foreground">
          {requestText}
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
  </Tailwind >
);

export default SupportRequestEmail;

export const SupportRequestEmailHTML = ({ ...props }: SupportRequestEmailProps) => {
  return render(<SupportRequestEmail {...props} />);
}