<script setup lang="ts">
import Header from '@/components/NavBar.vue';
import router from '@/router';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import ChatModal from '../components/ChatModal.vue';
import ManageChannelModal from '@/components/ManageChannelModal.vue';
import GroupAvatar from '@/components/GroupAvatar.vue';


type Channel = {
	id: string;
	name: string;
};

const showChannelMenu = ref(false);
const isOwner = ref(false);
const manageModalOpen = ref(false);
const media = ref<File[] | null>();
const startchat = ref<boolean>(false);

const toggleChannelMenu = () => {
	showChannelMenu.value = !showChannelMenu.value;
};

const onAttachments = (event: Event) => {
	if (event.target instanceof HTMLInputElement) {
		if (event.target.files) {
			if (!media.value) {
				media.value = [];
			}
			for (const file of event.target.files) {
				media.value.push(file);
			}
		}
	}
};

const leaveChannel = async () => {
	if (!selectedChannel.value) return;
	try {
		await axios.delete(`/channels/${selectedChannel.value.id}/members`);
		alert('You left the channel');
		showChannelMenu.value = false;
		selectedChannel.value = null;
	} catch (error) {
		console.error(error);
	}
};

const openManageModal = () => {
	manageModalOpen.value = true;
	showChannelMenu.value = false;
};

const authStore = useAuthStore();

const channels = ref<Channel[]>();
const selectedChannel = ref<Channel | null>(null);
const messages = ref<any[]>([]);
const newMessage = ref<string>('');
const author = ref<string | null>(null);

const sendMessage = async () => {
	if (!selectedChannel.value) return;

	try {
		const attachments = <string[]>[];
		if (media.value) {
			for (let i of media.value) {
				const tempMediaId = await sendMedia(i);
				attachments.push(tempMediaId);
			}
			media.value = null;
		}
		const response = await axios.post(`/channels/${selectedChannel.value.id}/messages`, {
			content: newMessage.value,
			attachment_ids: attachments,
		});
		messages.value.push(response.data);
		console.log(messages.value);
		newMessage.value = '';
	} catch (error) {
		console.error(error);
	}
};

const selectChannel = async (channel: Channel) => {
	selectedChannel.value = channel;

	try {
		const res = await axios.get(`/channels/${channel.id}`);
		isOwner.value = res.data.owner_id === author.value;

		const response = await axios.get(`/channels/${channel.id}/messages`);
		messages.value = response.data.messages;
	} catch (error) {
		console.error(error);
	}
};

