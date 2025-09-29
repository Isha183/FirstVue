<script setup lang="ts">
import Header from '@/components/NavBar.vue';
import { onMounted, ref } from 'vue';
import { useNotification } from '@kyvg/vue3-notification';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import type { User } from '@/types';
import { useMutation } from '@tanstack/vue-query';

const { notify } = useNotification();
const authStore = useAuthStore();

const email = ref<string>('');
const displayName = ref<string>('');
const avatar = ref<HTMLInputElement>();
const avatarPath = ref<string>('');
onMounted(() => {
	displayName.value = authStore.auth?.profile.display_name ?? displayName.value;
	avatarPath.value = authStore.auth?.profile.avatar_url ?? '';
});

const showOldPassword = ref<boolean>(false);
const showNewPassword = ref<boolean>(false);

const oldPassword = ref<string>('');
const newPassword = ref<string>('');

const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
	mutationFn: async (
		{displayName,oldPassword,newPassword,email,avatar}:{displayName: string,
		oldPassword: string,
		newPassword: string,
		email: string,
		avatar: undefined | File | null,}
	) => {
		const formData = new FormData();
		formData.append('display_name', displayName);
		if (oldPassword) formData.append('old_password', oldPassword);
		if (newPassword) formData.append('new_password', newPassword);
		if (email) formData.append('email', email);
		if (avatar) formData.append('avatar', avatar);
		const response = await axios.post<{
			data: User;
		}>('http://localhost:80/api/users/me', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		if (!response) {
			throw new Error('Unable to fetch data');
		}

		authStore.handleProfileUpdate(response.data.data);

		return notify({
			text: 'Profile update successfully',
			type: 'success',
		});
	},
});

// async function update(
// 	displayName: string,
// 	oldPassword: string,
// 	newPassword: string,
// 	email: string,
// 	avatar: undefined | File | null,
// ) {
// 	try {
// 		const formData = new FormData();
// 		formData.append('display_name', displayName);
// 		if (oldPassword) formData.append('old_password', oldPassword);
// 		if (newPassword) formData.append('new_password', newPassword);
// 		if (email) formData.append('email', email);
// 		if (avatar) formData.append('avatar', avatar);
// 		const response = await axios.post<{
// 			data: User;
// 		}>('http://localhost:80/api/users/me', formData, {
// 			headers: { 'Content-Type': 'multipart/form-data' },
// 		});
// 		if (!response) {
// 			throw new Error('Unable to fetch data');
// 		}

// 		authStore.handleProfileUpdate(response.data.data);

// 		return notify({
// 			text: 'Profile update successfully',
// 			type: 'success',
// 		});
// 	} catch (error) {
// 		console.log(error);
// 	}
// }

const checkPass = async () => {
	if (oldPassword.value.trim() !== '' && newPassword.value.trim() !== '') {
		if (oldPassword.value.trim() === newPassword.value.trim()) {
			return notify({
				text: 'Old Password and new password cannot be same',
				type: 'error',
			});
		}
	}
	if (
		displayName.value.trim() !== '' ||
		(oldPassword.value.trim() !== '' && newPassword.value.trim() !== '')
	) {
		await updateProfile(
			{displayName:displayName.value.trim(),
			oldPassword:oldPassword.value.trim(),
			newPassword:newPassword.value.trim(),
			email:email.value.trim(),
			avatar:avatar.value?.files?.item(0),}
		);
	}
};

const resetForm = () => {
	displayName.value = '';
	email.value = '';
	oldPassword.value = '';
	newPassword.value = '';
	if (avatar.value) avatar.value.value = '';
};
</script>

<template>
	<div class="flex flex-col h-screen">
		<Header />
		<!--left Side content-->
		<div class="flex grow">
			<div class="w-4/12 bg-white p-6 flex flex-col items-center justify-center">
				<div class="w-52 h-52 bg-light-grey flex items-center justify-center rounded">
					<img
						v-if="avatarPath"
						:src="avatarPath"
						alt="User Avatar"
						class="object-cover w-full h-full"
					/>
					<i v-else class="pi pi-user text-6xl text-gray-600"></i>
				</div>
				<h2 class="mt-4 font-semibold text-gray-700">
					{{ displayName }}
				</h2>
			</div>

			<!--Right Side content-->
			<main class="grow bg-light-grey p-20">
				<h2 class="text-lg font-semibold text-gray-800 mb-6">Update Profile</h2>

				<form class="space-y-6 max-w-2xl" @submit.prevent="checkPass">
					<div>
						<input
							v-model="displayName"
							type="text"
							placeholder="Display Name"
							class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<input
							v-model="email"
							type="email"
							placeholder="Enter Email"
							class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label class="block mb-2 text-sm font-medium"> Upload Avatar </label>
						<input
							ref="avatar"
							type="file"
							accept=".jpg,.jpeg,.png"
							class="block border w-full text-sm px-3 py-2 bg-white text-gray-700 rounded-md cursor-pointer focus:outline-none"
						/>
						<p class="mt-1 text-xs text-gray-500">
							File type supported: jpg, jpeg, png
						</p>
					</div>

					<!-- Update Password -->
					<div>
						<label class="block mb-2 text-sm font-medium"> Update Password </label>
						<div class="relative">
							<input
								v-model="oldPassword"
								:type="showOldPassword ? 'text' : 'password'"
								placeholder="Old Password"
								class="w-full mb-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								@click.prevent="showOldPassword = !showOldPassword"
								class="absolute top-3 right-3"
							>
								<i :class="[showOldPassword ? 'pi pi-eye' : 'pi pi-eye-slash']"></i>
							</button>
						</div>
						<div class="relative">
							<input
								v-model="newPassword"
								:type="showNewPassword ? 'text' : 'password'"
								placeholder="New Password"
								class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								@click.prevent="showNewPassword = !showNewPassword"
								class="absolute top-3 right-3"
							>
								<i :class="[showNewPassword ? 'pi pi-eye' : 'pi pi-eye-slash']"></i>
							</button>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex space-x-4">
						<button
							type="submit"
							class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
						>
							Update
						</button>
						<button
							@click.prevent="resetForm"
							type="button"
							class="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
						>
							Cancel
						</button>
					</div>
				</form>
			</main>
		</div>
	</div>
</template>
