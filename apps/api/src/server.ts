import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import argon2 from 'argon2';
import { PrismaClient, Prisma, Role, PaymentStatus, FulfillmentStatus } from '@prisma/client';
import { z } from 'zod';
import { calculateOrderTotals, canTransitionFulfillment } from './domain.js';

const prisma = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 3000);
const origin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';
const cookieName = process.env.SESSION_COOKIE_NAME ?? 'shopora_session';
const csrfCookieName = 'shopora_csrf';
const oneWeek = 1000 * 60 * 60 * 24 * 7;
const uploadsPath = path.resolve('uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.set('trust proxy', 1);
app.use((req, res, next) => { req.requestId = String(req.headers['x-request-id'] ?? crypto.randomUUID()); res.setHeader('X-Request-Id', req.requestId); res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('X-Frame-Options','DENY'); res.setHeader('Referrer-Policy','strict-origin-when-cross-origin'); res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()'); console.info(JSON.stringify({requestId:req.requestId,method:req.method,path:req.path})); next(); });
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use((req,res,next)=>{if(['POST','PATCH','PUT','DELETE'].includes(req.method)){const requestOrigin=req.headers.origin;if(requestOrigin&&requestOrigin!==origin)return fail(res,403,'ORIGIN_REJECTED','Request origin is not allowed');const csrfCookie=req.cookies[csrfCookieName];if(req.cookies[cookieName]&&(!csrfCookie||req.headers['x-csrf-token']!==csrfCookie))return fail(res,403,'CSRF_INVALID','CSRF token is invalid');}next();});
app.use('/uploads', express.static(uploadsPath,{fallthrough:false,maxAge:'7d'}));

type AuthRequest = Request & { user?: { id: string; name: string; email: string; role: Role } };
const respond = (res: Response, data: unknown, status = 200, message = 'Operation completed') => res.status(status).json({ success: true, data, message });
const fail = (res: Response, status: number, code: string, message: string, details: unknown[] = []) => res.status(status).json({ success: false, error: { code, message, details } });
const serialize = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v));
const asyncRoute = (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>) => (req: AuthRequest, res: Response, next: NextFunction) => fn(req,res,next).catch(next);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const hashToken = (token:string) => crypto.createHash('sha256').update(token).digest('hex');
const routeParam = (req: Request, key: string) => String(req.params[key] ?? '');

async function createSession(userId: string, res: Response) {
  const token = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(24).toString('hex');
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + oneWeek) } });
  res.cookie(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: oneWeek, path: '/' });
  res.cookie(csrfCookieName, csrf, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: oneWeek, path: '/' });
}
const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.cookies[cookieName]; if (!token) return fail(res,401,'UNAUTHENTICATED','Please sign in first');
  const session = await prisma.session.findFirst({ where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!session) return fail(res,401,'UNAUTHENTICATED','Session is invalid or expired');
  req.user = session!.user; next();
});
const requireAdmin = [requireAuth, (req: AuthRequest, res: Response, next: NextFunction) => req.user?.role === Role.ADMIN ? next() : fail(res,403,'FORBIDDEN','Administrator access is required')];
const validate = <T extends z.ZodTypeAny>(schema: T) => (req: AuthRequest, res: Response, next: NextFunction) => { const parsed=schema.safeParse(req.body); if(!parsed.success) return fail(res,400,'VALIDATION_ERROR','Invalid input',parsed.error.issues); req.body=parsed.data; next(); };
const id = z.string().uuid(); const money = z.coerce.number().int().min(0);
const productInput = z.object({ name:z.string().min(2).max(255), categoryId:id, sku:z.string().min(2).max(100), description:z.string().min(10), price:money, stock:z.coerce.number().int().min(0), isActive:z.boolean().optional(), imageUrl:z.string().url().optional() });

