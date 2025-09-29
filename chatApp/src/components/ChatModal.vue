<script setup lang="ts">
import type { Channel, User } from '@/types';
import { useNotification } from '@kyvg/vue3-notification';
import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query';
import axios from 'axios';
import { computed, defineProps, ref } from 'vue';

const props = defineProps<{
	open: boolean;
}>();

const { notify } = useNotification();
const searchQuery = ref<string>('');
const activeTab = ref<'chat' | 'channel'>('chat');
const emit = defineEmits(['close', 'chat-started']);
const queryClient = useQueryClient();

const channelName = ref('');
const onSearch = ref('');
const channelDesc = ref('');
const showAddUsersModal = ref(false);
const initial_members = ref<string[]>([]);
const user = ref<string>();

const {
	isLoading: isLoadingUsers,
	data: users,
	error: usersError,
	refetch: refetchUsers,
} = useQuery({
	queryKey: computed(() => ['users', searchQuery.value]),
	queryFn: async () => {
		const response = await axios.get<{ data: User }>('/allusers', {
			params: { username: searchQuery.value },
		});
		return response.data.data;
	},
	enabled: computed(() => props.open && !!searchQuery.value),
});

onSearch.value = searchQuery.value;

// const fetchUsers = async (username: string) => {
// 	try {
// 		const response = await axios.get<User>('/allusers', {
// 			params: { username: username },
// 		});
// 		if (!response) {
// 			throw new Error('Unable to fetch data');
// 		}
// 		user.value = response.data.data.username;

// 		if (!user.value) {
// 			return notify({
// 				text: 'User does not exist',
// 				type: 'error',
// 			});
// 		}
// 	} catch (err) {
// 		console.error('Failed to fetch users:', err);
// 	}
// };

// const fetchCall = () => {
// 	fetchUsers(searchQuery.value);
// };




const openAddUsersModal = () => {
	if (!channelName.value.trim()) {
		alert('Please enter channel name first');
		return;
	}
	showAddUsersModal.value = true;
};

const addUser = () => {
	if (users?.value?.username) {
		initial_members.value = [...initial_members.value, users.value.username];
	} else {
		notify({ text: 'No user selected', type: 'error' });
	}
};

// const createChannel = async (
// 	channelName: string,
// 	channelDesc: string,
// 	initial_members: string[],
// ) => {
// 	try {
// 		const response = await axios.post<Channel>('/channels', {
// 			type: 'group',
// 			name: channelName,
// 			description: channelDesc,
// 			initial_members: initial_members,
// 		});
// 		alert('Channel created successfully!');
// 		showAddUsersModal.value = false;
// 	} catch (error) {
// 		console.error('Failed to create channel:', error);
// 	}
// };

const { mutate: createChannel, isPending: isCreatingChannel } = useMutation({
	mutationFn: async () => {
		return await axios.post<Channel>('/channels', {
			type: 'group',
			name: channelName.value,
			description: channelDesc.value,
			initial_members: initial_members.value,
		});
	},
	onSuccess: () => {
		notify({ text: 'Channel created successfully!', type: 'success' });
		showAddUsersModal.value = false;
		queryClient.invalidateQueries({ queryKey: ['channels'] });
	},
	onError: (error: any) => {
		console.error('Failed to create channel:', error);
		notify({ text: 'Failed to create channel', type: 'error' });
	},
});

const { mutate: startChat, isPending: isStartingChat } = useMutation({
	mutationFn: async (username: string) => {
		return await axios.post<Channel>('/channels', {
			type: 'personal',
			username: username,
		});
	},
	onSuccess: (res) => {
		notify({ text: 'Chat started successfully!', type: 'success' });
		emit('chat-started', res.data);
		queryClient.invalidateQueries({ queryKey: ['channels'] });
	},
	onError: (error: any) => {
		console.error('Failed to start chat:', error);
		notify({ text: 'Failed to start chat', type: 'error' });
	},
});
// const createdChannel = () => {
// 	createChannel(channelName.value, channelDesc.value, initial_members.value);
// };

const createdChannel = () => createChannel();

const closeModal = () => {
	emit('close');
};
</script>

<template>
	<div
		v-if="open"
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
	>
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
					One-on-One Chat
				</button>
				<button
					class="flex-1 py-2 text-center"
					:class="activeTab === 'channel' ? 'border-b-2 border-blue-600 font-bold' : ''"
					@click="activeTab = 'channel'"
				>
					Create Group
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
						@click.prevent="refetchUsers()"
						class="bg-blue-600 px-4 rounded-r text-white"
					>
						<i class="pi pi-search"></i>
					</button>
				</div>

				<ul class="space-y-2 max-h-64 overflow-y-auto">
					<li v-if="users" class="flex justify-between items-center border-b pb-1">
						<span>{{ users.username }}</span>
						<button
							@click.prevent="startChat(users.username)"
							class="text-blue-600 hover:underline"
						>
							Chat
						</button>
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
							@click.prevent="refetchUsers()"
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
					@click.prevent="createdChannel"
				>
					Create Channel
				</button>
				
			</div>
		</div>
	</div>
</template>
