"use client"

import {useRouter} from "next/navigation"
import {useState} from "react"

type Props= {
    productId: string,
    warehouseId: string
}

export default function ReserveButton({productId, warehouseId} : Props) {
    const router = useRouter();
    const [error, setError] = useState<string |null>(null);
    const [loading, setLoading] = useState(false)

    async function handleReserve() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/reservations",{
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({productId, warehouseId, quantity: 1})
            })

            const data = await res.json()

            if(!res.ok) {
                setError(data.error)
                setLoading(false)
                return
            }
            router.push(`/reservations/${data.id}`)
            
        } catch (error: any) {
            console.log(error);
            
            setLoading(false)
        
            
        }


       
    }
     return(
            <div>
                <button onClick={handleReserve} disabled={loading}
                className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-800 disabled:opacity-50">
                    {loading? "Reserving..." : "Reserve"}
                </button>
                {error && <p className="text-red-400">{error}</p>}
            </div>

        )
}