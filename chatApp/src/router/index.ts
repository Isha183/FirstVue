import { createRouter, createWebHistory } from 'vue-router';

import LandingPage from '@/views/LandingPage.vue';
import SignUp from '@/views/SignUp.vue';
import Login from '@/views/Login.vue';
import ChatsPage from '@/views/ChatsPage.vue';
import UpdatePage from '@/views/UpdatePage.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Landingpage',
			component: LandingPage,
		},
		{
			path: '/signup',
			name: 'SignUppage',
			component: SignUp,
		},
		{
			path: '/login',
			name: 'LogInpage',
			component: Login,
		},
		{
			path: '/chats',
			name: 'Chats',
			component: ChatsPage,
		},
		{
			path: '/updateprofile',
			name: 'Update Profile',
			component: UpdatePage,
		}
	],
});

export default router;
