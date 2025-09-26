import { ref, computed, watch, nextTick } from 'vue';
import { defineStore } from 'pinia';
import type { Channel } from '@/types';
import axios from 'axios';

export const useChatStore = defineStore('chats', () => {
	const chats = ref<Channel[]>([]);

	const channels = async () => {
		try {
			const res = await axios.get<{ data: Channel[] }>('/channels');
			chats.value = res.data.data;
		} catch (error) {
			console.error('Failed to fetch channels:', error);
		}
	};

	watch(chats, (n) => {
		if (n) {
			localStorage.setItem('chats', JSON.stringify(n));
		} else {
			localStorage.removeItem('chats');
		}
	});

	const tryLoadChatsFromLocalStorage = () => {
		const loadedValue = localStorage.getItem('chats');
		if (loadedValue) {
			chats.value = JSON.parse(loadedValue) as Channel[];
		}
	};
	tryLoadChatsFromLocalStorage();

	return { channels, chats };
});
