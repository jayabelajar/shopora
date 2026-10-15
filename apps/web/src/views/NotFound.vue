<script setup lang="ts">
import { SearchX } from 'lucide-vue-next';
</script>

<template>
  <main class="not-found-page">
    <SearchX :size="48" />
    <small>ERROR 404</small>
    <h1>Page not found.</h1>
    <p>The page may have moved, or the address may be incorrect.</p>
    <RouterLink class="btn-primary" to="/">Return Home</RouterLink>
  </main>
</template>
