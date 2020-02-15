import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import readline from 'readline';
import { addSong } from '../src/add-song';
import { searchSong } from '../src/search-song';

dotenv.config();
dotenv.config({
	path: path.join(__dirname, '..', '.env.temp'),
});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function ask(question: string): Promise<boolean> {
	return new Promise(res => {
		rl.question(question + ' [y/N] ', answer => {
			res(answer.toLowerCase().includes('y'));
		});
	});
}

async function main() {
	console.log(chalk.red(`-------------------------------`));
	console.log(chalk.red(`------------ START ------------`));
	console.log(chalk.red(`-------------------------------`));

	const playMusicList = require('../output/play-music.json');
	const spotifyList = require('../output/spotify.json');

	let found = 0;
	let notFound = 0;

	const stream = fs.createWriteStream('./song.log', { flags: 'a' });

	for (const playMusicItem of playMusicList) {
		const hasAlbum = spotifyList.find(spotifyItem => {
			return (
				spotifyItem.album &&
				playMusicItem &&
				spotifyItem.album.toLowerCase() ===
					playMusicItem.album.toLowerCase()
			);
		});

		const hasSong = spotifyList.find(spotifyItem => {
			return (
				spotifyItem.title.toLowerCase() ===
				playMusicItem.title.toLowerCase()
			);
		});

		if (!hasSong && !hasAlbum) {
			const searchResult = await searchSong(
				`${playMusicItem.artist} ${playMusicItem.title}`
			);

			if (searchResult) {
				const alreadyExists = spotifyList.find(
					item => item.id === searchResult!.id
				);

				if (alreadyExists) {
					console.log(
						`${chalk.dim('[Exists]')} ${playMusicItem.title} - ${
							playMusicItem.artist
						}`
					);
					console.log(
						`         ${searchResult!.title} - ${
							searchResult!.artist
						}`
					);
					continue;
				}

				console.log(
					chalk.yellow('Adding song'),
					searchResult!.title,
					'-',
					searchResult!.artist
				);
				console.log(
					chalk.dim('        for'),
					playMusicItem.title,
					'-',
					playMusicItem.artist
				);

				if (await ask('Add to Library?')) {
					await addSong(searchResult!.id);
					stream.write(
						JSON.stringify({
							playMusicItem,
							searchResult,
							time: Date.now(),
						}) + '\n'
					);
					found += 1;
					continue;
				}
			}

			console.log(
				`${chalk.dim('[Missing]')} ${playMusicItem.title} - ${
					playMusicItem.artist
				}`
			);

			notFound += 1;
		}
	}

	stream.close();

	console.log('Not Found:', notFound);
	console.log('Found', found);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
