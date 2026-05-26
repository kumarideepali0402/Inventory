import {prisma} from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"

export async function POST(request: NextRequest, {params} : {params: Promise<{id: string}>}) {
    const {id} = await params;
    try {
        const reservation = await prisma.reservation.findFirst({
            where: {id}
    
        })
    
        if(!reservation) {
            return NextResponse.json({message: "Reservation doesn't exist"},{status: 404} )
        }

        if (reservation.status !== 'PENDING') {
            return NextResponse.json({ message: 'Reservation already actioned' }, { status: 400 })
        }

    
        const newReservation = await prisma.reservation.update({
            where: {id : id},
            data:{
                status: "RELEASED",
    
            }
    
        })
        await prisma.stock.update({
            where: {id: reservation.stockId},
            data:{
                reservedUnits:{ decrement: reservation.quantity},
    
            }
    
        })
        return NextResponse.json(newReservation,{status: 200})
    
    
    } catch (error) {
        console.log(error);
        return NextResponse.json({message : "Error releasing the order"}, {status: 500})

        
    }
    


}