const sendMedia = async (media: File) => {
	if (!selectedChannel.value) return;

	try {
		const formData = new FormData();
		formData.append('file', media);
		const response = await axios.post('/media/temp', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		if (!response) {
			throw new Error('Unable to fetch data');
		}

		return response.data.id;
	} catch (error) {
		console.error(error);
	}
};

const showChannels = async () => {
	try {
		const response = await axios.get('/channels');
		if (!response) {
			throw new Error('Unable to fetch data');
		}
		channels.value = response.data;
		return response.data;
	} catch (error) {
		console.log(error);
	}
};

const getDate = (date: string) => {
	const msgDate = new Date(date);
	console.log(msgDate);
	const today = new Date();
	console.log(today);

	const msgDay = msgDate.toDateString();
	console.log(msgDay);
	const todayDay = today.toDateString();
	console.log(todayDay);

	const yesterday = new Date();
	console.log(yesterday);
	yesterday.setDate(today.getDate() - 1);
	console.log(yesterday.setDate(today.getDate() - 1));

	if (msgDay === todayDay) return 'Today';
	if (msgDay === yesterday.toDateString()) return 'Yesterday';
	return msgDate.toLocaleDateString();
};

// const showMessages = async () => {
// 	if (!selectedChannel.value) return;

// 	try {
// 		const response = await axios.get(`/channels/${selectedChannel.value.id}/messages`);
// 		if (!response) {
// 			throw new Error('Unable to fetch data');
// 		}
// 		messages.value = response.data.messages;
// 		messages.value.forEach((msg) => {
// 			console.log(msg.author_id);
// 		});

// 		return messages.value;
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

onMounted(() => {
	showChannels();
	author.value = authStore.auth?.profile.id ?? null;
	console.log(author.value);
});
</script>

<template>
	<div class="flex flex-col h-screen max-h-screen">
		<Header />
		<ManageChannelModal
			:open="manageModalOpen"
			:channel-id="selectedChannel?.id ?? null"
			@close="manageModalOpen = false"
		/>
		<ChatModal :open="startchat" @close="startchat = false" />

		<div class="flex grow overflow-y-auto" style="max-height: var(--content-height)">
			<!-- left side -->
			<div class="w-64 bg-white border-r p-4 flex flex-col">
				<div class="flex items-center border bg-light-grey rounded-md mt-5 px-2 py-1 mb-4">
					<input
						type="text"
						placeholder="Search"
						class="flex-1 bg-light-grey focus:outline-none text-sm"
					/>
					<i class="pi pi-search text-gray-500"></i>
				</div>

				<div class="flex flex-col grow space-y-2 text-gray-700">
					<button
						v-for="channel in channels"
						:key="channel.id"
						@click="selectChannel(channel)"
						class="w-full px-3 py-2 text-left rounded flex items-center"
						:class="{
							'bg-blue-100 text-blue-600 font-semibold':
								selectedChannel?.id === channel.id,
							'hover:underline': selectedChannel?.id !== channel.id,
						}"
					>
						<GroupAvatar :channel-id="channel?.id ?? null" />

						{{ channel.name }}
					</button>
				</div>

				<div class="mt-4 flex justify-end">
					<button
						@click.prevent="startchat = !startchat"
						class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
					>
						+
					</button>
				</div>
			</div>
			<!-- right side -->
			<div class="bg-light-grey w-full flex flex-col">
				<template v-if="selectedChannel" class="flex flex-col w-full">
					<!-- header -->
					<div
						class="flex flex-row justify-center border-b-2 border-gray-300"
						style="height: var(--channel-bar-height)"
					>
						<GroupAvatar :channel-id="selectedChannel?.id ?? null" />
						<h2
							class="text-xl font-semibold text-gray-800 border-b border-5 border-solid border-white p-3"
						>
							{{ selectedChannel.name }}
						</h2>
						<div class="mt-3 ml-auto">
							<button
								type="button"
								@click="toggleChannelMenu"
								class="ml-auto mr-4 mt-3"
							>
								<i class="pi pi-ellipsis-v w-6 h-6 text-black justify-end"></i>
							</button>

							<div
								v-if="showChannelMenu"
								class="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50"
							>
								<button
									v-if="!isOwner"
									@click="leaveChannel"
									class="block w-full text-left px-4 py-2 hover:bg-gray-100"
								>
									Leave Channel
								</button>

								<button
									v-if="isOwner"
									@click="openManageModal"
									class="block w-full text-left px-4 py-2 hover:bg-gray-100"
								>
									Manage Channel
								</button>
							</div>
						</div>
					</div>
					<!-- message container -->
					<div
						class="grow overflow-y-auto px-4 py-2 space-y-3"
						style="max-height: var(--channel-body-height)"
					>
						<template v-for="(msg, index) in messages" :key="index">
							<div
								v-if="
									index === 0 ||
									new Date(msg.created_at).toDateString() !==
										new Date(messages[index - 1].created_at).toDateString()
								"
								class="text-center my-2"
							>
								<span
									class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full"
								>
									{{ getDate(msg.created_at) }}
								</span>
							</div>
							<div
								class="flex flex-col max-w-xs md:max-w-md"
								:class="
									msg.author_id === author
										? 'ml-auto items-end'
										: 'mr-auto items-start'
								"
							>
								<span
									v-if="msg.author_id !== author"
									class="text-xs text-gray-500 mb-1 ml-1"
								>
									{{ msg.author_username }}
								</span>

								<div
									class="flex flex-row px-3 py-2 rounded-lg shadow"
									:class="
										msg.author_id === author
											? 'bg-blue-600 text-white rounded-br-none'
											: 'bg-white text-gray-800 border rounded-bl-none'
									"
								>
									{{ msg.content }}

									<img
										v-for="media in msg.media ?? []"
										:src="media.url"
										:alt="media.filename"
									/>
								</div>

								<span class="text-[10px] text-gray-400 mt-1">
									{{
										new Date(msg.created_at).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})
									}}
								</span>
							</div>
						</template>
					</div>

					<!-- message input -->
					<div
						class="flex justify-center p-5"
						style="height: var(--channel-input-height)"
					>
						<div class="flex grow">
							<input
								v-model="newMessage"
								type="text"
								placeholder="Type a message..."
								class="flex-1 px-3 py-2 border rounded focus:outline-none"
								@keyup.enter="sendMessage"
							/>
							<label
								for="attachments"
								class="bg text-grey px-4 py-2 rounded hover:bg-light-gray"
							>
								<i class="pi pi-paperclip"></i>
							</label>
							<input
								id="attachments"
								type="file"
								accept=".jpg, .jpeg, .png, .pdf"
								class="hidden"
								@change="onAttachments"
							/>

							<button
								@click="sendMessage"
								class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								<i class="pi pi-send"></i>
							</button>
						</div>
					</div>
				</template>

				<div v-else class="flex flex-col justify-center items-center w-full h-full">
					<h2 class="text-xl font-semibold text-gray-800 mb-6">Welcome!</h2>
					<p class="text-gray-600 text-sm">
						Start chat now or create a channel to get in touch with your loved ones.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
