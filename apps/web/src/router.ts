import { createRouter, createWebHistory } from 'vue-router';
import Storefront from './views/Storefront.vue';
import ProductList from './views/ProductList.vue';
import ProductDetail from './views/ProductDetail.vue';
import Auth from './views/Auth.vue';
import Cart from './views/Cart.vue';
import Checkout from './views/Checkout.vue';
import Account from './views/Account.vue';
import OrderDetail from './views/OrderDetail.vue';
import OrderSuccess from './views/OrderSuccess.vue';
import Admin from './views/Admin.vue';
import NotFound from './views/NotFound.vue';
import Wishlist from './views/Wishlist.vue';
import AdminLogin from './views/AdminLogin.vue';
import { useSession } from './stores';

const router = createRouter({
  history:createWebHistory(),
  scrollBehavior:()=>({top:0}),
  routes:[
    {path:'/',component:Storefront},
    {path:'/products',component:ProductList},
    {path:'/products/:slug',component:ProductDetail},
    {path:'/login',component:Auth,props:{mode:'login'},meta:{guest:true}},
    {path:'/register',component:Auth,props:{mode:'register'},meta:{guest:true}},
    {path:'/cart',component:Cart,meta:{requiresAuth:true}},
    {path:'/wishlist',component:Wishlist,meta:{requiresAuth:true}},
    {path:'/checkout',component:Checkout,meta:{requiresAuth:true}},
    {path:'/checkout/success/:orderNumber',component:OrderSuccess,meta:{requiresAuth:true}},
    {path:'/account',redirect:'/account/orders',meta:{requiresAuth:true}},
    {path:'/account/orders',component:Account,props:{tab:'orders'},meta:{requiresAuth:true}},
    {path:'/account/orders/:id',component:OrderDetail,meta:{requiresAuth:true}},
    {path:'/account/addresses',component:Account,props:{tab:'addresses'},meta:{requiresAuth:true}},
    {path:'/account/profile',component:Account,props:{tab:'profile'},meta:{requiresAuth:true}},
    {path:'/admin/login',component:AdminLogin},
    {path:'/admin',component:Admin,props:{section:'overview'},meta:{requiresAdmin:true}},
    {path:'/admin/products',component:Admin,props:{section:'products'},meta:{requiresAdmin:true}},
    {path:'/admin/products/new',component:Admin,props:{section:'product-form'},meta:{requiresAdmin:true}},
    {path:'/admin/products/:id/edit',component:Admin,props:{section:'product-form'},meta:{requiresAdmin:true}},
    {path:'/admin/categories',component:Admin,props:{section:'categories'},meta:{requiresAdmin:true}},
    {path:'/admin/orders',component:Admin,props:{section:'orders'},meta:{requiresAdmin:true}},
    {path:'/admin/orders/:id',component:Admin,props:{section:'order-detail'},meta:{requiresAdmin:true}},
    {path:'/:pathMatch(.*)*',component:NotFound}
  ]
});

router.beforeEach(async to => {
  const session = useSession();
  await session.load();
  if (to.meta.guest && session.user) return session.user.role === 'ADMIN' ? '/admin' : '/';
  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !session.user) {
    return {path:to.meta.requiresAdmin?'/admin/login':'/login',query:{redirect:to.fullPath}};
  }
  if (to.meta.requiresAdmin && session.user?.role !== 'ADMIN') return '/';
});

export default router;
