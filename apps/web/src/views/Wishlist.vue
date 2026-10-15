<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Heart } from 'lucide-vue-next';
import ProductCard from '../components/ProductCard.vue';
import { useCart, useUi, useWishlist } from '../stores';

const wishlist=useWishlist(),cart=useCart(),ui=useUi(),loading=ref(true),error=ref('');
onMounted(async()=>{try{await wishlist.load()}catch(e:any){error.value=e.message}finally{loading.value=false}});
async function add(productId:string){try{await cart.add(productId);ui.toast('Added to your shopping bag');ui.cartOpen=true}catch(e:any){ui.toast(e.message,'error')}}
</script>

<template>
  <main class="catalog-page wishlist-page"><div class="container">
    <header class="catalog-header"><div><small>YOUR CURATION</small><h1>Wishlist</h1><p>{{wishlist.count}} saved {{wishlist.count===1?'item':'items'}}</p></div></header>
    <p v-if="error" class="alert error" role="alert">{{error}}</p>
    <div v-if="loading" class="product-grid"><div v-for="i in 4" :key="i" class="skeleton product-skeleton"></div></div>
    <div v-else-if="wishlist.items.length" class="product-grid"><ProductCard v-for="item in wishlist.items" :key="item.id" :product="item.product" @add="add"/></div>
    <div v-else class="empty-state"><Heart :size="48"/><h3>Your wishlist is empty</h3><p>Save considered pieces and return to them anytime.</p><RouterLink class="btn-primary" to="/products">Explore Collection</RouterLink></div>
  </div></main>
</template>
