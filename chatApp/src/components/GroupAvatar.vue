<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps<{
	channelId: string | null;
}>();

const members = ref<any[]>([]);
const authStore = useAuthStore();

const fetchMembers = async () => {
	if (!props.channelId) return;

	try {
		const response = await axios.get(`/channels/${props.channelId}/members`);
		if (!response) {
			throw new Error('Unable to fetch data');
		}

		// const allMembers = response.data;

		// const currentUserId = authStore.auth?.profile.id;

		members.value = response.data;
	} catch (error) {
		console.error(error);
	}
};

onMounted(fetchMembers);
</script>

<template>
	<div class="flex -space-x-4 p-2 ">
		<template v-for="(member, index) in members.slice(0, 5)" :key="member.user.id">
			<img
				v-if="member.user.avatar_url && member.user.avatar_url.trim() !== ''"
				:src="member.user.avatar_url"
				class="w-8 h-8 rounded-full border-2 border-black object-cover"
				:title="member.user.username"
			/>
            <i v-else class="pi pi-user"></i>
		</template>

		<div
			v-if="members.length > 5"
			class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700 border-2 border-white"
		>
			+{{ members.length - 5 }}
		</div>
	</div>
</template>
