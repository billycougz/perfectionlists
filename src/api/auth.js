import axios from 'axios';
import Amplify, { API } from 'aws-amplify';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig);

const ACCESS_TOKEN = 'spotify-toolbox-token';
const TOKEN_CREATED_AT = 'spotify-toolbox-timestamp';
const REFRESH_TOKEN = 'spotify-toolbox-refresh';
const REFRESH_DURATION = 3600000 - 300000; // 1 hour expiry less a 5 minute buffer

export const getAuthUrl = async (resource) => {
	const endpoint = await API.endpoint('authorizeApi');
	return `${endpoint}/authorize/${resource}`;
};

const setRefreshTimeout = (refreshDuration = REFRESH_DURATION) => {
	setTimeout(refreshAccessToken, refreshDuration);
};

export const hasValidToken = async () => {
	const { access_token, refresh_token } = getHashParams();
	if (access_token) {
		localStorage.setItem(ACCESS_TOKEN, access_token);
		localStorage.setItem(TOKEN_CREATED_AT, Date.now());
		localStorage.setItem(REFRESH_TOKEN, refresh_token);
		window.history.pushState(null, '', window.location.origin);
		window.location.reload();
	}
	if (localStorage.getItem(ACCESS_TOKEN)) {
		const timeElapsed = Date.now() - localStorage.getItem(TOKEN_CREATED_AT);
		if (!timeElapsed || timeElapsed > REFRESH_DURATION) {
			await refreshAccessToken();
		} else {
			const timeRemaining = REFRESH_DURATION - timeElapsed;
			setRefreshTimeout(timeRemaining);
		}
		return true;
	}
	return false;
};

export const handleLogout = () => {
	localStorage.removeItem(TOKEN_CREATED_AT);
	localStorage.removeItem(ACCESS_TOKEN);
	localStorage.removeItem(REFRESH_TOKEN);
	window.location.reload();
};

const getHashParams = () => {
	const hash = window.location.hash.slice(1);
	return hash.split('&').reduce((res, item) => {
		const parts = item.split('=');
		res[parts[0]] = parts[1];
		return res;
	}, {});
};

export const refreshAccessToken = async () => {
	try {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN);
		const refreshTokenUrl = await getAuthUrl(`refresh_token?refresh_token=${refreshToken}`);
		const { data } = await axios.get(refreshTokenUrl);
		const { access_token } = data;
		localStorage.setItem(ACCESS_TOKEN, access_token);
		localStorage.setItem(TOKEN_CREATED_AT, Date.now());
		setRefreshTimeout();
	} catch (e) {
		console.error(e);
	}
};
