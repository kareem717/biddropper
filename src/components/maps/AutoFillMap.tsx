"use client";

import { ComponentPropsWithoutRef, useMemo, FC, useEffect } from "react";
import { env } from "@/lib/env.mjs";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AddressInput from "./AddressInput";
import useAddressInput from "@/lib/hooks/useAddressInput";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAutoFillMap } from "@/lib/hooks/useAutoFillMap";
import { NewAddress } from "@/lib/db/queries/validation";

const DEFAULT_POSITION = { lat: 43.6532, lng: -79.3832 };

interface AutoFillMapProps extends ComponentPropsWithoutRef<"div"> {
  mapContainerProps?: ComponentPropsWithoutRef<typeof MapContainer>;
  addressInputProps?: ComponentPropsWithoutRef<typeof AddressInput>;
  defaultAddress?: NewAddress;
}

export const AutoFillMap: FC<AutoFillMapProps> = ({
  mapContainerProps,
  defaultAddress,
  className,
  addressInputProps,
  ...props
}) => {
  const { getAddress } = useAddressInput();
  const { setAddress: setMapAddress } = useAutoFillMap();
  const { resolvedTheme } = useTheme();
  const address = getAddress();
  const centerPosition = {
    lat: Number(address?.yCoordinate) || DEFAULT_POSITION.lat,
    lng: Number(address?.xCoordinate) || DEFAULT_POSITION.lng,
  };

  const mapStyle = useMemo(
    () =>
      resolvedTheme === "dark"
        ? env.NEXT_PUBLIC_MAPBOX_STYLE_DARK
        : env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT,
    [resolvedTheme],
  );

  const MapPanner = () => {
    const map = useMap();
    map.panTo(centerPosition);
    return null;
  };

  useEffect(() => {
    if (defaultAddress) {
      DEFAULT_POSITION.lat = Number(defaultAddress.yCoordinate);
      DEFAULT_POSITION.lng = Number(defaultAddress.xCoordinate);
      setMapAddress(defaultAddress);
    }
  }, [defaultAddress, setMapAddress])

  return (
    <div
      className={cn(
        "relative h-60 w-full overflow-hidden rounded-[var(--radius)] sm:h-96",
        className,
      )}
      {...props}
    >
      <AddressInput
        autoComplete="off"
        placeholder="Enter address"
        {...addressInputProps}
        className={cn("absolute right-1 top-1 z-20 h-10 w-3/4 sm:right-2 sm:top-2 sm:h-12 sm:w-2/5", addressInputProps?.className)}
        onRetrieve={(address) => {
          setMapAddress(address);
          addressInputProps?.onRetrieve?.(address);
        }}
      />
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="z-0 h-full w-full"
        {...mapContainerProps}
      >
        <MapPanner />
        <TileLayer
          attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/${mapStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        />
        {address || defaultAddress ? (
          <Marker
            position={centerPosition}
            icon={
              new L.Icon({
                iconUrl: "/map-marker.svg",
                iconSize: [29.375, 40],
              })
            }
          />
        ) : null}
      </MapContainer>
    </div>
  );
};
