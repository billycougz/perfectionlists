import axios from 'axios';
import { refreshAccessToken } from './auth';

// Private abstraction of axios to simplify Spotify API calls
const spotify = async (url, method = 'get', postData, isRetry) => {
	const token = localStorage.getItem('spotify-toolbox-token');
	const headers = { Authorization: `Bearer ${token}` };
	try {
		const { data } = await axios({
			url,
			method,
			headers,
			data: postData,
		});
		return data;
	} catch (e) {
		if (e.response.status === 401) {
			await refreshAccessToken();
		}
		if (!isRetry) {
			return spotify(url, method, postData, true);
		} else {
			console.log(e);
		}
	}
};

export const getCurrentUser = () => spotify('https://api.spotify.com/v1/me');

export const getUserPlaylists = () => spotify('https://api.spotify.com/v1/me/playlists');

export const getPlaylist = async (playlistId) => {
	const playlist = await spotify(`https://api.spotify.com/v1/playlists/${playlistId}`);
	while (playlist.tracks.next) {
		const { items, next } = await spotify(playlist.tracks.next);
		playlist.tracks.items.push(...items);
		playlist.tracks.next = next;
	}
	return playlist;
};

export const getAlbum = (albumId) => spotify(`https://api.spotify.com/v1/albums/${albumId}`);

export const getArtistTracks = (artistId) =>
	spotify(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=us`);

export const createPlaylist = (userId, playlistName) => {
	const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
	const data = JSON.stringify({ name: playlistName });
	return spotify(url, 'post', data);
};

export const addTracksToPlaylist = (playlistId, uris) => {
	// We can only post 100 tracks per request
	const groupCount = Math.ceil(uris.length / 100);
	const requests = [];
	while (requests.length < groupCount) {
		const groupIndex = requests.length;
		const uriGroup = uris.filter((uri, index) => index >= groupIndex * 100 && index < groupIndex * 100 + 100);
		const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${uriGroup}`;
		requests.push(spotify(url, 'post'));
	}
	return Promise.all(requests);
};

export const getSearchResults = (searchValue) => {
	return spotify(`https://api.spotify.com/v1/search?type=album,artist,playlist&q=${searchValue}`);
};
