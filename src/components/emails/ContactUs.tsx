import * as React from "react";

interface ContactUsEmailProps {
  name: string;
  message: string;
  email: string;
}

export const ContactUsCallbackEmail: React.FC<Readonly<ContactUsEmailProps>> = ({
  name,
  message,
  email,
}) => (
  <div className="flex flex-col items-center justify-center bg-background p-4">
    <p>
      Name: {name}
    </p>
    <p>
      Email: <a href={`mailto:${email}`}>{email}</a>
    </p>
    <hr />
    <p>
      Message: <span className="text-muted-foreground text-sm">{message}</span>
    </p>
  </div>
);
