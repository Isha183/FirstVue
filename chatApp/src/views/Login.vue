<script setup lang="ts">
import Header from '@/components/NavBar.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

const router = useRouter();
const username = ref('');
const password = ref('');

const authStore = useAuthStore();

onMounted(() => {
	if (authStore.auth?.token) {
		router.push('/chats');
	}
});

async function login(username: string, password: string): Promise<any> {
	try {
		const response = await axios.post<{
			token: string;
			user: User;
		}>('http://localhost:80/api/auth/login', {
			username: username,
			password: password,
		});

		if (!response) {
			throw new Error('Unable to fetch data');
		}

		authStore.handleLogin(response.data.token, response.data.user);
		router.push('/chats');
	} catch (error) {
		console.error(error);
	}
}

const hasInput = async () => {
	if (username.value.trim() !== '' && password.value.trim() !== '') {
		const loginCheck = await login(username.value.trim(), password.value.trim());
		if (loginCheck) {
			router.push('/chats');
		}
	} else {
		alert('All fields are required');
	}
};
</script>

<template>
	<div class="flex flex-col h-screen">
		<Header />
		<div class="flex flex-1">
			<div class="w-5/12 flex justify-center items-center p-8 space-y-8">
				<img
					src="../assets/background.png"
					alt="chat image"
					class="w-100 h-100 object-contain"
				/>
			</div>
			<div class="bg-light-grey w-7/12 flex flex-col justify-center items-center p-12">
				<div class="w-full max-w-sm text-center">
					<h2 class="text-xl font-semibold text-center text-gray-800 mb-6">LogIn</h2>
					<form class="space-y-4" @submit.prevent="hasInput">
						<input
							type="text"
							placeholder="Username*"
							v-model="username"
							class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>

						<input
							type="password"
							placeholder="Password*"
							v-model="password"
							class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>

						<button
							type="submit"
							class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
						>
							LogIn
						</button>
					</form>

					<p class="text-center text-gray-600 text-sm mt-4">
						Don't have an account?
						<a href="/signup" class="text-blue-600 font-medium hover:underline"
							>SignUp</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
