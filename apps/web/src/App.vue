<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { ArrowRight, Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-vue-next';
import { useCart, useSession, useUi, useWishlist } from './stores';
import CartDrawer from './components/CartDrawer.vue';

const session=useSession(),cart=useCart(),wishlist=useWishlist(),ui=useUi(),route=useRoute(),router=useRouter();
const mobileOpen=ref(false),query=ref('');
onMounted(async()=>{await session.load();if(session.user)await Promise.all([cart.load(),wishlist.load()])});
function search(){if(query.value.trim())router.push({path:'/products',query:{search:query.value.trim()}})}
function openBag(){if(session.user&&!cart.cart)cart.load();ui.cartOpen=true}
</script>

<template>
  <template v-if="!route.path.startsWith('/admin')">
    <div class="announcement promo-bar"><span>FLASH SALE</span><p>Weekend Edit · Save up to <b>40%</b> on selected essentials</p><RouterLink to="/products?sort=price_asc">Shop the edit <ArrowRight :size="12"/></RouterLink></div>
    <header class="site-header"><div class="header-inner">
      <button class="icon-button mobile-trigger" aria-label="Open navigation" @click="mobileOpen=true"><Menu/></button>
      <div class="brand-group"><RouterLink to="/" class="brand">SHOPORA</RouterLink><nav><RouterLink to="/">Home</RouterLink><RouterLink to="/products">Shop All</RouterLink><RouterLink to="/products?category=fashion">Apparel</RouterLink><RouterLink to="/products?category=electronics">Tech</RouterLink><RouterLink to="/products?category=home-living">Living</RouterLink></nav></div>
      <div class="header-actions"><form class="header-search" @submit.prevent="search"><Search :size="15"/><input v-model="query" placeholder="Search products..." aria-label="Search products"/></form><RouterLink :to="session.user?'/wishlist':'/login?redirect=/wishlist'" class="wishlist-button" aria-label="Wishlist"><Heart :size="19"/><b v-if="wishlist.count">{{wishlist.count}}</b></RouterLink><RouterLink :to="session.user?'/account':'/login'" class="icon-button" aria-label="Account"><UserRound :size="19"/></RouterLink><button class="bag-button" aria-label="Open shopping bag" @click="openBag"><ShoppingBag :size="16"/><b>{{cart.count}}</b></button></div>
    </div></header>
    <Transition name="fade"><div v-if="mobileOpen" class="mobile-nav"><button class="mobile-overlay" aria-label="Close navigation" @click="mobileOpen=false"></button><aside><header><span class="brand">SHOPORA</span><button class="icon-button" aria-label="Close navigation" @click="mobileOpen=false"><X/></button></header><RouterLink @click="mobileOpen=false" to="/">Home</RouterLink><RouterLink @click="mobileOpen=false" to="/products">Shop All</RouterLink><RouterLink @click="mobileOpen=false" to="/products?category=fashion">Apparel</RouterLink><RouterLink @click="mobileOpen=false" to="/products?category=electronics">Electronics</RouterLink><RouterLink @click="mobileOpen=false" to="/products?category=home-living">Living</RouterLink><RouterLink @click="mobileOpen=false" to="/wishlist">Wishlist</RouterLink><RouterLink @click="mobileOpen=false" to="/account">My Account</RouterLink></aside></div></Transition>
  </template>
  <RouterView/>
  <footer v-if="!route.path.startsWith('/admin')" class="site-footer"><div class="footer-grid"><div><span class="brand">SHOPORA</span><p>Minimalist e-commerce committed to exceptional craftsmanship, modern sustainability, and elevated lifestyle objects.</p></div><div><h4>Navigation</h4><RouterLink to="/products">All Products</RouterLink><RouterLink to="/products?category=fashion">Apparel</RouterLink><RouterLink to="/products?category=electronics">Tech Essentials</RouterLink><RouterLink to="/products?category=home-living">Living Space</RouterLink></div><div><h4>Customer Service</h4><RouterLink to="/account/orders">Order Tracking</RouterLink><RouterLink to="/wishlist">Wishlist</RouterLink><a href="mailto:care@shopora.test">Contact Care</a></div><div><h4>Newsletter</h4><p>Subscribe for exclusive releases and private previews.</p><form class="newsletter" @submit.prevent="ui.toast('Thank you for subscribing')"><input type="email" required placeholder="Enter your email"/><button aria-label="Subscribe"><ArrowRight :size="15"/></button></form></div></div><div class="footer-bottom"><span>© 2026 Shopora Retail Technologies.</span><span>Privacy · Terms · IDR (Rp)</span></div></footer>
  <CartDrawer/>
  <div class="toast-stack"><TransitionGroup name="toast"><div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.type">{{t.message}}</div></TransitionGroup></div>
</template>
