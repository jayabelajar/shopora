<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-vue-next';
import { api } from '../api';
import { useSession, useCart, type User } from '../stores';

const props = defineProps<{mode:'login'|'register'}>();
const router = useRouter();
const route = useRoute();
const session = useSession();
const cart = useCart();
const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');
const loading = ref(false);
const isLogin = computed(() => props.mode === 'login');

watch(() => props.mode, () => { error.value=''; password.value=''; });

async function submit(){
  loading.value=true;
  error.value='';
  try{
    const body=isLogin.value?{email:email.value.trim().toLowerCase(),password:password.value}:{name:name.value.trim(),email:email.value.trim().toLowerCase(),password:password.value};
    session.user=await api<User>(`/auth/${isLogin.value?'login':'register'}`,{method:'POST',body:JSON.stringify(body)});
    session.ready=true;
    await cart.load();
    const redirect=typeof route.query.redirect==='string'&&route.query.redirect.startsWith('/')?route.query.redirect:'';
    await router.replace(redirect||(session.user.role==='ADMIN'?'/admin':'/'));
  }catch(e:any){error.value=e.message}
  finally{loading.value=false}
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-visual" aria-hidden="true">
      <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85" alt="" />
      <div><small>THE SHOPORA EDIT</small><h2>Considered essentials,<br/>made for everyday life.</h2><p>Premium objects. Quiet design. Lasting quality.</p></div>
    </section>
    <section class="auth-panel">
      <RouterLink to="/" class="auth-back"><ArrowLeft :size="14"/> Back to store</RouterLink>
      <form class="auth-card" @submit.prevent="submit">
        <RouterLink to="/" class="brand">SHOPORA</RouterLink>
        <small>{{isLogin?'WELCOME BACK':'CREATE AN ACCOUNT'}}</small>
        <h1>{{isLogin?'Sign in to your account':'Join the considered life.'}}</h1>
        <p class="auth-intro">{{isLogin?'Access your orders, addresses, and shopping bag.':'Create an account to save your bag and complete checkout.'}}</p>
        <p v-if="error" class="alert error" role="alert">{{error}}</p>
        <label v-if="!isLogin">Full name<input v-model="name" autocomplete="name" required minlength="2" placeholder="Your full name"/></label>
        <label>Email address<input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com"/></label>
        <label>Password<span class="password-field"><input v-model="password" :type="showPassword?'text':'password'" :autocomplete="isLogin?'current-password':'new-password'" required minlength="8" placeholder="At least 8 characters"/><button type="button" :aria-label="showPassword?'Hide password':'Show password'" @click="showPassword=!showPassword"><EyeOff v-if="showPassword" :size="16"/><Eye v-else :size="16"/></button></span></label>
        <button class="auth-submit" :disabled="loading"><LockKeyhole :size="15"/> {{loading?'Please wait…':isLogin?'Sign in':'Create account'}}</button>
        <p>{{isLogin?'New to Shopora?':'Already have an account?'}} <RouterLink :to="isLogin?'/register':'/login'">{{isLogin?'Create account':'Sign in'}}</RouterLink></p>
        <span class="auth-secure"><ShieldCheck :size="14"/> Secure session · Password protected with Argon2id</span>
      </form>
    </section>
  </main>
</template>
