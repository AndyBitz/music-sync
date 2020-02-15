import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { assertEnv } from './assert-env';

export async function searchSong(query: string) {
	const token = assertEnv('SPOTIFY_TOKEN');

	const params = new URLSearchParams({
		market: 'from_token',
		type: 'track',
		q: query,
	});

	const response = await fetch(
		`https://api.spotify.com/v1/search?${params}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		return null;
	}

	const data = await response.json();

	const firstResult = data?.tracks?.items?.[0];

	if (!firstResult) {
		return null;
	}

	return {
		id: firstResult.id,
		title: firstResult.name,
		artist: firstResult.artists[0].name,
		album: firstResult.album.name,
	};
}
