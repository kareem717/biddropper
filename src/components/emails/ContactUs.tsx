import { Tailwind, Container, render, Section, Text, Heading, Link, Hr, Head, Font } from "@react-email/components";
import tailwindConfig from "../../../tailwind.config";
import { FC } from "react";
import { Icons } from "../Icons";
import { env } from "@/lib/env.mjs";

interface ContactUsEmailProps {
  name?: string;
  message: string;
}

export const ContactUsEmail: FC<Readonly<ContactUsEmailProps>> = ({
  name,
  message,
}) => {
  return (
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
          <Heading as="h2">We heard you{name ? `, ${name}` : ''}!</Heading>
        </Section>
        <Section>
          <Text>
            Our team has recieved your response and will get back to you as soon as possible.
            In the mean time, feel free to check out our <Link href="https://biddropper.com">website</Link>,
            <Link href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>reply to this email</Link>, or <Link href="https://biddropper.com/contact">contact us</Link> again if you have any questions.
          </Text>
          {message && (
            <Text className="px-4 text-muted-foreground">
              {message}
            </Text>
          )}
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
};

export const ContactUsEmailHTML = ({ ...props }: ContactUsEmailProps) => {
  return render(<ContactUsEmail {...props} />);
}

