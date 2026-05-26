import  {prisma} from"@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { z } from "zod"

const ReserveSchema = z.object({
    productId: z.string().min(1),
    warehouseId: z.string().min(1),
    quantity: z.number().int().positive()

})

type StockRow = {
    id: string,
    productId: string,
    warehouseId: string,
    totalUnits: number,
    reservedUnits: number
}
export  async function POST (request: NextRequest) {
    const body = await request.json();
    const parsed = ReserveSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error : parsed.error.message}, {status: 400})
    }

    const { productId, warehouseId, quantity } = parsed.data
    try {

            const updated = await prisma.$queryRaw<StockRow[]>`
                UPDATE "Stock" 
                SET "reservedUnits" = "reservedUnits" + ${quantity}::integer
                WHERE "productId" = ${productId}
                AND "warehouseId" =${warehouseId}
                AND ("totalUnits" - "reservedUnits") >= ${quantity}::integer
                RETURNING *
                ` 
            

              if (updated.length === 0) {
                    throw new Error('Insufficient stock')
                }

                const stock = updated[0]
           

            const reservation = await prisma.reservation.create({
                data:{
                    stockId: stock.id,
                    quantity: quantity,
                    status:"PENDING",
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            })
            return NextResponse.json(reservation, {status: 201})

        }
       
     catch (error: any) {
         console.error('Reservation error:', error) 
        if(error.message === 'Insufficient stock') {
            return NextResponse.json({error: 'Not enough stock'}, {status: 409})

        }
        return NextResponse.json({error: "Something went wrong"},{status:500})
        
    }



    
   
}