app.get('/health', (_,res) => respond(res,{status:'ok'}));
const api = express.Router(); app.use('/api/v1',api);
api.post('/auth/register', validate(z.object({name:z.string().min(2).max(150),email:z.string().email(),password:z.string().min(8).max(128)})), asyncRoute(async(req,res)=> {
  const {name,email,password}=req.body; const exists=await prisma.user.findUnique({where:{email}}); if(exists) return fail(res,409,'EMAIL_EXISTS','Email is already registered');
  const user=await prisma.user.create({data:{name,email,passwordHash:await argon2.hash(password,{type:argon2.argon2id})}}); await createSession(user.id,res); return respond(res,{id:user.id,name:user.name,email:user.email,role:user.role},201,'Account created');
}));
api.post('/auth/login', rateLimit({windowMs:15*60*1000,max:10,standardHeaders:true,legacyHeaders:false}), validate(z.object({email:z.string().email(),password:z.string().min(1)})), asyncRoute(async(req,res)=>{
 const user=await prisma.user.findUnique({where:{email:req.body.email}}); if(!user || !await argon2.verify(user.passwordHash,req.body.password)) return fail(res,401,'INVALID_CREDENTIALS','Email or password is incorrect'); await createSession(user.id,res); return respond(res,{id:user.id,name:user.name,email:user.email,role:user.role},200,'Signed in');
}));
api.post('/auth/logout', requireAuth, asyncRoute(async(req,res)=>{ const token=req.cookies[cookieName]; await prisma.session.deleteMany({where:{tokenHash:hashToken(token)}}); res.clearCookie(cookieName,{path:'/'}); res.clearCookie(csrfCookieName,{path:'/'}); return respond(res,{},200,'Signed out'); }));
api.get('/auth/me',requireAuth,(req,res)=>respond(res,req.user));
api.patch('/auth/me',requireAuth,validate(z.object({name:z.string().min(2).max(150)})),asyncRoute(async(req,res)=>respond(res,await prisma.user.update({where:{id:req.user!.id},data:req.body,select:{id:true,name:true,email:true,role:true}}))));

api.get('/categories',asyncRoute(async(_,res)=>respond(res,await prisma.category.findMany({where:{isActive:true},orderBy:{name:'asc'}}))));
api.get('/products',asyncRoute(async(req,res)=>{ const q=z.object({search:z.string().optional(),category:z.string().optional(),minPrice:z.coerce.number().int().min(0).optional(),maxPrice:z.coerce.number().int().min(0).optional(),inStock:z.enum(['true','false']).optional(),sort:z.enum(['newest','price_asc','price_desc','name']).default('newest'),page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(48).default(12)}).parse(req.query); const where={isActive:true,...(q.category?{category:{slug:q.category}}:{}),...(q.search?{OR:[{name:{contains:q.search}},{description:{contains:q.search}}]}:{}),...(q.inStock==='true'?{stock:{gt:0}}:{}),...((q.minPrice!==undefined||q.maxPrice!==undefined)?{price:{...(q.minPrice!==undefined?{gte:BigInt(q.minPrice)}:{}),...(q.maxPrice!==undefined?{lte:BigInt(q.maxPrice)}:{})}}:{})}; const orderBy=q.sort==='price_asc'?{price:'asc' as const}:q.sort==='price_desc'?{price:'desc' as const}:q.sort==='name'?{name:'asc' as const}:{createdAt:'desc' as const}; const [items,total]=await prisma.$transaction([prisma.product.findMany({where,include:{category:true,images:true},orderBy,skip:(q.page-1)*q.limit,take:q.limit}),prisma.product.count({where})]); return respond(res,serialize({items,total,page:q.page,pages:Math.ceil(total/q.limit)})); }));
api.get('/products/:slug',asyncRoute(async(req,res)=>{const product=await prisma.product.findFirst({where:{slug:routeParam(req,'slug'),isActive:true},include:{category:true,images:true}}); return product?respond(res,serialize(product)):fail(res,404,'PRODUCT_NOT_FOUND','Product was not found');}));

