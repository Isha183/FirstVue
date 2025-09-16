<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { defineProps, defineEmits, ref, onMounted } from 'vue';

const authStore = useAuthStore();

const props = defineProps<{
	open: boolean;
	channelId: string | null;
}>();

const verification = ref<boolean>(false);
const emit = defineEmits(['close']);
const verify = ref<boolean>(false);

const author = ref<string | null>(null);
const username = ref<string>('');
const modalMode = ref<'none' | 'add' | 'remove' | 'owner'>('none');
const newMembers = ref<string[]>([]);
const members = ref<any[]>([]);

const closeModal = () => {
	emit('close');
	modalMode.value = 'none';
};

onMounted(() => {
	author.value = authStore.auth?.profile.id ?? null;
});

const fetchMembers = async () => {
	if (!props.channelId) return;
	try {
		const response = await axios.get(`/channels/${props.channelId}/members`);
		members.value = response.data.data;
	} catch (error) {
		console.error(error);
	}
};

const addMember = async (username: string[]) => {
	try {
		await axios.post(`/channels/${props.channelId}/members`, {
			username: username,
		});
		alert('Added Member');
	} catch (error) {
		console.log(error);
	}
};
const removeMember = async () => {
	try {
		await axios.delete(`/channels/${props.channelId}/members/${username.value}`);
		fetchMembers();
		modalMode.value = 'none';
		alert('Removed Member');
	} catch (error) {
		console.log(error);
	}
};
const deleteChannel = async () => {
	try {
		await axios.delete(`/channels/${props.channelId}`);
		alert('Channel deleted');
	} catch (error) {
		console.log(error);
	}
};
const changeOwner = async (username: string) => {
	try {
		await axios.post(`/channels/${props.channelId}/ownership`, {
			username: username,
		});
		return;
	} catch (error) {
		console.log(error);
	}
};
</script>

<template>
	<div v-if="open" class="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
		<div class="w-80 bg-white h-full shadow-xl flex flex-col">
			<div class="flex justify-between items-center border-b p-4">
				<h2 class="text-lg font-semibold">Manage Channel</h2>
				<button @click="closeModal" class="text-gray-600 hover:text-black">✕</button>
			</div>

			<div v-if="modalMode === 'none'" class="flex flex-col p-4 space-y-3">
				<button
					@click="modalMode = 'add'"
					class="px-3 py-2 border rounded hover:bg-gray-100"
				>
					Add Members
				</button>
				<button
					@click="
						() => {
							modalMode = 'remove';
							fetchMembers();
						}
					"
					class="px-3 py-2 border rounded hover:bg-gray-100"
				>
					Remove Member
				</button>
				<button
					@click="
						() => {
							modalMode = 'owner';
							fetchMembers();
						}
					"
					class="px-3 py-2 border rounded hover:bg-gray-100"
				>
					Change Owner
				</button>
				<button
					@click="verification = true"
					class="px-3 py-2 border rounded hover:bg-gray-100 text-red-600"
				>
					Delete Channel
				</button>
			</div>

			<div v-if="modalMode === 'add'" class="p-4">
				<h3 class="font-semibold mb-2">Add Members</h3>
				<div class="flex space-x-2">
					<input
						v-model="username"
						placeholder="Enter username"
						class="flex-1 border px-2 py-1"
					/>
					<button
						@click="
							() => {
								if (username) {
									newMembers.push(username);
									username = '';
								}
							}
						"
						class="px-2 bg-blue-500 text-white"
					>
						Add
					</button>
				</div>
				<ul class="mt-2 space-y-1">
					<li v-for="(u, i) in newMembers" :key="i" class="flex justify-between">
						<span>{{ u }}</span>
						<button @click="newMembers.splice(i, 1)" class="text-red-500">x</button>
					</li>
				</ul>
				<div class="mt-4 flex space-x-2">
					<button
						@click="addMember(newMembers)"
						class="bg-blue-600 text-white px-4 py-2 rounded"
					>
						Confirm
					</button>
					<button @click="modalMode = 'none'" class="px-4 py-2 border">Cancel</button>
				</div>
			</div>

			<div v-if="modalMode === 'remove'" class="p-4">
				<h3 class="font-semibold mb-2">Remove a Member</h3>
				<ul class="space-y-2">
					<li
						v-for="m in members"
						:key="m.user.id"
						class="flex justify-between items-center"
					>
						<span>{{ m.user.username }}</span>
						<button
							@click="
								() => {
									username = m.user.username;
									verify = true;
								}
							"
							class="text-red-600"
						>
							Remove
						</button>
					</li>
				</ul>
				<button @click="modalMode = 'none'" class="px-4 py-2 mt-4 border border-gray-300">
					Cancel
				</button>
				<div
					v-if="verify === true"
					class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-center"
				>
					<div class="bg-white w-[600px] rounded-lg shadow-lg p-6 relative">
						<h5>Do you want to remove the user?</h5>
						<div class="flex space-x-4 justify-center mt-3">
							<button
								@click="removeMember"
								class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								Yes
							</button>
							<button
								@click="verify = false"
								class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								No
							</button>
						</div>
					</div>
				</div>
			</div>
			<div v-if="modalMode === 'owner'" class="p-4">
				<h3 class="font-semibold mb-2">Change Owner</h3>
				<ul class="space-y-2">
					<li
						v-for="m in members"
						:key="m.user.id"
						class="flex justify-between items-center"
					>
						<span>{{ m.user.username }}</span>
						<button @click="changeOwner(m.user.username)" class="text-blue-600">
							Make Owner
						</button>
					</li>
				</ul>
				<button @click="modalMode = 'none'" class="px-4 py-2 mt-4 border border-gray-300">
					Cancel
				</button>
			</div>

			<div v-if="verification === true" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-center">
				<div class="bg-white w-[600px] rounded-lg shadow-lg p-6 relative">
					<h5>Do you want to delete the channel?</h5>
					<div class="flex space-x-4 justify-center mt-3">
						<button
							@click="deleteChannel"
							class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
						>
							Yes
						</button>
						<button
							@click="verification = false"
							class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
						>
							No
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
