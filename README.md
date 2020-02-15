# Music Sync

Gathers all songs from your Google Play Music account and your Spotify account to check what songs are missing in your Spotify account and compares them to each other.

## How To

This is a Node.js Application. You'll need [Node.js](https://nodejs.org/en/) in order to run it.

To get started, enter the following commands into the terminal:

1. `mkdir -p output`
2. `touch output/play-music.json`
3. `npm install`

### Gather Songs from Google Play Music

Copy the script from `scripts/read-google-play.js` and paste it in the Developer Tools Console on `https://play.google.com/music/listen#/all`. It will log a list that must be copied to `output/play-music.json`.

### Set up Spotify

In order to access Spotify you'll need to get an Access Token. This Token has to be saved in `.env.temp` in this format:

```
SPOTIFY_TOKEN=<token>
```

#### Get an Access Token

##### Possibility No. 1

Go to https://spotify.com, open the Developer Tools, go to the Network tab and search for `api.spotify.com`. When a request is inspected it will eventually contain `Authorization: Bearer <token>`, just copy the `<token>` part and save it.

##### Possibility No. 2

Go to https://developer.spotify.com, register a non-commercial App to get a `Client ID` and a `Client Secret`. Save those in `.env` in this format:

```
CLIENT_ID=<Client ID>
CLIENT_SECRET=<Client Secret>
```

Make sure to add `http://localhost:3000/spotify-auth` to the **Redirect URIs** list in the App's settings. Then run `npm run update-spotify-token`. It'll open the Browser for you so that you can Sign In with Spotify. The Access Token will be saved automatically and the script can be rerun whenever a new token is needed again.

> Tokens will usually expire within one hour. 

#### Gather Songs from Spotify

After the token has been saved, just execute `npm run update-spotify-songs` to create the file `output/spotify.json`. Depending on how much songs you've liked this might take a couple of seconds or minutes.

#### Compare Songs from Google Play to Spotify

Enter `npm run compare`, it'll compare the lists and ask you to add missing songs to Spotify if it finds them. At the end it'll tell you how much are still missing and how much were already there.

> It'll log every song it found and added to `song.log` so that it can be checked later on. Every line is a JSON object.
