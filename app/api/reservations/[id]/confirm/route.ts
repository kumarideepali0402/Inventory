import {prisma} from"@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST (request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const {id} = await params;
    try {
        const reservation = await prisma.reservation.findFirst({
            where: {id}
        })

        console.log('expiresAt value:', reservation?.expiresAt)
        console.log('expiresAt type:', typeof reservation?.expiresAt)
        console.log('now:', new Date())

        if(!reservation) {
           return NextResponse.json({message:"reservation not found"}, {status: 404})
        }

        if(new Date(reservation.expiresAt) < new Date()) {
            return NextResponse.json({message: "reservation expired"}, {status : 410})
        }

        if(reservation.status !== 'PENDING'){
            return NextResponse.json({message : "Order already confirmed"}, {status: 400})
        }

        const newReservation = await prisma.reservation.update({
            where: {id},
            data: {status :'CONFIRMED'}
        })


        await prisma.stock.update({
            where :{ id: reservation.stockId},
            data: {
                reservedUnits: {decrement : reservation.quantity},
                totalUnits: {decrement:reservation.quantity}
        }
        })

        return NextResponse.json(newReservation, {status: 200})
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({message : "Server error"}, {status: 500})
        
    }

    

}