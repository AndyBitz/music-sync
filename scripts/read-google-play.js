/**
 * This script has to be executed on `https://play.google.com/music/listen#/all`.
 * It'll create a JSON list that must be copied to `output/play-music.json`.
 */
(async () => {
	const sleep = t => new Promise(res => setTimeout(res, t));

	const songs = new Map();

	const tbody = document.querySelector('table.song-table tbody');

	const iterate = () => {
		for (const row of tbody.children) {
			if (!row.className.includes('song-row')) {
				continue;
			}

			const item = {
				id: row.getAttribute('data-id'),
				artist: row
					.querySelector('[data-col="artist"]')
					.textContent.trim(),
				title: row
					.querySelector('[data-col="title"]')
					.textContent.trim(),
				album: row
					.querySelector('[data-col="album"]')
					.textContent.trim(),
				duration: row
					.querySelector('[data-col="duration"]')
					.textContent.trim(),
				playCount:
					Number(
						row
							.querySelector('[data-col="play-count"]')
							.textContent.trim()
					) || 0,
			};

			songs.set(item.id, item);
		}
	};

	const toStart = () =>
		document.querySelector('.vl-placeholder').scrollIntoView();
	const toEnd = () =>
		document.querySelectorAll('.vl-placeholder')[1].scrollIntoView();

	toStart();
	await sleep(300);

	let lastNumber = songs.size;

	while (true) {
		iterate();
		toEnd();

		// Sleep to make sure the UI refreshes
		await sleep(300);

		if (lastNumber === songs.size) {
			console.log(`Done. Found ${songs.size} songs.`);
			break;
		}

		lastNumber = songs.size;
	}

	const list = Array.from(songs.values());

	console.log(JSON.stringify(list, null, 2));
})();
