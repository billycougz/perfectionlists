import axios from 'axios';
import { refreshAccessToken } from './auth';

// Private abstraction of axios to simplify Spotify API calls
const spotify = async (url, method = 'get', postData, isRetry) => {
	const token = localStorage.getItem('spotify-toolbox-token');
	const headers = { Authorization: `Bearer ${token}` };
	try {
		const { data } = await axios({ url, method, headers, data: postData });
		return data;
	} catch (e) {
		if (!isRetry) {
			await refreshAccessToken();
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

export const createPlaylist = (userId, playlistName) => {
	const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
	const data = JSON.stringify({ name: playlistName });
	return spotify(url, 'post', data);
};

export const addTracksToPlaylist = (playlistId, uris) => {
	const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${uris}`;
	return spotify(url, 'post');
};

export const getSearchResults = (searchValue) => {
	return spotify(`https://api.spotify.com/v1/search?type=album,playlist&q=${searchValue}`);
};
