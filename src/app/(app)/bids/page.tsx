/**
 * v0 by Vercel.
 * @see https://v0.dev/t/uYv2hsxdoKR
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { BidIndexCard } from "@/components/bids/BidIndexCard"
import { BidShowCard } from "@/components/bids/BidShowCard"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trpc } from "@/lib/trpc/client"

export default function BidsPage() {
  const [selectedBid, setSelectedBid] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const bids = [
    {
      "bid_id": "d0fa825e-0f8e-4792-ac79-12d12cb3c39b"
    },
    {
      "bid_id": "db70c42d-07eb-43f0-91d4-dcf70bd00dbe"
    },
    {
      "bid_id": "bf4e7d71-18e2-4c87-81bc-f3ac51a88b2f"
    },
    {
      "bid_id": "f7024c59-3d9f-4343-bf2f-687cf74160ea"
    },
    {
      "bid_id": "4f1427c0-e761-42c9-a8ec-a3017d5c85a3"
    },
    {
      "bid_id": "2883b611-8660-47ca-b19d-4222e80fc40b"
    },
    {
      "bid_id": "c100648c-25c3-4e77-b87e-f4f38d3f434c"
    },
    {
      "bid_id": "29885616-8e2d-4d3b-ae6d-b544e0735ebb"
    },
    {
      "bid_id": "dfb9fc39-d485-48c8-87ae-8387821755b3"
    },
    {
      "bid_id": "ff72265a-2e48-4582-9d6c-bd2fefb1b520"
    },
    {
      "bid_id": "d45773a1-701a-4362-bf63-d9747cc306ef"
    },
    {
      "bid_id": "2bbb0be1-dc33-453e-bf5f-b30e59299cff"
    },
    {
      "bid_id": "932ae76a-b028-46c2-9977-8e61ed325f33"
    },
    {
      "bid_id": "f07adac8-ad71-4b61-baec-1b8cb7c8d94d"
    },
    {
      "bid_id": "7670fdde-fd16-49f5-bc14-ad1c0385670c"
    },
    {
      "bid_id": "286bcb62-7de6-4c70-b570-4340e8b83552"
    },
    {
      "bid_id": "3808093f-7799-4479-bf9d-bcdb58d5a821"
    },
    {
      "bid_id": "02d33259-4d2c-4d5f-aae9-c39eea2b7c14"
    },
    {
      "bid_id": "e2e95ebb-1ca3-4abc-900d-e871362196b3"
    },
    {
      "bid_id": "5f2312b6-e130-4bd5-b58a-53d2bbebe176"
    },
    {
      "bid_id": "0c3d7d27-2519-4318-9386-f7d4d9997727"
    },
    {
      "bid_id": "0acf2334-99ef-41d5-8396-936aaff145df"
    },
    {
      "bid_id": "a98aed4c-b567-4b16-990d-4c2b84e03ae6"
    },
    {
      "bid_id": "9cc4acfe-a211-49c2-a948-24ba52476fb5"
    },
    {
      "bid_id": "222a2152-41be-44bd-8b66-8f746372c68b"
    },
    {
      "bid_id": "ce144095-a342-4012-8470-640c3e261780"
    },
    {
      "bid_id": "47b7a192-3241-4ce4-93d3-577ca0c7262b"
    },
    {
      "bid_id": "2a883997-aad6-43cf-836e-da7833ce3757"
    },
    {
      "bid_id": "d26e74ff-6ca1-4a5c-8196-534de4abda6f"
    },
    {
      "bid_id": "f2cda994-bffc-44a7-bdae-fe9bbf153fea"
    },
    {
      "bid_id": "0ac35433-f46f-47c0-814b-aeb35570d579"
    },
    {
      "bid_id": "2219f8c6-501e-40fb-bbf5-ed4421106086"
    },
    {
      "bid_id": "503bf766-9dbc-42bc-af0a-5971db4c4bef"
    },
    {
      "bid_id": "8e57d33d-719c-48ed-94c1-6f393ab82aa9"
    },
    {
      "bid_id": "d0e2f11e-dd27-4762-baec-fed18572c397"
    },
    {
      "bid_id": "95164da4-51f6-4420-9586-e9b2cbde0efe"
    },
    {
      "bid_id": "6b739846-7c30-4704-ba42-6187e4d78ec2"
    },
    {
      "bid_id": "a118de3f-dece-4e13-8cae-09c7a45bec12"
    },
    {
      "bid_id": "b3579905-9805-4d7e-a848-8f2d1e3cb45b"
    },
    {
      "bid_id": "1c37fda8-32b2-4088-ba08-1f9139cd8c8f"
    },
    {
      "bid_id": "6ca36b33-dc30-4984-b066-a761e83322ad"
    },
    {
      "bid_id": "630e3dc9-6371-48c3-bd96-c51b1b3f35d1"
    },
    {
      "bid_id": "c194c03b-0025-43e5-a57b-6732e91bac21"
    },
    {
      "bid_id": "fcd8299c-32cd-4e32-b2a3-9213db390520"
    },
    {
      "bid_id": "e0ff902a-cd34-413e-b2f3-203b2b1e45b4"
    },
    {
      "bid_id": "98b7f7e7-e313-4865-b6b3-3dee587315c9"
    },
    {
      "bid_id": "837fac9a-dfb5-4963-98be-5dbf773d52ba"
    },
    {
      "bid_id": "202acb3a-b1bd-4933-8c90-262f9d5d9157"
    },
    {
      "bid_id": "f8b6794b-58f5-4874-a5f7-bdf0fabfa22f"
    },
    {
      "bid_id": "d3459c32-b118-4b19-afad-e8034152ecce"
    },
    {
      "bid_id": "2a4a97c1-6ac5-4fd2-bba6-a063d864a66e"
    },
    {
      "bid_id": "85db1bc3-d159-44b9-a72a-9d8bdaa4ec38"
    },
    {
      "bid_id": "ccd05339-706a-4e84-91cb-9297f3bb637d"
    },
    {
      "bid_id": "49caeb45-f2d0-4fbf-93a3-01da3d65b41a"
    },
    {
      "bid_id": "ba0efd3c-27a2-48b0-80e6-4d9e71e9a8f1"
    },
    {
      "bid_id": "a108c33a-39e2-408e-a033-d91a809aa6af"
    },
    {
      "bid_id": "b55a2444-9757-4612-8c2c-7d6664b6eab3"
    },
    {
      "bid_id": "7d34f101-6e8f-4640-93fb-ca0cfa407910"
    },
    {
      "bid_id": "b44e5937-8d63-49a7-8fca-2e2377f04203"
    },
    {
      "bid_id": "9db2394b-f3b0-4b18-aa1c-4a4562d9d1d7"
    },
    {
      "bid_id": "9db5fada-61b9-4d64-b65f-6e11b4d0cc6c"
    },
    {
      "bid_id": "e50e2a4d-a593-4148-aa85-fedc87432f5f"
    },
    {
      "bid_id": "b2f16364-d044-49ff-ac65-d71984bde932"
    },
    {
      "bid_id": "4762251c-4fae-493a-a950-5b346f93be0f"
    },
    {
      "bid_id": "51629807-61ce-4cb3-8aad-d30ca5cbef9c"
    },
    {
      "bid_id": "be75bbd9-e1a1-4a17-95f9-8e86b09ec439"
    },
    {
      "bid_id": "add04b80-18ec-487e-a9bb-6904b68a0085"
    },
    {
      "bid_id": "929d0722-b6d3-459a-944b-f39fefef46a6"
    },
    {
      "bid_id": "5f04d55f-c7a9-4b1b-af30-7ff8ac565c90"
    },
    {
      "bid_id": "68204dc3-eaad-4c91-a052-f90a19c0a8c6"
    },
    {
      "bid_id": "cf08d0e9-05e1-419f-80b4-a1c6a747986f"
    },
    {
      "bid_id": "f1e00f51-bd27-42f7-af58-fd7773feb3cc"
    },
    {
      "bid_id": "97f4dddc-152e-45d8-9294-edf078313a50"
    },
    {
      "bid_id": "8b8613f6-bda4-44d8-a96e-b2baf46c022a"
    },
    {
      "bid_id": "35437016-2f98-4d64-8870-5b61348e005a"
    },
    {
      "bid_id": "e1e5d9ce-55be-4f97-9c87-23aa45a0e2cb"
    },
    {
      "bid_id": "577fc48d-c974-4348-9662-8d397fbf4bb0"
    },
    {
      "bid_id": "418a5938-5a72-4cc5-8e97-3bf2db102366"
    },
    {
      "bid_id": "eb7a02ce-7f0b-444b-92bd-17bfaa6fba7d"
    },
    {
      "bid_id": "c920a346-5bca-42df-a663-7e7fbe33789d"
    },
    {
      "bid_id": "6cf80420-7f3d-408c-bf7f-7ab6f3208fb0"
    },
    {
      "bid_id": "7d26a9b5-48ab-4964-a2de-612d6def9f66"
    },
    {
      "bid_id": "9ec933bd-5e6f-47fa-84d7-d96712e15523"
    },
    {
      "bid_id": "42a4c331-e621-420b-9638-48da932af553"
    },
    {
      "bid_id": "b738db17-fb24-4f32-8418-fbfb3b0219c8"
    },
    {
      "bid_id": "16cc6ea3-cfa7-412f-b8e1-4a4c4c2682b6"
    },
    {
      "bid_id": "475ce27c-40e3-45b6-a31f-8fce1b5a68be"
    },
    {
      "bid_id": "d2c99739-1098-433a-8e86-081e57aaae7b"
    },
    {
      "bid_id": "bb495821-70d3-4398-ac19-2ff7ab8dbebf"
    },
    {
      "bid_id": "9d3a40a3-85d0-4716-a691-7d01b07ebbfb"
    },
    {
      "bid_id": "bd23c00c-d813-44c5-942c-b9956adf6f51"
    },
    {
      "bid_id": "cf7db370-ff6c-462e-802f-84db584d13c4"
    },
    {
      "bid_id": "d3c55c97-6dcd-4ab7-b4d8-3d645dad479b"
    },
    {
      "bid_id": "cf036a1c-d7ff-4895-aaf9-e82eef80a2e4"
    },
    {
      "bid_id": "2d6b86bd-a158-4eb4-884d-db8484608d02"
    },
    {
      "bid_id": "aa43f50d-6dec-4d99-a2ad-7f34b8ceac49"
    },
    {
      "bid_id": "3d72e59e-12be-484d-932c-33e0d558688d"
    },
    {
      "bid_id": "c2f86e41-3995-4041-a6d6-0c67a07de1ba"
    },
    {
      "bid_id": "dff711e7-253c-4341-bbc8-1ca51a2f2495"
    },
    {
      "bid_id": "dffeec46-3007-4398-91d0-0e89d5ffc653"
    }
  ]

  const handleBidClick = (bid: any) => {
    console.log(bid.bid_id)
    setSelectedBid(bid.bid_id)
    setShowDetails(true)
  }
  return (
    <div className="grid grid-cols-3">
      <main className="flex-1 p-4 col-span-1">
        <div className="flex items-center justify-between mb-4">
          <Input placeholder="Search" className="mb-4" />
        </div>
        <ScrollArea className="grid grid-cols-1 gap-4 h-[80vh] px-4">
          {bids.map((bid) => (
            <BidIndexCard key={bid.bid_id} bidId={bid.bid_id} onClick={() => handleBidClick(bid)} className="my-2" />
          ))}
        </ScrollArea>
      </main>
      {showDetails && selectedBid && (
        <aside className="p-4 border-l col-span-2">
          <BidShowCard bidId={selectedBid} />
        </aside>
      )}
    </div>
  )
}