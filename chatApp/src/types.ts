export type User = {
	id: string;
	username: string;
	password: string;
	display_name: string;
	avatar_url: string;
};

export type Channel = {
	id: string;
	name: string;
	description: string;
	owner_id: string;
	member_count: number;
	type: string;
};

export type ChannelMember = {
	id: string;
	channel_id: string;
	user_id: string;
	is_owner: boolean;
	user: User;
};

export type TempMedia = {
	id: string;
	filename: string;
	content_type: string;
	size: number;
};

export type Media = {
	id: string;
	message_id: string;
	filename: string;
	content_type: string;
	size: number;
	url:string
};

export type Message = {
	id: string;
	channel_id: string;
	author_id: string;
	author_username: string;
	author_display_name: string;
	content: string;
	media_count: number;
	media: Media[];
	created_at: string;
};
