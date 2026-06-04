import { Suspense } from "react"
import Carnet from "@/components/Carnet"

export default function CarnetPage() {
  return (
    <Suspense>
      <Carnet />
    </Suspense>
  )
}
