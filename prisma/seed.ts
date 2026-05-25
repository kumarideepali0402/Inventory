import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })



const products = ["Iphone", "Noise Watch", "AC"];
const warehouses = [{name : "Delhi Warehouse", location :  "Delhi"}, {name : "Mumbai Warehouse", location :  "Mumbai"}]

async function main() {
    const createdWareHouses  = [];
    const createdProducts = []

    for (const p of  warehouses) {
        const created =  await prisma.warehouse.create({
            data : {
                name : p.name,
                location: p.location
            }
        })
        createdWareHouses.push(created)
    }

    for (const p of products) {
        const created = await prisma.product.create({
            data :{
                name : p,
                sku: `PRO-${p.replace(/\s+/g, '').toUpperCase()}`

            }
        })
        createdProducts.push(created);
    }


    for (const product of createdProducts) {
        for (const warehouse of createdWareHouses) {
            await prisma.stock.create({
                data:{
                    productId : product.id,
                    warehouseId : warehouse.id,
                    totalUnits: 10
                }
            })

        }
    } 
    
}




main()
    .catch(console.error)
    .finally(()=> prisma.$disconnect())