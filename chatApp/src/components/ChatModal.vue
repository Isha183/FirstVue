<script setup lang="ts">
import type { User } from '@/types';
import { useNotification } from '@kyvg/vue3-notification';
import axios from 'axios';
import {defineProps, ref } from 'vue';

const props = defineProps<{
	open: boolean;
}>();

const { notify } = useNotification();
const searchQuery = ref<string>('');
const activeTab = ref<'chat' | 'channel'>('chat');
const emit = defineEmits(['close']);


const channelName = ref('');
const channelDesc = ref('');
const showAddUsersModal = ref(false);
const initial_members = ref<string[]>([]);
const user = ref<string>();

const fetchUsers = async (username: string) => {
	try {
		const response = await axios.get<User>('/allusers', {
			params: { username: username },
		});
		if (!response) {
			throw new Error('Unable to fetch data');
		}
		user.value = response.data.username;
    
		if (!user.value) {
			return notify({
				text: 'User does not exist',
				type: 'error',
			});
		}
	} catch (err) {
		console.error('Failed to fetch users:', err);
	}
};

const fetchCall = () => {
	fetchUsers(searchQuery.value);
};

const openAddUsersModal = () => {
	if (!channelName.value.trim()) {
		alert('Please enter channel name first');
		return;
	}
	showAddUsersModal.value = true;
  
};

const addUser = () => {
  
	if (user.value) {
		initial_members.value = [...initial_members.value, user.value];
	}else{
    return 'no user stored'
  }
};

const createChannel = async (channelName: String, channelDesc: string, initial_members: string[]) => {
	try {
		const response = await axios.post('/channels', {
			name: channelName,
			description: channelDesc,
			initial_members: initial_members,
		});
		alert('Channel created successfully!');
		showAddUsersModal.value = false;
	} catch (error) {
		console.error('Failed to create channel:', error);
	}
};

const created = () => {
	createChannel(channelName.value, channelDesc.value, initial_members.value);
};


const closeModal = () => {
	emit('close');
};
</script>

<template>
	<div v-if="open" class=" fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
		<div class="bg-white w-[600px] rounded-lg shadow-lg p-6 relative">
			<button @click="closeModal" class="absolute top-3 right-3 text-gray-600 text-xs">
				close
			</button>

			<div class="flex border-b mb-4">
				<button
					class="flex-1 py-2 text-center"
					:class="activeTab === 'chat' ? 'border-b-2 border-blue-600 font-bold' : ''"
					@click="activeTab = 'chat'"
				>
					Start Chat
				</button>
				<button
					class="flex-1 py-2 text-center"
					:class="activeTab === 'channel' ? 'border-b-2 border-blue-600 font-bold' : ''"
					@click="activeTab = 'channel'"
				>
					Create Channel
				</button>
			</div>

			<div v-if="activeTab === 'chat'">
				<div class="flex mb-3">
					<input
						v-model="searchQuery"
						placeholder="Search using username"
						class="border rounded-l px-3 py-2 flex-grow"
					/>
					<button
						type="button"
						@click.prevent="fetchCall"
						class="bg-blue-600 px-4 rounded-r text-white"
					>
						<i class="pi pi-search"></i>
					</button>
				</div>

				<ul class="space-y-2 max-h-64 overflow-y-auto">
					<li class="flex justify-between items-center border-b pb-1">
						<span>{{ user }}</span>
						<button class="text-blue-600 hover:underline">Chat</button>
					</li>
				</ul>
			</div>

			<div v-if="activeTab === 'channel'" class="space-y-3">
				<input
					v-model="channelName"
					type="text"
					placeholder="Channel Name"
					class="border px-3 py-2 rounded w-full"
				/>
				<textarea
					v-model="channelDesc"
					placeholder="Channel Description"
					class="border px-3 py-2 rounded w-full"
				></textarea>

				<button
					class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					@click="openAddUsersModal"
				>
					Create Account
				</button>
			</div>
		</div>

		<div
			v-if="showAddUsersModal"
			class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60"
		>
			<div class="bg-white w-[500px] rounded-lg shadow-lg p-6 relative">
				<button
					@click="showAddUsersModal = false"
					class="absolute top-2 right-3 text-gray-600 text-xs"
				>
					close
				</button>

				<h2 class="text-lg font-bold mb-4">Select Users for {{ channelName }}</h2>

				<!-- <ul class="space-y-2 max-h-64 overflow-y-auto">
					<li class="flex items-center space-x-2">
						<input type="checkbox" v-model="selectedUsers" />
						<span>{{ user }}</span>
					</li>
				</ul> -->

				<div>
					<div class="flex mb-3">
						<input
							v-model="searchQuery"
							placeholder="Search using username"
							class="border rounded-l px-3 py-2 flex-grow"
						/>
						<button
							type="button"
							@click.prevent="fetchCall"
							class="bg-blue-600 px-4 rounded-r text-white"
						>
							<i class="pi pi-search"></i>
						</button>
					</div>

					<ul class="space-y-2 max-h-64 overflow-y-auto">
						<li class="flex justify-between items-center border-b pb-1">
							<span>{{ user }}</span>
							<button
								type="button"
								@click="addUser"
								class="text-blue-600 hover:underline"
							>
								+Add
							</button>
						</li>
					</ul>
				</div>

				<button
					class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					type="button"
					@click.prevent="created"
				>
					Create Channel
				</button>
			</div>
		</div>
	</div>
</template>

<!-- const createChannel = async () => {
	try {
		await axios.post('/api/channels', {
			name: channelName.value,
			description: channelDesc.value,
			users: selectedUsers.value, // array of user IDs
		});
		alert('Channel created successfully!');
		showAddUsersModal.value = false;
		channelName.value = '';
		channelDesc.value = '';
		selectedUsers.value = [];
		router.push('/chats');
	} catch (err) {
		console.error('Failed to create channel:', err);
	}
}; -->
