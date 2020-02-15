import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { assertEnv } from './assert-env';

export async function addSong(id: string) {
	const token = assertEnv('SPOTIFY_TOKEN');

	const params = new URLSearchParams({
		ids: id,
	});

	const response = await fetch(
		`https://api.spotify.com/v1/me/tracks?${params}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		console.error(await response.text());
		throw new Error('Failed to add song');
	}
}
