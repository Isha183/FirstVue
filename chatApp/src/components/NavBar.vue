<script setup lang="ts">
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

const openModal = ref<boolean>(false);

const handlelogout = () => {
	authStore.logout();
	router.push('/login');
};

const avatarPath = ref<string>('');
onMounted(() => {
	avatarPath.value = authStore.auth?.profile.avatar_url ?? '';
});

const toggleMenu = () => {
	openModal.value = !openModal.value;
};

const dropLabel = computed(() => {
	return route.name === 'Update Profile' ? 'Chats' : 'Update Profile';
});

const dropDown = () => {
	if (dropLabel.value === 'Chats') {
		router.push({ name: 'Chats' });
	} else {
		router.push({ name: 'Update Profile' });
	}
};

//if user is logged in then show full navbar otherwise show only logo
</script>
<template>
	<header
		class="flex flex-row shadow-sm w-full bg-light-gray"
		style="max-height: var(--navbar-height); height: var(--navbar-height)"
	>
		<div class="flex grow items-center ml-5">
			<i class="pi pi-comment text-red-600 text-3xl mr-1.5"></i>
			<h2 class="font-extrabold">ChatApp</h2>

			<div v-if="authStore.auth?.token" class="flex ml-auto space-x-4 mr-5">
				<div class="flex flex-col">
					<button
						type="button"
						@click.prevent="toggleMenu"
						class="text-gray-700 hover:underline justify-center"
					>
						<img
							v-if="avatarPath"
							:src="avatarPath"
							alt="user avatar"
							class="object-cover w-7 h-7 rounded-full border-2 border-black"
						/>
						<i
							v-else
							class="pi pi-user border-2 border-black w-6 h-6 text-black rounded-full"
						></i>
					</button>
					<div
						:class="[openModal ? 'block' : 'hidden']"
						class="bg-white rounded-md flex justify-center absolute right-7 mt-11 w-40 hover:bg-gray-300 text-white shadow-lg p-2"
					>
						<button
							@click.prevent="dropDown"
							class="text-black px-2 py-2 hover:underline rounded"
						>
							{{ dropLabel }}
						</button>
					</div>
				</div>
				<button
					type="button"
					@click.prevent="handlelogout"
					class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
				>
					Logout
				</button>
			</div>
		</div>
	</header>
</template>

<!-- <div id="trackModal" class="modal" action="{{ route('track.store') }}" method="POST">
        @csrf
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2 style="margin-bottom: 15px">Track Domain Expiry</h2>
            <form id="trackForm" action="{{ route('track.store') }}" method="POST">
                @csrf
                <input type="hidden" id="trackDomainHidden" name="domain" value="{{ $domain ?? '' }}">
                <input type="hidden" id="trackExpiryHidden" name="expiry" value="{{ $expires ?? '' }}">
                <input class="form-style" type="email" id="email" name="email" placeholder=" Your Email"
                    required value="{{ Auth::check() ? Auth::user()->email : '' }}">
                <input class="form-style" type="number" id="notifyDays" name="days"
                    placeholder=" Notify Before (e.g. 30)" required><br>
                <button class="track-btn" type="submit">Start Tracking</button>
            </form>
        </div>
    </div>
    </div> 
	function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('show');
        }



        const isVerified = @json($isVerified);
        const trackedCount = @json($trackedCount);
        const limit = @json($limit);


        function openModal(domain, expiry) {

            if (!isVerified && trackedCount >= limit) {
                alert("You need to verify your email to track more than 3 domains.");
                return;
            }

            // if (!isVerified) {
            // alert("You need to verify your email to track more than 3 domains.");
            // return;
            // }

            document.getElementById('trackDomainHidden').value = domain;
            document.getElementById('trackExpiryHidden').value = expiry;
            document.getElementById('trackModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('trackModal').style.display = 'none';
        }-->