const cartInclude=Prisma.validator<Prisma.CartInclude>()({items:{include:{product:{include:{images:true,category:true}}}}});
type CartWithItems=Prisma.CartGetPayload<{include:typeof cartInclude}>;
async function getCart(userId:string):Promise<CartWithItems>{const cart=await prisma.cart.findUnique({where:{userId},include:cartInclude});if(cart)return cart;return prisma.cart.create({data:{userId},include:cartInclude});}
api.get('/cart',requireAuth,asyncRoute(async(req,res)=>respond(res,serialize(await getCart(req.user!.id)))));
api.post('/cart/items',requireAuth,validate(z.object({productId:id,quantity:z.coerce.number().int().min(1)})),asyncRoute(async(req,res)=>{const p=await prisma.product.findFirst({where:{id:req.body.productId,isActive:true}});if(!p)return fail(res,404,'PRODUCT_NOT_FOUND','Product unavailable');const cart=await getCart(req.user!.id);const item=cart.items.find(i=>i.productId===p.id);if((item?.quantity??0)+req.body.quantity>p.stock)return fail(res,422,'INSUFFICIENT_STOCK','Requested quantity exceeds available stock');await prisma.cartItem.upsert({where:{cartId_productId:{cartId:cart.id,productId:p.id}},update:{quantity:{increment:req.body.quantity}},create:{cartId:cart.id,productId:p.id,quantity:req.body.quantity}});return respond(res,serialize(await getCart(req.user!.id)),201,'Added to cart');}));
api.patch('/cart/items/:id',requireAuth,validate(z.object({quantity:z.coerce.number().int().min(1)})),asyncRoute(async(req,res)=>{const cart=await getCart(req.user!.id);const item=await prisma.cartItem.findFirst({where:{id:routeParam(req,'id'),cartId:cart.id},include:{product:true}});if(!item)return fail(res,404,'CART_ITEM_NOT_FOUND','Cart item was not found');if(req.body.quantity>item.product.stock)return fail(res,422,'INSUFFICIENT_STOCK','Requested quantity exceeds available stock');await prisma.cartItem.update({where:{id:item.id},data:req.body});return respond(res,serialize(await getCart(req.user!.id)));}));
api.delete('/cart/items/:id',requireAuth,asyncRoute(async(req,res)=>{const cart=await getCart(req.user!.id);const result=await prisma.cartItem.deleteMany({where:{id:routeParam(req,'id'),cartId:cart.id}});return result.count?respond(res,{}):fail(res,404,'CART_ITEM_NOT_FOUND','Cart item was not found');}));

const addressInput=z.object({recipientName:z.string().min(2),phone:z.string().min(8).max(30),addressLine:z.string().min(8),city:z.string().min(2),province:z.string().min(2),postalCode:z.string().min(4).max(20),isDefault:z.boolean().default(false)});
api.get('/addresses',requireAuth,asyncRoute(async(req,res)=>respond(res,await prisma.address.findMany({where:{userId:req.user!.id},orderBy:{isDefault:'desc'}}))));
api.post('/addresses',requireAuth,validate(addressInput),asyncRoute(async(req,res)=>{const data=req.body;if(data.isDefault)await prisma.address.updateMany({where:{userId:req.user!.id},data:{isDefault:false}});return respond(res,await prisma.address.create({data:{...data,userId:req.user!.id}}),201);}));
api.patch('/addresses/:id',requireAuth,validate(addressInput.partial()),asyncRoute(async(req,res)=>{const addressId=routeParam(req,'id');if(req.body.isDefault)await prisma.address.updateMany({where:{userId:req.user!.id},data:{isDefault:false}});const r=await prisma.address.updateMany({where:{id:addressId,userId:req.user!.id},data:req.body});return r.count?respond(res,await prisma.address.findUnique({where:{id:addressId}})):fail(res,404,'ADDRESS_NOT_FOUND','Address was not found');}));
api.delete('/addresses/:id',requireAuth,asyncRoute(async(req,res)=>{const r=await prisma.address.deleteMany({where:{id:routeParam(req,'id'),userId:req.user!.id}});return r.count?respond(res,{}):fail(res,404,'ADDRESS_NOT_FOUND','Address was not found');}));

