import { ShowAddress } from "@/lib/db/queries/validation"
import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface AddressDisplayProps extends ComponentPropsWithoutRef<"div"> {
  address: ShowAddress
}

export const AddressDisplay: FC<AddressDisplayProps> = ({ address, className, ...props }) => {
  return (
    <Link href={`https://maps.google.com/?ll=${address.yCoordinate},${address.xCoordinate}`} >
      <div className={cn("", className)} {...props}>
        {address.fullAddress}
      </div>
    </Link>
  )
}