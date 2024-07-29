// import * as React from "react";

// interface ContactUsEmailProps {
//   name: string;
//   message: string;
//   email: string;
// }

// export const ContactUsCallbackEmail: React.FC<Readonly<ContactUsEmailProps>> = ({
//   name,
//   message,
//   email,
// }) => (
//   <div className="flex flex-col items-center justify-center bg-background p-4">
//     <p>
//       Name: {name}
//     </p>
//     <p>
//       Email: <a href={`mailto:${email}`}>{email}</a>
//     </p>
//     <hr />
//     <p>
//       Message: <span className="text-muted-foreground text-sm">{message}</span>
//     </p>
//   </div>
// );

import { Tailwind, Button, Container, render } from "@react-email/components";
import tailwindConfig from "../../../tailwind.config";
import { FC } from "react";

interface ContactUsEmailProps {
  name?: string;
  message: string;
  email?: string;
}

export const ContactUsEmail: FC<Readonly<ContactUsEmailProps>> = ({
  name,
  message,
  email,
}) => {
  return (
    <Tailwind
      config={tailwindConfig}
    >
      <Container className="bg-background text-primary">
        hello
      </Container>
    </Tailwind>
  );
};

export const ContactUsEmailHTML = ({...props}: ContactUsEmailProps) => {
  return render(<ContactUsEmail {...props} />);
}

