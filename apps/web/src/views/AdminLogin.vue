<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { LockKeyhole, ShieldCheck } from 'lucide-vue-next';
import { api } from '../api';
import { useSession, type User } from '../stores';

const email=ref('admin@shopora.test'),password=ref(''),error=ref(''),loading=ref(false),router=useRouter(),session=useSession();
async function submit(){loading.value=true;error.value='';try{const user=await api<User>('/auth/login',{method:'POST',body:JSON.stringify({email:email.value.trim().toLowerCase(),password:password.value})});if(user.role!=='ADMIN'){await api('/auth/logout',{method:'POST'});throw new Error('This account does not have administrator access')}session.user=user;session.ready=true;await router.replace('/admin')}catch(e:any){error.value=e.message}finally{loading.value=false}}
</script>

<template><main class="admin-login-page"><section class="admin-login-brand"><span>S</span><div><b>SHOPORA</b><small>MANAGEMENT PORTAL</small></div></section><form class="admin-login-card" @submit.prevent="submit"><small>PRIVATE WORKSPACE</small><h1>Administrator sign in</h1><p>Use an authorized admin account to manage products, inventory, categories, and orders.</p><div v-if="error" class="admin-alert" role="alert">{{error}}</div><label>Email address<input v-model="email" type="email" autocomplete="username" required/></label><label>Password<input v-model="password" type="password" autocomplete="current-password" required minlength="8"/></label><button class="admin-primary wide" :disabled="loading"><LockKeyhole/> {{loading?'Signing in…':'Sign in securely'}}</button><span><ShieldCheck/> Protected by role-based access control</span><RouterLink to="/">Return to storefront</RouterLink></form></main></template>
