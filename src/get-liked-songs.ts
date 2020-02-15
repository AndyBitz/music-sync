import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { assertEnv } from './assert-env';

interface Song {
	id: string;
	artist: string;
	title: string;
	album: string;
}

export async function getLikedSongs(): Promise<Song[]> {
	const token = assertEnv('SPOTIFY_TOKEN');

	const headers = {
		Accept: 'application/json; charset=utf-8',
		Authorization: `Bearer ${token}`,
	};

	const songs: Song[] = [];
	let offset = 0;

	while (true) {
		const query = new URLSearchParams({
			limit: '50',
			offset: offset.toString(),
		});

		const response = await fetch(
			`https://api.spotify.com/v1/me/tracks?${query}`,
			{ headers }
		);
		const data = await response.json();

		data.items.forEach(item => {
			songs.push({
				id: item.track.id,
				artist: item.track.artists[0].name,
				title: item.track.name,
				album: item.track.album.name,
			});
		});

		if (songs.length >= data.total) {
			break;
		}

		offset += data.items.length;
	}

	return songs;
}
