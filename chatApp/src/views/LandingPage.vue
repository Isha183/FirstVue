<script setup lang="ts">
import Header from '@/components/NavBar.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();

onMounted(() => {
	if (authStore.auth?.token) {
		router.push('/chats');
	}
});
</script>

<template>
    <div class='flex flex-col h-screen'>
        <Header />
        <div class="flex flex-1">
            <div class="w-5/12 flex flex-col justify-center items-center p-8 ">
                <img src="../assets/background.png" alt="chat image" class=" w-100 h-100 object-contain" />
                <div class="text-left  ">
                    <h4 class="pi pi-image"> Media Sharing</h4><br />
                    <p class="text-sm text-gray-700">Share images,videos and files instantly</p>
                    <h4 class="pi pi-users mt-5"> Group Chats</h4>
                    <p class="text-sm text-gray-700">Chat with multiple people at a time</p>
                </div>

            </div>
            <div class="bg-light-grey w-7/12 flex flex-col justify-center items-center p-12">
                <div>
                    <h2 class="text-lg font-bold text-gray-800 mb-4">What's up?</h2>
                    <p class="text-gray-600 mb-6 max-w-md">
                        Chat with your loved ones on our ChatApp in more fun way and have best time with them.
                    </p>
                    <RouterLink to="/signup"
                        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">SignUp Free
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>