async function checkoutPreview(userId:string,addressId:string){const [cart,address]=await Promise.all([getCart(userId),prisma.address.findFirst({where:{id:addressId,userId}})]);if(!address)throw Object.assign(new Error('ADDRESS_NOT_FOUND'),{status:404});if(!cart.items.length)throw Object.assign(new Error('EMPTY_CART'),{status:422});const totals=calculateOrderTotals(cart.items.map(i=>({price:i.product.price,quantity:i.quantity})));return {cart,address,...totals};}
api.post('/checkout/preview',requireAuth,validate(z.object({addressId:id})),asyncRoute(async(req,res)=>{try{return respond(res,serialize(await checkoutPreview(req.user!.id,req.body.addressId)));}catch(e:any){return fail(res,e.status??422,e.message,e.message==='EMPTY_CART'?'Cart is empty':'Address was not found');}}));
api.post('/checkout/orders',requireAuth,validate(z.object({addressId:id,idempotencyKey:z.string().min(12).max(150)})),asyncRoute(async(req,res)=>{try{const order=await prisma.$transaction(async tx=>{const existing=await tx.order.findUnique({where:{userId_idempotencyKey:{userId:req.user!.id,idempotencyKey:req.body.idempotencyKey}}});if(existing)return existing;const cart=await tx.cart.findUnique({where:{userId:req.user!.id},include:cartInclude});const address=await tx.address.findFirst({where:{id:req.body.addressId,userId:req.user!.id}});if(!cart?.items.length||!address)throw new Error(!address?'ADDRESS_NOT_FOUND':'EMPTY_CART');let subtotal=0n;for(const item of cart.items){const change=await tx.product.updateMany({where:{id:item.productId,isActive:true,stock:{gte:item.quantity}},data:{stock:{decrement:item.quantity}}});if(!change.count)throw new Error('INSUFFICIENT_STOCK');subtotal+=item.product.price*BigInt(item.quantity);}const snapshot={recipientName:address.recipientName,phone:address.phone,addressLine:address.addressLine,city:address.city,province:address.province,postalCode:address.postalCode};const order=await tx.order.create({data:{userId:req.user!.id,orderNumber:`SHP-${Date.now().toString().slice(-8)}-${crypto.randomInt(100,999)}`,idempotencyKey:req.body.idempotencyKey,subtotal,shippingFee:25000n,totalAmount:subtotal+25000n,shippingAddressSnapshot:snapshot,items:{create:cart.items.map(i=>({productId:i.productId,productName:i.product.name,productSku:i.product.sku,unitPrice:i.product.price,quantity:i.quantity,lineTotal:i.product.price*BigInt(i.quantity)}))},payment:{create:{amount:subtotal+25000n}}}});await tx.cartItem.deleteMany({where:{cartId:cart.id}});return order;});return respond(res,serialize(order),201,'Order created');}catch(e:any){return fail(res,e.message==='INSUFFICIENT_STOCK'?422:400,e.message,e.message.replaceAll('_',' ').toLowerCase());}}));

api.get('/orders',requireAuth,asyncRoute(async(req,res)=>respond(res,serialize(await prisma.order.findMany({where:{userId:req.user!.id},include:{items:true,payment:true},orderBy:{createdAt:'desc'}})))));
api.get('/orders/:id',requireAuth,asyncRoute(async(req,res)=>{const o=await prisma.order.findFirst({where:{id:routeParam(req,'id'),userId:req.user!.id},include:{items:true,payment:true}});return o?respond(res,serialize(o)):fail(res,404,'ORDER_NOT_FOUND','Order was not found');}));
api.post('/orders/:id/cancel',requireAuth,asyncRoute(async(req,res)=>{const o=await prisma.order.findFirst({where:{id:routeParam(req,'id'),userId:req.user!.id},include:{items:true}});if(!o)return fail(res,404,'ORDER_NOT_FOUND','Order was not found');if(o.fulfillmentStatus===FulfillmentStatus.CANCELED)return respond(res,serialize(o),200,'Order already canceled');if(o.paymentStatus!==PaymentStatus.PENDING)return fail(res,422,'ORDER_NOT_CANCELLABLE','Only unpaid orders can be canceled');const result=await prisma.$transaction(async tx=>{for(const i of o.items)await tx.product.update({where:{id:i.productId},data:{stock:{increment:i.quantity}}});return tx.order.update({where:{id:o.id},data:{paymentStatus:PaymentStatus.CANCELED,fulfillmentStatus:FulfillmentStatus.CANCELED,payment:{update:{status:PaymentStatus.CANCELED}}}});});return respond(res,serialize(result),200,'Order canceled');}));
api.post('/demo/payments/:orderId/:result',requireAuth,asyncRoute(async(req,res)=>{if(process.env.DEMO_MODE==='false')return fail(res,404,'NOT_FOUND','Demo payments disabled');const order=await prisma.order.findFirst({where:{id:routeParam(req,'orderId'),userId:req.user!.id},include:{items:true}});if(!order)return fail(res,404,'ORDER_NOT_FOUND','Order was not found');const paid=routeParam(req,'result')==='succeed';if(!paid && order.paymentStatus===PaymentStatus.PENDING)await prisma.$transaction(async tx=>{for(const i of order.items)await tx.product.update({where:{id:i.productId},data:{stock:{increment:i.quantity}}});await tx.order.update({where:{id:order.id},data:{paymentStatus:PaymentStatus.FAILED,fulfillmentStatus:FulfillmentStatus.CANCELED,payment:{update:{status:PaymentStatus.FAILED}}}});});else if(paid&&order.paymentStatus===PaymentStatus.PENDING)await prisma.order.update({where:{id:order.id},data:{paymentStatus:PaymentStatus.PAID,payment:{update:{status:PaymentStatus.PAID,paidAt:new Date()}}}});return respond(res,{}); }));

