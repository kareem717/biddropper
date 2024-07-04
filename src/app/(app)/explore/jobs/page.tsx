"use client"

import { JobIndexCard } from "@/components/jobs/JobIndexCard"
import { QuickSearch } from "@/components/app/QuickSearch"

export default function JobIndexPage() {
  const jobs = [
    {
      "id": "0000d238-5e64-4529-a953-e5a374be4306"
    },
    {
      "id": "00010b99-bfb0-45bc-b5cc-0561149ce229"
    },
    {
      "id": "00036d78-1fb6-42f0-bded-037b930d2e09"
    },
    {
      "id": "00037e26-2b63-4e7e-a48b-71155e367e30"
    },
    {
      "id": "00062eab-1e71-4a7e-b871-6a4860727bcb"
    },
    {
      "id": "000a1c81-b2ae-4313-9da4-71628e4a1759"
    },
    {
      "id": "000b27a4-a1b9-44f3-a5d4-a7a9fb04e00d"
    },
    {
      "id": "000c2c1c-9411-4a9a-95a8-bf4f85970b75"
    },
    {
      "id": "0012358d-c88c-4256-903f-40f8f04cc6c8"
    },
    {
      "id": "00153436-d653-42f5-8d5c-0446e561f56c"
    },
    {
      "id": "0022aca5-f380-4897-86c5-dee4d4b2bec3"
    },
    {
      "id": "0024ec44-14ac-4907-9aaf-336b3fc2044d"
    },
    {
      "id": "002cfccb-3322-4e40-b172-fca772a8956c"
    },
    {
      "id": "002dabfe-b453-4d37-8654-b958d93cb107"
    },
    {
      "id": "002dfcf3-1045-4995-b070-055fba1ea830"
    },
    {
      "id": "002dfe5b-5682-48ec-ac8e-961271ffba21"
    },
    {
      "id": "002e5aa0-e2a5-4075-ad23-759f4d32cd7a"
    },
    {
      "id": "0030f758-2596-4295-a037-8944f476ef84"
    },
    {
      "id": "00327f99-c17a-492a-8bb2-7c3afbcf5747"
    },
    {
      "id": "00373cd5-7a93-4716-bd5e-bf2ef198e461"
    },
    {
      "id": "0039fbbf-7ece-4156-896c-57231dfa5f0c"
    },
    {
      "id": "003b6471-42f3-4734-9278-16bc30520577"
    },
    {
      "id": "003dfc07-5c36-4bfc-b068-d24eb4b6a4c3"
    },
    {
      "id": "0041e654-5fb8-4c4a-bb7a-c591f0a8f94b"
    },
    {
      "id": "0042233d-e87b-4c6a-859a-694a1d7315da"
    },
    {
      "id": "00491528-3ca7-4fc2-b3b2-e8d508634003"
    },
    {
      "id": "0049abc0-29c7-41a3-9b20-1dad4ef36f82"
    },
    {
      "id": "0049f4ef-a69d-4df8-a419-89c2118664e8"
    },
    {
      "id": "004d5bc5-9712-4776-b1fe-aa722cd534e3"
    },
    {
      "id": "004fe5e5-56a7-4f5c-a2d1-90a92c462c46"
    },
    {
      "id": "004fee4b-54c3-401d-b598-c586a98156e5"
    },
    {
      "id": "0051456e-d80e-4b6c-b4e0-c2fb7447c3ea"
    },
    {
      "id": "0054d8e2-2198-45e9-b6ff-6b15a003a681"
    },
    {
      "id": "005ad515-a9fe-4eeb-81c4-5ae40f25b316"
    },
    {
      "id": "005c3cf1-92ad-4181-9073-7921d3818407"
    },
    {
      "id": "005cb5ed-0dca-427f-a411-658d2223cad0"
    },
    {
      "id": "005e0511-2327-446d-a6af-8d6944933f59"
    },
    {
      "id": "00669ecb-f761-4359-b067-22c99103c4b6"
    },
    {
      "id": "006d986a-2ddf-4f16-972e-91a9b9b27737"
    },
    {
      "id": "006efaa7-d7d9-42e7-9920-449d32ef0011"
    },
    {
      "id": "0071255f-14bf-4f1d-9ea5-ae31ce774f41"
    },
    {
      "id": "00721433-3b34-4e82-89a7-5f9992521ec4"
    },
    {
      "id": "0075f985-e532-4d7e-a391-1bc9686c0a09"
    },
    {
      "id": "007aef06-9acc-4a32-8d5e-421783d0a72c"
    },
    {
      "id": "007b7ae4-7900-447d-9db6-b9657918b0d2"
    },
    {
      "id": "007dfca4-5361-4ec2-9d91-5854ef7c576a"
    },
    {
      "id": "00804d5a-42e1-4212-b18e-9668c44dfd64"
    },
    {
      "id": "00831aa8-fcb9-4c13-b803-3cadeea5715a"
    },
    {
      "id": "008662c8-4a12-4af5-8f2b-ad1a9ffdcffc"
    },
    {
      "id": "008da6c4-5c96-4b59-810a-57f777670fa3"
    }
  ]

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 md:mb-6 gap-2">
          <h1 className="text-3xl font-bold text-primary">Available Jobs</h1>
          <QuickSearch className="w-full md:w-1/3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <JobIndexCard key={job.id} jobId={job.id} />
          ))}
        </div>
      </div>
    </div>
  )
}