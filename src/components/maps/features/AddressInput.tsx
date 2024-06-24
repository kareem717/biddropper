"use client";

import { ComponentPropsWithoutRef, FC } from "react";
import { Input } from "@/components/ui/input";
import { AddressAutofill } from "@mapbox/search-js-react";
import { env } from "@/lib/env.mjs";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import useAddressInput, { Address } from "@/lib/hooks/useAddressInput";
import { cn } from "@/utils";
import { addressInsertSchema } from "@/lib/validations/db";

interface AddressInputProps extends ComponentPropsWithoutRef<typeof Input> {
  onRetrieve?: (val: Address) => void;
}

const AddressInput: FC<AddressInputProps> = ({
  className,
  onRetrieve,
  ...props
}) => {
  const { setAddress } = useAddressInput();

  const handleRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const vals = res?.features[0]?.properties;
    const geo = res?.features[0]?.geometry;

    if (!vals || !geo) {
      throw new Error("No address found");
    }

    const parse = addressInsertSchema.safeParse({
      postal_code: vals.postcode,
      x_coordinate: String(geo.coordinates[0]),
      y_coordinate: String(geo.coordinates[1]),
      line_1: vals.address_line1,
      line_2: vals.address_line2,
      // @ts-ignore
      city: vals.place,
      // @ts-ignore
      region: vals.region,
      // @ts-ignore
      region_code: vals.region_code,
      country: vals.country,
      full_address: vals.full_address,
      raw_json: res,
      // @ts-ignore
      district: vals.district,
    });

    if (parse.success) {
      setAddress(parse.data);
      if (onRetrieve) {
        onRetrieve(parse.data);
      }
    }
  };

  return (
    <>
      {/* @ts-ignore */}
      <AddressAutofill
        accessToken={env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        onRetrieve={handleRetrieve}
        theme={{
          variables: {
            colorBackground: "hsl(var(--muted))",
            colorBackgroundHover: "hsl(var(--primary))",
            colorBackgroundActive: "hsl(var(--primary))",
            colorText: "hsl(var(--text))",
            colorSecondary: "hsl(var(--accent-foreground))",
          },
        }}
      >
        {
          (
            <Input
              name="address"
              autoComplete="address-line1"
              placeholder="Begin to enter an address..."
              className={cn("bg-background", className)}
              {...props}
            />
          ) as any
        }
      </AddressAutofill>
    </>
  );
};

export default AddressInput;
