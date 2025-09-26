<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import type { ChannelMember } from '@/types';

const props = defineProps<{
	members: ChannelMember[];
}>();

const authStore = useAuthStore();
</script>

<template>
	<div class="flex -space-x-4 p-2">
		<template v-for="(member, index) in members.slice(0, 5)" :key="member.user.id">
			<div v-if="member.user.id !== authStore.auth?.profile.id">
				<img
					v-if="member.user.avatar_url && member.user.avatar_url.trim() !== ''"
					:src="member.user.avatar_url"
					class="w-8 h-8 rounded-full border-2 border-black object-cover"
					:title="member.user.username"
				/>
				<i v-else class="pi pi-user"></i>
			</div>
		</template>

		<div
			v-if="members.length > 5"
			class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700 border-2 border-white"
		>
			+{{ members.length - 5 }}
		</div>
	</div>
</template>
