<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { Heart, ShoppingBag, Eye } from 'lucide-vue-next';
import type { Product } from '../stores';
import { useSession, useUi, useWishlist } from '../stores';
import { assetUrl, idr } from '../api';

const props=defineProps<{product:Product}>();
defineEmits<{add:[id:string]}>();
const session=useSession(),wishlist=useWishlist(),ui=useUi(),router=useRouter();
async function toggleWishlist(){
  if(!session.user){await router.push({path:'/login',query:{redirect:router.currentRoute.value.fullPath}});return}
  try{const added=await wishlist.toggle(props.product.id);ui.toast(added?'Saved to wishlist':'Removed from wishlist')}
  catch(e:any){ui.toast(e.message,'error')}
}
</script>

<template>
  <article class="product-card">
    <div class="product-media">
      <RouterLink :to="`/products/${product.slug}`"><img :src="assetUrl(product.images[0]?.imageUrl)" :alt="product.name"/><span v-if="product.stock<1" class="product-badge sold">Sold Out</span><span v-else-if="product.stock<=5" class="product-badge">Low Stock</span></RouterLink>
      <div class="product-actions"><button :class="{saved:wishlist.has(product.id)}" :aria-label="wishlist.has(product.id)?'Remove from wishlist':'Add to wishlist'" @click="toggleWishlist"><Heart :size="16" :fill="wishlist.has(product.id)?'currentColor':'none'"/></button><RouterLink :to="`/products/${product.slug}`" aria-label="View product"><Eye :size="16"/></RouterLink><button :disabled="!product.stock" aria-label="Add to bag" @click="$emit('add',product.id)"><ShoppingBag :size="16"/></button></div>
    </div>
    <div class="product-info"><small>{{product.category.name}}</small><RouterLink :to="`/products/${product.slug}`">{{product.name}}</RouterLink><div><b>{{idr(product.price)}}</b><span>{{product.stock ? `${product.stock} in stock` : 'Unavailable'}}</span></div></div>
  </article>
</template>
