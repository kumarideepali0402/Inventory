import {prisma} from "@/lib/prisma"
import {NextResponse} from "next/server"


export async function GET() {

    const expiredReservations = await prisma.reservation.updateManyAndReturn({
        where:{
            status : "PENDING",
            expiresAt: {lt : new Date()}

        },
        data: {
            status: 'RELEASED'

        },
        select: {
            id: true, 
            stockId: true,
            quantity: true
        }
    })

    for (const reservation of expiredReservations) {
        await prisma.stock.update({
            where:{
                id: reservation.stockId
            },
            data:{
                reservedUnits: {decrement : reservation.quantity}
            }
        })


    }




    const products = await prisma.product.findMany({
        include:{
            stocks: {
                include:{
                    warehouse: true
                }
            }
        }
    })

    return NextResponse.json(products, {status: 200})
}