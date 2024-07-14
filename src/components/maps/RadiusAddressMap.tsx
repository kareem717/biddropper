"use client";

import { ComponentPropsWithoutRef, useMemo, useState, FC, useEffect } from "react";
import { env } from "@/lib/env.mjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Circle,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AddressInput from "./AddressInput";
import { useTheme } from "next-themes";
import { LabelSlider } from "../app/LabelSlider";
import { cn } from "@/lib/utils";
import useRadiusMap from "@/lib/hooks/useRadiusMap";
import { NewAddress } from "@/lib/validations/address";

interface RadiusAddressMapProps extends ComponentPropsWithoutRef<"div"> {
  addressInputProps?: ComponentPropsWithoutRef<typeof AddressInput>;
  labelSliderProps?: ComponentPropsWithoutRef<typeof LabelSlider>;
  mapContainerProps?: ComponentPropsWithoutRef<typeof MapContainer>;
  defaultAddress?: NewAddress;
  defaultRadius?: number;
  label?: string;
}

const defaultPosition = { lat: 43.6532, lng: -79.3832 };

const RadiusAddressMap: FC<RadiusAddressMapProps> = ({
  addressInputProps,
  labelSliderProps,
  mapContainerProps,
  label,
  defaultAddress,
  defaultRadius,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const [radius, setRadius] = useState<number>(defaultRadius || 50);
  const { onValueChange: onValueChangeLabelSlider } = labelSliderProps || {};
  const { setAddress: setMapAddress, setRadius: setMapRadius, getAddress: getMapAddress, getRadius: getMapRadius } = useRadiusMap();
  const address = getMapAddress();
  const centerPosition = {
    lat: Number(address?.yCoordinate) || defaultPosition.lat,
    lng: Number(address?.xCoordinate) || defaultPosition.lng,
  };

  const mapStyle = useMemo(
    () =>
      theme === "dark"
        ? env.NEXT_PUBLIC_MAPBOX_STYLE_DARK
        : env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT,
    [theme],
  );

  const MapPanner = () => {
    const map = useMap();
    map.panTo(centerPosition);
    return null;
  };

  useEffect(() => {
    if (defaultAddress) {
      defaultPosition.lat = Number(defaultAddress.yCoordinate);
      defaultPosition.lng = Number(defaultAddress.xCoordinate);
      setMapAddress(defaultAddress);
    }
  }, [defaultAddress, setMapAddress])

  return (
    <div
      className={cn(
        "relative h-[300px] w-[350px] overflow-hidden rounded-[var(--radius)] sm:h-[400px)]",
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
      {address && (
        <div className="absolute bottom-6 z-20 flex w-full items-center justify-center">
          <LabelSlider
            defaultValue={[radius]}
            max={5001}
            step={1}
            className="w-4/5 sm:w-1/2"
            label={label || " km"}
            {...labelSliderProps}
            onValueChange={(val) => {
              setRadius(val[0] || 0);
              setMapRadius(val[0] || 0);
              onValueChangeLabelSlider?.(val);
            }}
          />
        </div>
      )}
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
        {address && (
          <LayerGroup>
            <Circle
              center={centerPosition}
              pathOptions={{
                color: "hsl(var(--primary))",
                fillColor: "hsl(var(--primary))",
              }}
              radius={radius * 1000}
            />
            <Marker
              position={centerPosition}
              icon={
                new L.Icon({
                  iconUrl: "/map-marker.svg",
                  iconSize: [29.375, 40],
                })
              }
            />
          </LayerGroup>
        )}
      </MapContainer>
    </div>
  );
};

export default RadiusAddressMap;
