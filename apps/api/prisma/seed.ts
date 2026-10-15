import { PrismaClient, Role } from '@prisma/client';
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
 await prisma.user.upsert({where:{email:'admin@shopora.test'},update:{},create:{name:'Shopora Admin',email:'admin@shopora.test',passwordHash:password,role:Role.ADMIN}});
 const customerUser=await prisma.user.upsert({where:{email:'customer@shopora.test'},update:{},create:{name:'Alya Customer',email:'customer@shopora.test',passwordHash:customer}});
 for (const name of ['Fashion','Electronics','Home Living','Accessories']) await prisma.category.upsert({where:{name},update:{},create:{name,slug:name.toLowerCase().replaceAll(' ','-')}});
 for (const [name,slug,sku,catName,price,description,imageUrl] of products) { const cat=await prisma.category.findUniqueOrThrow({where:{name:catName}}); await prisma.product.upsert({where:{sku},update:{},create:{name,slug,sku,description,price:BigInt(price),stock:sku==='HOM-001'?4:24,categoryId:cat.id,images:{create:{imageUrl,isPrimary:true}}}}); }
 const categoryRows=await prisma.category.findMany({orderBy:{name:'asc'}});
 const generated=Array.from({length:994},(_,index)=>{const n=index+1,category=categoryRows[index%categoryRows.length];return {name:`Shopora Essential ${String(n).padStart(4,'0')}`,slug:`shopora-essential-${String(n).padStart(4,'0')}`,sku:`SEED-${String(n).padStart(4,'0')}`,description:'A considered everyday essential selected for quality, function, and timeless appeal.',price:BigInt(199000+(index%30)*50000),stock:index%19===0?3:10+(index%40),isActive:true,categoryId:category.id,createdAt:new Date('2025-01-01T00:00:00.000Z'),updatedAt:new Date('2025-01-01T00:00:00.000Z')}});
 await prisma.product.createMany({data:generated,skipDuplicates:true});
 const imagePool=['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'];
 const productsWithoutImages=await prisma.product.findMany({where:{sku:{startsWith:'SEED-'},images:{none:{}}},select:{id:true,sku:true}});
 await prisma.productImage.createMany({data:productsWithoutImages.map((p,index)=>({productId:p.id,imageUrl:imagePool[index%imagePool.length],isPrimary:true}))});
 if(!await prisma.address.findFirst({where:{userId:customerUser.id}}))await prisma.address.create({data:{userId:customerUser.id,recipientName:'Alya Customer',phone:'081234567890',addressLine:'Jl. Senopati No. 42',city:'Jakarta Selatan',province:'DKI Jakarta',postalCode:'12190',isDefault:true}});
}
main().finally(()=>prisma.$disconnect());
