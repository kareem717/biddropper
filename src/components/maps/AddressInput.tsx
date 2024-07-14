"use client";

import { ComponentPropsWithoutRef, FC } from "react";
import { Input } from "@/components/ui/input";
import { AddressAutofill } from "@mapbox/search-js-react";
import { env } from "@/lib/env.mjs";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import useAddressInput from "@/lib/hooks/useAddressInput";
import { cn } from "@/lib/utils";
import { NewAddressSchema, NewAddress } from "@/lib/validations/address";

interface AddressInputProps extends ComponentPropsWithoutRef<typeof Input> {
  onRetrieve?: (val: NewAddress) => void;
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

    const parse = NewAddressSchema.safeParse({
      postalCode: vals.postcode,
      xCoordinate: String(geo.coordinates[0]),
      yCoordinate: String(geo.coordinates[1]),
      line1: vals.address_line1,
      line2: vals.address_line2,
      // @ts-ignore
      city: vals.place,
      // @ts-ignore
      region: vals.region,
      // @ts-ignore
      regionCode: vals.region_code,
      country: vals.country,
      fullAddress: vals.full_address || vals.place_name,
      rawJson: res,
      // @ts-ignore
      district: vals.district,
    });


    if (parse.success) {
      setAddress(parse.data);
      onRetrieve?.(parse.data);
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
