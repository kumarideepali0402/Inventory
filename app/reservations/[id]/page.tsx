import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReservationClient from "@/app/components/ReservationClient"

export default async function Reservation({params}:{params: Promise<{id:string}>}) {
    const {id} = await params
   
    const reservation = await prisma.reservation.findUnique({
        where: {id},
        include:{
            stock:{
                include:{
                    product: true,
                    warehouse: true
                }
            }
        }

    })

    if(!reservation) return notFound()

    return <ReservationClient reservation={reservation}/>
    
}
