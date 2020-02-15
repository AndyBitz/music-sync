import fs from 'fs';
import http from 'http';
import { URL } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { execSync } from 'child_process';
import { assertEnv } from '../src/assert-env';

dotenv.config();

const { PORT = 3000 } = process.env;

const CLIENT_ID = assertEnv('CLIENT_ID');
const CLIENT_SECRET = assertEnv('CLIENT_SECRET');
const REDIRECT_URI = `http://localhost:${PORT}/spotify-auth`;

function base64(input: string): string {
	return Buffer.from(input).toString('base64');
}

async function saveSpotifyToken(code: string) {
	const auth = base64(`${CLIENT_ID}:${CLIENT_SECRET}`);

	const body = new URLSearchParams({
		code: code,
		redirect_uri: REDIRECT_URI,
		grant_type: 'authorization_code',
	});

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${auth}`,
		},
		body,
	});

	const data = await response.json();

	if (data.error) {
		console.log('Code', response.status);
		console.error(data);
		throw new Error(data.error.message);
	}

	await fs.promises.writeFile(
		`.env.temp`,
		`SPOTIFY_TOKEN=${data.access_token}\n`
	);
}

async function main() {
	return new Promise((resolve, reject) => {
		const server = http.createServer();

		server.on('request', async (req, res) => {
			res.setHeader('Content-Type', 'text/plain; charset=utf-8');

			const { pathname, searchParams } = new URL(
				`https://localhost${req.url}`
			);

			if (pathname === '/login') {
				const scope =
					'user-library-read user-read-private user-read-email user-library-modify';

				const query = new URLSearchParams();
				query.set('response_type', 'code');
				query.set('client_id', CLIENT_ID);
				query.set('scope', scope);
				query.set('redirect_uri', REDIRECT_URI);

				res.statusCode = 307;
				res.setHeader(
					'Location',
					`https://accounts.spotify.com/authorize?${query}`
				);

				res.end('Redirect...');
				return;
			}

			if (pathname === '/spotify-auth') {
				const code = searchParams.get('code');
				const error = searchParams.get('error');

				if (!code || error) {
					res.end(`Error\n\n${JSON.stringify(error, null, 2)}`);
					return;
				}

				await saveSpotifyToken(code);

				res.end('Token has been saved to `.env.temp`');

				console.log('Shutting Down Server...');
				server.close();

				return;
			}

			res.statusCode = 404;
			res.end('NOT_FOUND');
		});

		server.listen(PORT, () => {
			console.log(`Started server on port ${PORT}`);
			execSync(`open http://localhost:${PORT}/login`);
		});

		server.on('error', error => {
			reject(error);
		});

		server.on('close', () => {
			resolve();
		});
	});
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
