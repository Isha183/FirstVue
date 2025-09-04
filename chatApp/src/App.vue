<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from './stores/authStore';

useAuthStore();
</script>

<template>
	<!-- <header>
      <nav>
         -->
	<!-- <RouterLink to=""></RouterLink> -->
	<!-- </nav>
  </header> -->
	<notifications position="top center" max="3" duration=3 pauseOnHover="true" />
	<RouterView />
</template>
