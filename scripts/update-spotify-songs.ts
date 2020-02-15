import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getLikedSongs } from '../src/get-liked-songs';

dotenv.config({
	path: path.join(__dirname, '../.env.temp'),
});

async function main() {
	const likedSongs = await getLikedSongs();

	await fs.promises.writeFile(
		'./output/spotify.json',
		JSON.stringify(likedSongs, null, 2)
	);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
