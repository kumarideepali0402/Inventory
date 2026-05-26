"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
type Props = {
    reservation: {
        id: string,
        status: string,
        quantity: number,
        expiresAt: Date | string,
        stock:{
            product: {name:string, sku : string}
            warehouse: {name: string}
        }
    }

}

export default  function ReservationClient({reservation}:Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)
    const [timeLeft, setTimeLeft] = useState<number>(
        Math.floor((new Date(reservation.expiresAt).getTime() - Date.now())/1000)
    )
    const [status, setStatus] = useState(reservation.status)
    const router = useRouter()
    useEffect(() => {
            const run =  setInterval(()=> {
                            const secondsLeft  = Math.floor((new Date(reservation.expiresAt).getTime() - Date.now())/1000)
                            setTimeLeft(secondsLeft)
                            if(secondsLeft <= 0 ) clearInterval(run)
                        }, 1000)
        return () => clearInterval(run)

    }, [])    


    async function handleConfirm() {
        setLoading(true)
        const res = await fetch(`/api/reservations/${reservation.id}/confirm`, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            }
        });
        const data = await res.json()

        if(!res.ok) {
            setError(data.message)
        } else{
            setStatus('CONFIRMED');
            router.refresh()
        }
        setLoading(false);
    } 
    async function handleCancel () {
        setLoading(true);

        const res = await fetch(`/api/reservations/${reservation.id}/release`, {method: "POST"});
        const data = await res.json();

        if(!res.ok) {
            setError(data.error)
        } else {
            setStatus('RELEASED')
            router.refresh()
        }

        
        setLoading(false);

    }

    const minuteLeft = Math.floor(timeLeft/60);
    const secondLeft = timeLeft%60;
    const display = `${minuteLeft}: ${secondLeft.toString().padStart(2, '0'     )}`





    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-purple-800 text-white p-6 mb-8">
            <h1 className="text-2xl font-bold">Allo Inventory</h1>
            <p className="text-purple-200 text-sm">Checkout</p>
            </div>

            <div className="max-w-2xl mx-auto px-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Reservation Details</h2>
                
                <div className="space-y-2 text-gray-600 mb-6">
                <p><span className="font-medium">Product:</span> {reservation.stock.product.name}</p>
                <p><span className="font-medium">Warehouse:</span> {reservation.stock.warehouse.name}</p>
                <p><span className="font-medium">Quantity:</span> {reservation.quantity}</p>
                <p><span className="font-medium">Status:</span> {status}</p>
                </div>

                {status === 'PENDING' && (
                <div className="bg-purple-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-gray-500 mb-1">Expires in</p>
                    <p className="text-3xl font-bold text-purple-700">{display}</p>
                </div>
                )}

                {status === 'PENDING' && (
                <div className="flex gap-3">
                    <button onClick={handleCancel} disabled={loading}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={loading}
                    className="flex-1 bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-800 disabled:opacity-50">
                    {loading ? 'Processing...' : 'Confirm Purchase'}
                    </button>
                </div>
                )}

                {status === 'CONFIRMED' && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
                    Payment confirmed. Thank you!
                </div>
                )}

                {status === 'RELEASED' && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
                        Reservation cancelled.
                    </div>
                    )}


                {error && (
                <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
                )}
            </div>
            </div>
        </div>
    )

}