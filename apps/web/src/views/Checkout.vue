<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { UserRound, MapPin, CreditCard, LockKeyhole, Plus } from 'lucide-vue-next';
import { api, assetUrl, idr } from '../api';
import { useCart, useSession, useUi } from '../stores';

type Address={id:string;recipientName:string;phone:string;addressLine:string;city:string;province:string;postalCode:string;isDefault:boolean};
type Preview={subtotal:string;shippingFee:string;discountAmount:string;totalAmount:string};
const cart=useCart(),session=useSession(),ui=useUi(),router=useRouter();
const addresses=ref<Address[]>([]),addressId=ref(''),preview=ref<Preview|null>(null),error=ref(''),loading=ref(true),previewing=ref(false),placing=ref(false),showForm=ref(false);
const form=ref({recipientName:'',phone:'',addressLine:'',city:'',province:'',postalCode:'',isDefault:true});
let idempotencyKey=crypto.randomUUID();

async function loadPreview(){
  if(!addressId.value||!cart.cart?.items.length){preview.value=null;return}
  previewing.value=true;error.value='';
  try{preview.value=await api<Preview>('/checkout/preview',{method:'POST',body:JSON.stringify({addressId:addressId.value})})}
  catch(e:any){error.value=e.message;preview.value=null}
  finally{previewing.value=false}
}
onMounted(async()=>{
  try{
    await cart.load();
    if(!cart.cart?.items.length){await router.replace('/cart');return}
    addresses.value=await api<Address[]>('/addresses');
    addressId.value=addresses.value.find(a=>a.isDefault)?.id??addresses.value[0]?.id??'';
    showForm.value=!addresses.value.length;
    await loadPreview();
  }catch(e:any){error.value=e.message}
  finally{loading.value=false}
});
watch(addressId,loadPreview);
async function saveAddress(){
  error.value='';
  try{
    const address=await api<Address>('/addresses',{method:'POST',body:JSON.stringify(form.value)});
    if(address.isDefault)addresses.value=addresses.value.map(a=>({...a,isDefault:false}));
    addresses.value.push(address);addressId.value=address.id;showForm.value=false;ui.toast('Shipping address saved');
    form.value={recipientName:'',phone:'',addressLine:'',city:'',province:'',postalCode:'',isDefault:false};
  }catch(e:any){error.value=e.message}
}
async function place(){
  if(!preview.value)return;
  placing.value=true;error.value='';
  try{
    const order=await api<any>('/checkout/orders',{method:'POST',body:JSON.stringify({addressId:addressId.value,idempotencyKey})});
    await cart.load();idempotencyKey=crypto.randomUUID();
    await router.push(`/checkout/success/${order.orderNumber}`);
  }catch(e:any){error.value=e.message}
  finally{placing.value=false}
}
</script>

<template>
  <main class="checkout-page"><div class="container">
    <header class="checkout-header"><div><h1>Checkout</h1><p>Complete your shipping and payment details</p></div></header>
    <p v-if="error" class="alert error" role="alert">{{error}}</p>
    <div v-if="loading" class="checkout-grid"><div class="skeleton checkout-skeleton"></div><div class="skeleton checkout-skeleton"></div></div>
    <div v-else class="checkout-grid">
      <div class="checkout-forms">
        <section class="surface checkout-card"><h2><UserRound :size="17"/> 1. Contact Information</h2><div class="field-grid"><label>Full Name<input :value="session.user?.name" disabled/></label><label>Email Address<input :value="session.user?.email" disabled/></label></div></section>
        <section class="surface checkout-card">
          <div class="card-heading"><h2><MapPin :size="17"/> 2. Shipping Address</h2><button v-if="addresses.length" @click="showForm=!showForm"><Plus :size="14"/> Add new</button></div>
          <div v-if="addresses.length&&!showForm" class="address-options"><label v-for="a in addresses" :key="a.id" :class="{selected:addressId===a.id}"><input v-model="addressId" type="radio" :value="a.id"/><span><b>{{a.recipientName}}</b><small>{{a.addressLine}}, {{a.city}}, {{a.province}} {{a.postalCode}}</small><small>{{a.phone}}</small></span><em v-if="a.isDefault">Default</em></label></div>
          <form v-if="showForm" class="field-grid" @submit.prevent="saveAddress"><label>Recipient Name<input v-model="form.recipientName" autocomplete="name" required minlength="2"/></label><label>Phone Number<input v-model="form.phone" autocomplete="tel" inputmode="tel" required minlength="8"/></label><label class="full">Street Address<input v-model="form.addressLine" autocomplete="street-address" required minlength="8"/></label><label>City<input v-model="form.city" autocomplete="address-level2" required minlength="2"/></label><label>Province<input v-model="form.province" autocomplete="address-level1" required minlength="2"/></label><label>Postal Code<input v-model="form.postalCode" autocomplete="postal-code" required minlength="4"/></label><label class="check"><input v-model="form.isDefault" type="checkbox"/> Set as default address</label><div class="form-actions"><button v-if="addresses.length" type="button" class="btn-secondary" @click="showForm=false">Cancel</button><button class="btn-primary">Save Address</button></div></form>
        </section>
        <section class="surface checkout-card"><h2><CreditCard :size="17"/> 3. Payment Method</h2><label class="payment-option selected"><input type="radio" checked/><span><b>Demo Secure Payment</b><small>Simulate success or failure after placing your order.</small></span></label></section>
      </div>
      <aside class="surface order-summary"><h2>Order Summary</h2><article v-for="item in cart.cart?.items" :key="item.id"><img :src="assetUrl(item.product.images[0]?.imageUrl)" :alt="item.product.name"/><div><b>{{item.product.name}}</b><small>Qty: {{item.quantity}}</small></div><strong>{{idr(Number(item.product.price)*item.quantity)}}</strong></article><div v-if="previewing" class="summary-loading">Validating price and stock…</div><div v-else class="summary-lines"><p><span>Subtotal</span><b>{{idr(preview?.subtotal??0)}}</b></p><p><span>Shipping</span><b>{{idr(preview?.shippingFee??0)}}</b></p><p><span>Discount</span><b>− {{idr(preview?.discountAmount??0)}}</b></p><p class="grand"><span>Total</span><strong>{{idr(preview?.totalAmount??0)}}</strong></p></div><button class="btn-primary wide" :disabled="!preview||previewing||placing" @click="place"><LockKeyhole :size="15"/> {{placing?'Processing…':'Place Order'}}</button><small class="secure-note">Prices and stock are validated securely by the server.</small></aside>
    </div>
  </div></main>
</template>