api.get('/admin/dashboard/overview',...requireAdmin,asyncRoute(async(_,res)=>{const [totalOrders,paid,active,pending,lowStock,recent]=await prisma.$transaction([prisma.order.count(),prisma.order.aggregate({where:{paymentStatus:PaymentStatus.PAID},_sum:{totalAmount:true}}),prisma.product.count({where:{isActive:true}}),prisma.order.count({where:{fulfillmentStatus:FulfillmentStatus.PENDING}}),prisma.product.findMany({where:{isActive:true,stock:{lte:5}},take:5,orderBy:{stock:'asc'}}),prisma.order.findMany({take:5,orderBy:{createdAt:'desc'},include:{user:{select:{name:true,email:true}}}})]);respond(res,serialize({totalOrders,paidRevenue:paid._sum.totalAmount??0n,activeProducts:active,pendingOrders:pending,lowStock,recentOrders:recent}));}));
api.get('/admin/dashboard/sales',...requireAdmin,asyncRoute(async(_,res)=>respond(res,serialize(await prisma.order.groupBy({by:['createdAt'],where:{paymentStatus:PaymentStatus.PAID},_sum:{totalAmount:true}})))));
api.get('/admin/products',...requireAdmin,asyncRoute(async(_,res)=>respond(res,serialize(await prisma.product.findMany({include:{category:true,images:true},orderBy:{createdAt:'desc'}})))));
api.post('/admin/products',...requireAdmin,validate(productInput),asyncRoute(async(req,res)=>{const {imageUrl,...data}=req.body;const product=await prisma.product.create({data:{...data,slug:`${slugify(data.name)}-${crypto.randomBytes(2).toString('hex')}`,price:BigInt(data.price),images:imageUrl?{create:{imageUrl,isPrimary:true}}:undefined}});respond(res,serialize(product),201);}));
api.get('/admin/products/:id',...requireAdmin,asyncRoute(async(req,res)=>{const p=await prisma.product.findUnique({where:{id:routeParam(req,'id')},include:{images:true,category:true}});return p?respond(res,serialize(p)):fail(res,404,'PRODUCT_NOT_FOUND','Product was not found');}));
api.patch('/admin/products/:id', ...requireAdmin, validate(productInput.partial()), asyncRoute(async (req, res) => {
  const { imageUrl, ...data } = req.body;
  const productId = routeParam(req,'id');
  const result = await prisma.product.updateMany({ where: { id: productId }, data: { ...data, ...(data.price !== undefined ? { price: BigInt(data.price) } : {}) } });
  if (!result.count) return fail(res, 404, 'PRODUCT_NOT_FOUND', 'Product was not found');
  if (imageUrl) {
    const updated = await prisma.productImage.updateMany({ where: { productId, isPrimary: true }, data: { imageUrl } });
    if (!updated.count) await prisma.productImage.create({ data: { productId, imageUrl, isPrimary: true } });
  }
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { images: true, category: true } });
  return respond(res, serialize(product));
}));
api.delete('/admin/products/:id',...requireAdmin,asyncRoute(async(req,res)=>{const r=await prisma.product.updateMany({where:{id:routeParam(req,'id')},data:{isActive:false}});return r.count?respond(res,{},200,'Product archived'):fail(res,404,'PRODUCT_NOT_FOUND','Product was not found');}));
api.get('/admin/categories',...requireAdmin,asyncRoute(async(_,res)=>respond(res,await prisma.category.findMany({include:{_count:{select:{products:true}}},orderBy:{name:'asc'}}))));
api.post('/admin/categories',...requireAdmin,validate(z.object({name:z.string().min(2).max(150)})),asyncRoute(async(req,res)=>respond(res,await prisma.category.create({data:{name:req.body.name,slug:slugify(req.body.name)}}),201)));
api.patch('/admin/categories/:id',...requireAdmin,validate(z.object({name:z.string().min(2).max(150),isActive:z.boolean().optional()})),asyncRoute(async(req,res)=>respond(res,await prisma.category.update({where:{id:routeParam(req,'id')},data:{...req.body,slug:slugify(req.body.name)}}))));
api.delete('/admin/categories/:id',...requireAdmin,asyncRoute(async(req,res)=>{const r=await prisma.category.updateMany({where:{id:routeParam(req,'id')},data:{isActive:false}});return r.count?respond(res,{},200,'Category archived'):fail(res,404,'CATEGORY_NOT_FOUND','Category was not found');}));
api.get('/admin/orders',...requireAdmin,asyncRoute(async(_,res)=>respond(res,serialize(await prisma.order.findMany({include:{user:{select:{name:true,email:true}},items:true},orderBy:{createdAt:'desc'}})))));
api.get('/admin/orders/:id',...requireAdmin,asyncRoute(async(req,res)=>{const o=await prisma.order.findUnique({where:{id:routeParam(req,'id')},include:{user:{select:{name:true,email:true}},items:true,payment:true}});return o?respond(res,serialize(o)):fail(res,404,'ORDER_NOT_FOUND','Order was not found');}));
api.patch('/admin/orders/:id/fulfillment',...requireAdmin,validate(z.object({status:z.nativeEnum(FulfillmentStatus)})),asyncRoute(async(req,res)=>{const o=await prisma.order.findUnique({where:{id:routeParam(req,'id')}});if(!o)return fail(res,404,'ORDER_NOT_FOUND','Order was not found');if(o.paymentStatus!==PaymentStatus.PAID||!canTransitionFulfillment(o.fulfillmentStatus,req.body.status))return fail(res,422,'INVALID_STATUS_TRANSITION','This fulfillment status transition is not allowed');return respond(res,serialize(await prisma.order.update({where:{id:o.id},data:{fulfillmentStatus:req.body.status}})));}));
const upload=multer({storage:multer.diskStorage({destination:uploadsPath,filename:(_,file,cb)=>cb(null,`${crypto.randomUUID()}${path.extname(file.originalname)}`)}),limits:{fileSize:5*1024*1024},fileFilter:(_,file,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype))});
api.post('/admin/uploads/products',...requireAdmin,upload.single('image'),(req,res)=>req.file?respond(res,{url:`/uploads/${req.file.filename}`,mimeType:req.file.mimetype,size:req.file.size},201):fail(res,400,'INVALID_FILE','Upload a JPEG, PNG, or WebP image under 5MB'));
app.use((_:Request,res:Response)=>fail(res,404,'NOT_FOUND','Route not found'));
app.use((error:any,_:Request,res:Response,_next:NextFunction)=>{console.error(error);if(error instanceof z.ZodError)return fail(res,400,'VALIDATION_ERROR','Invalid input',error.issues);if(error.code==='P2002')return fail(res,409,'DUPLICATE_VALUE','A unique value already exists');return fail(res,500,'INTERNAL_ERROR','An unexpected server error occurred');});
if(process.env.NODE_ENV!=='test') app.listen(port,()=>console.log(`Shopora API on http://localhost:${port}`));
export { app, prisma };
