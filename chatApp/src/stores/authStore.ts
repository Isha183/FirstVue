import { ref, readonly, watch, nextTick } from 'vue';
import { defineStore } from 'pinia';
import type { User } from '@/types';
import axios from 'axios';

type AuthState =
	| {
			profile: User;
			token: string;
	  }
	| undefined;

export const useAuthStore = defineStore('auth', () => {
	const auth = ref<AuthState>();

	const handleLogin = (token: string, profile: User) => {
		auth.value = {
			token: token,
			profile: profile,
		};
		nextTick(() => refreshProfile());
	};

	const handleProfileUpdate = (profile: User) => {
		if (auth.value) {
			auth.value = {
				...auth.value,
				profile: profile,
			};
		}
	};

	const logout = () => {
		// todo -- expire token
		auth.value = undefined;
	};

	const refreshProfile = async () => {
		if (!auth.value) {
			console.warn('Trying to refresh profile when user is not logged in.');
			return;
		}
		try {
			const response = await axios.get<User>('http://localhost:80/api/users/me');
			handleProfileUpdate(response.data);
		} catch (error) {
			console.error('error', error);
		}
	};

	watch(auth, (n) => {
		//save auth state in local storage for later retrieval
		console.log(n);
		if (n) {
			localStorage.setItem('auth', JSON.stringify(n));
			axios.defaults.headers.common.Authorization = `Bearer ${n.token}`;
		} else {
			localStorage.removeItem('auth');
			axios.defaults.headers.common.Authorization = undefined;
		}
	});

	const tryLoadAuthFromLocalStorage = () => {
		const loadedValue = localStorage.getItem('auth');
		if (loadedValue) {
			const parsed = JSON.parse(loadedValue) as AuthState;
			handleLogin(parsed!.token, parsed!.profile);
		}
	};
	tryLoadAuthFromLocalStorage();

	return {
		auth: readonly(auth),
		handleLogin,
		logout,
		refreshProfile,
		handleProfileUpdate,
	};
});
