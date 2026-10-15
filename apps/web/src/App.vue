<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { RouterLink, RouterView, useRoute } from 'vue-router'; import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-vue-next'; import { useCart, useSession } from './stores';
const session=useSession(),cart=useCart(),route=useRoute(),open=ref(false); onMounted(async()=>{await session.load();if(session.user)await cart.load()});
</script>
<template>
 <template v-if="!route.path.startsWith('/admin')">
  <div class="announcement">Complimentary express shipping on all orders above <b>Rp 1.500.000</b><RouterLink to="/admin">Admin portal →</RouterLink></div>
  <header class="nav"><button class="mobile-only icon" @click="open=true"><Menu/></button><RouterLink to="/" class="brand">SHOPORA</RouterLink><nav><RouterLink to="/">Home</RouterLink><RouterLink to="/products">Shop all</RouterLink><RouterLink to="/products?category=fashion">Apparel</RouterLink><RouterLink to="/products?category=electronics">Tech</RouterLink><RouterLink to="/products?category=home-living">Living</RouterLink></nav><div class="nav-actions"><RouterLink to="/products" class="icon"><Search/></RouterLink><RouterLink :to="session.user?'/account':'/login'" class="icon"><UserRound/></RouterLink><RouterLink to="/cart" class="bag"><ShoppingBag/><span>{{cart.count}}</span></RouterLink></div></header>
  <aside class="mobile-menu" :class="{visible:open}"><button class="icon close" @click="open=false"><X/></button><RouterLink @click="open=false" to="/">Home</RouterLink><RouterLink @click="open=false" to="/products">Shop all</RouterLink><RouterLink @click="open=false" to="/products?category=fashion">Apparel</RouterLink><RouterLink @click="open=false" to="/products?category=electronics">Tech</RouterLink><RouterLink @click="open=false" to="/account">My account</RouterLink></aside>
 </template>
 <RouterView />
 <footer v-if="!route.path.startsWith('/admin')"><span class="brand">SHOPORA</span><p>Thoughtfully selected essentials for a considered life.</p><small>© 2026 Shopora Retail Technologies.</small></footer>
</template>
