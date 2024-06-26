import { ComponentPropsWithoutRef, useMemo, FC, useEffect } from "react";
import { env } from "@/lib/env.mjs";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AddressInput from "./features/AddressInput";
import useAddressInput from "@/lib/hooks/useAddressInput";
import { useTheme } from "next-themes";
import { cn } from "@/utils";
import { useAutoFillMap } from "@/lib/hooks/useAutoFillMap";
import { NewAddress } from "@/lib/validations/db";

interface AutoFillMapProps extends ComponentPropsWithoutRef<"div"> {
  mapContainerProps?: ComponentPropsWithoutRef<typeof MapContainer>;
  defaultAddress?: NewAddress;
  addressInputProps?: ComponentPropsWithoutRef<typeof AddressInput>;
}


const defaultPosition = { lat: 43.6532, lng: -79.3832 };

export const AutoFillMap: FC<AutoFillMapProps> = ({
  mapContainerProps,
  defaultAddress,
  className,
  addressInputProps,
  ...props
}) => {
  const { getAddress } = useAddressInput();
  const { getAddress: getMapAddress, setAddress: setMapAddress } = useAutoFillMap();
  const { theme } = useTheme();

  const mapStyle = useMemo(
    () =>
      theme === "dark"
        ? env.NEXT_PUBLIC_MAPBOX_STYLE_DARK
        : env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT,
    [theme],
  );

  useEffect(() => {
    if (defaultAddress) {
      defaultPosition.lat = Number(defaultAddress.yCoordinate);
      defaultPosition.lng = Number(defaultAddress.xCoordinate);
      setMapAddress(defaultAddress);
    }
  }, [defaultAddress, setMapAddress])

  const address = getAddress();
  const centerPosition = {
    lat: Number(address?.yCoordinate) || defaultPosition.lat,
    lng: Number(address?.xCoordinate) || defaultPosition.lng,
  };

  const MapPanner = () => {
    const map = useMap();
    map.panTo(centerPosition);
    return null;
  };

  return (
    <div
      className={cn(
        "relative h-60 w-full overflow-hidden rounded-[var(--radius)] sm:h-96",
        className,
      )}
      {...props}
    >
      <AddressInput
        className="absolute right-1 top-1 z-20 h-10 w-3/4 sm:right-2 sm:top-2 sm:h-12 sm:w-2/5"
        {...addressInputProps}
        onRetrieve={(address) => {
          setMapAddress(address);
          addressInputProps?.onRetrieve?.(address);
        }}
        autoComplete="off"
        placeholder="Enter address"
        {...addressInputProps}
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
