import { Metadata } from "next";
import Image from "next/image";
import about from "@/config/about";

export const metadata: Metadata = {
  title: about.title,
  description: "About",
};

export default function AboutPage() {
  return (
    <>
      <div className="mt-20 relative sm:mt-44">
        <h1 className="md:text-5xl text-3xl font-bold relative mx-auto max-w-2xl text-left">
          {about.title}
        </h1>
        <div className="mx-auto mt-6 max-w-2xl space-y-5 text-left text-lg font-medium leading-[1.75 text-muted-foreground">
          {about.description.map((item) => (
            <p>{item}</p>
          ))}
          <p className="text-base italic text-muted-foreground/80">- Kareem Yakubu, Founder of biddropper</p>
        </div>
      </div>
      <div className="absolute inset-x-0 mx-auto -mb-16 h-64 w-[600px] transform-gpu rounded-full bg-secondary/20 blur-[90px] sm:-mb-32" />
      <div className="mx-auto mt-16 h-px max-w-8xl sm:mt-32 bg-gradient-to-r from-primary to-accent" />
      <div className="mt-20 relative mx-auto max-w-7xl py-16 sm:py-32 ">
        <h3 className="text-3xl md:text-5xl font-bold relative mx-auto max-w-2xl text-left">
          The Team
        </h3>
        <div className="mx-auto mt-6 max-w-2xl space-y-5 text-left text-lg font-medium leading-[1.75] text-muted-foreground">
          {about.teamDescription.map((item) => (
            <p>{item}</p>
          ))}
        </div>
        <Image
          alt="biddropper team"
          src={about.teamPhoto.src}
          width="1920"
          height="1080"
          decoding="async"
          data-nimg="1"
          className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border-x border-t shadow-2xl shadow-accent"
          loading="lazy"
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">{about.teamPhoto.caption}</p>
      </div>
    </>
  );
}
