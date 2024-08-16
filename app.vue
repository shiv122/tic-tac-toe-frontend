<template>
  <div>
    <UContainer>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UContainer>
    <Notivue v-slot="item">
      <NotivueSwipe :item="item">
        <Notification :item="item" :theme="theme" />
      </NotivueSwipe>
    </Notivue>
  </div>
</template>


<script setup>
import { darkTheme } from 'notivue'
const theme = {
  ...darkTheme,
  '--nv-global-bg': '#111827',
  '--nv-global-border': '#1f2937',
}

</script>

<style>
body {
  --tw-bg-opacity: 1;
  background-color: rgb(var(--color-gray-950) / var(--tw-bg-opacity));
  font-family: DM Sans, "DM Sans Fallback: Arial", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  --tw-text-opacity: 1;
  color: rgb(var(--ui-foreground) / var(--tw-text-opacity));
  -webkit-font-smoothing: antialiased;
}
</style>