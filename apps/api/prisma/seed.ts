import { FulfillmentStatus, PaymentStatus, PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2';
const prisma = new PrismaClient();
const products = [
  ['Oversized Wool Overshirt','oversized-wool-overshirt','APP-001','Fashion',895000,'A structured oversized layer in premium brushed wool.','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'],
  ['Studio Wireless Headphones','studio-wireless-headphones','TEC-001','Electronics',1299000,'Immersive sound, all-day comfort, and timeless design.','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'],
  ['Handcrafted Stoneware Set','handcrafted-stoneware-set','HOM-001','Home Living',579000,'Set of four tactile stoneware cups for daily rituals.','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80'],
  ['Minimal Steel Watch','minimal-steel-watch','ACC-001','Accessories',749000,'A pared-back timepiece with a brushed steel case.','https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80'],
  ['Canvas Weekend Tote','canvas-weekend-tote','ACC-002','Accessories',425000,'Heavyweight canvas tote for your everyday carry.','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'],
  ['Linen Relaxed Shirt','linen-relaxed-shirt','APP-002','Fashion',499000,'Breathable linen with a clean, relaxed silhouette.','https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=80']
] as const;
async function main() {
 const password = await argon2.hash('Admin123!', { type: argon2.argon2id }); const customer = await argon2.hash('Customer123!',{type:argon2.argon2id});
 await prisma.user.upsert({where:{email:'admin@shopora.test'},update:{name:'Shopora Admin',passwordHash:password,role:Role.ADMIN},create:{name:'Shopora Admin',email:'admin@shopora.test',passwordHash:password,role:Role.ADMIN}});
 const customerUser=await prisma.user.upsert({where:{email:'customer@shopora.test'},update:{name:'Alya Customer',passwordHash:customer,role:Role.CUSTOMER},create:{name:'Alya Customer',email:'customer@shopora.test',passwordHash:customer,role:Role.CUSTOMER}});
 await prisma.user.upsert({where:{email:'naufal@shopora.test'},update:{name:'Naufal Pratama',passwordHash:customer,role:Role.CUSTOMER},create:{name:'Naufal Pratama',email:'naufal@shopora.test',passwordHash:customer,role:Role.CUSTOMER}});
 for (const name of ['Fashion','Electronics','Home Living','Accessories']) await prisma.category.upsert({where:{name},update:{slug:name.toLowerCase().replaceAll(' ','-'),isActive:true},create:{name,slug:name.toLowerCase().replaceAll(' ','-')}});
 for (const [name,slug,sku,catName,price,description,imageUrl] of products) { const cat=await prisma.category.findUniqueOrThrow({where:{name:catName}}); await prisma.product.upsert({where:{sku},update:{},create:{name,slug,sku,description,price:BigInt(price),stock:sku==='HOM-001'?4:24,categoryId:cat.id,images:{create:{imageUrl,isPrimary:true}}}}); }
 const categoryRows=await prisma.category.findMany({orderBy:{name:'asc'}});
 const generated=Array.from({length:14},(_,index)=>{const n=index+1,category=categoryRows[index%categoryRows.length];return {name:`Shopora Essential ${String(n).padStart(2,'0')}`,slug:`shopora-essential-${String(n).padStart(2,'0')}`,sku:`SEED-${String(n).padStart(2,'0')}`,description:'A considered everyday essential selected for quality, function, and timeless appeal.',price:BigInt(199000+(index%14)*75000),stock:index%7===0?3:10+(index%15),isActive:true,categoryId:category.id,createdAt:new Date('2025-01-01T00:00:00.000Z'),updatedAt:new Date('2025-01-01T00:00:00.000Z')}});
 await prisma.product.deleteMany({where:{sku:{startsWith:'SEED-',notIn:generated.map(product=>product.sku)}}});
 await prisma.product.createMany({data:generated,skipDuplicates:true});
 const imagePool=['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'];
 const productsWithoutImages=await prisma.product.findMany({where:{sku:{startsWith:'SEED-'},images:{none:{}}},select:{id:true,sku:true}});
 await prisma.productImage.createMany({data:productsWithoutImages.map((p,index)=>({productId:p.id,imageUrl:imagePool[index%imagePool.length],isPrimary:true}))});
 if(!await prisma.address.findFirst({where:{userId:customerUser.id}}))await prisma.address.create({data:{userId:customerUser.id,recipientName:'Alya Customer',phone:'081234567890',addressLine:'Jl. Senopati No. 42',city:'Jakarta Selatan',province:'DKI Jakarta',postalCode:'12190',isDefault:true}});
 const featured=await prisma.product.findMany({where:{sku:{in:['APP-001','TEC-001','HOM-001']}},orderBy:{sku:'asc'}});
 for(const product of featured.slice(0,2))await prisma.wishlistItem.upsert({where:{userId_productId:{userId:customerUser.id,productId:product.id}},update:{},create:{userId:customerUser.id,productId:product.id}});
 const cart=await prisma.cart.upsert({where:{userId:customerUser.id},update:{},create:{userId:customerUser.id}});
 if(featured[2])await prisma.cartItem.upsert({where:{cartId_productId:{cartId:cart.id,productId:featured[2].id}},update:{quantity:1},create:{cartId:cart.id,productId:featured[2].id,quantity:1}});
 if(featured[0]&&!await prisma.order.findUnique({where:{userId_idempotencyKey:{userId:customerUser.id,idempotencyKey:'seed-paid-order'}}})){
   const subtotal=featured[0].price*2n,totalAmount=subtotal+25_000n;
   await prisma.order.create({data:{userId:customerUser.id,orderNumber:'SHP-DEMO-PAID',idempotencyKey:'seed-paid-order',subtotal,shippingFee:25_000n,totalAmount,paymentStatus:PaymentStatus.PAID,fulfillmentStatus:FulfillmentStatus.DELIVERED,shippingAddressSnapshot:{recipientName:'Alya Customer',phone:'081234567890',addressLine:'Jl. Senopati No. 42',city:'Jakarta Selatan',province:'DKI Jakarta',postalCode:'12190'},items:{create:{productId:featured[0].id,productName:featured[0].name,productSku:featured[0].sku,unitPrice:featured[0].price,quantity:2,lineTotal:subtotal}},payment:{create:{amount:totalAmount,status:PaymentStatus.PAID,paidAt:new Date('2026-10-10T08:00:00+07:00')}}}});
 }
 if(featured[1]&&!await prisma.order.findUnique({where:{userId_idempotencyKey:{userId:customerUser.id,idempotencyKey:'seed-pending-order'}}})){
   const subtotal=featured[1].price,totalAmount=subtotal+25_000n;
   await prisma.order.create({data:{userId:customerUser.id,orderNumber:'SHP-DEMO-PENDING',idempotencyKey:'seed-pending-order',subtotal,shippingFee:25_000n,totalAmount,shippingAddressSnapshot:{recipientName:'Alya Customer',phone:'081234567890',addressLine:'Jl. Senopati No. 42',city:'Jakarta Selatan',province:'DKI Jakarta',postalCode:'12190'},items:{create:{productId:featured[1].id,productName:featured[1].name,productSku:featured[1].sku,unitPrice:featured[1].price,quantity:1,lineTotal:subtotal}},payment:{create:{amount:totalAmount}}}});
 }
}
main().finally(()=>prisma.$disconnect());
