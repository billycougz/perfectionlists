import axios from 'axios';

const LOCAL_TOKEN = 'spotify-toolbox-token';
const LOCAL_TIMESTAMP = 'spotify-toolbox-timestamp';
const LOCAL_REFRESH = 'spotify-toolbox-refresh';

export const hasValidToken = async () => {
	const { access_token, refresh_token } = getHashParams();
	if (access_token && access_token !== localStorage.getItem(LOCAL_TOKEN)) {
		localStorage.setItem(LOCAL_TOKEN, access_token);
		localStorage.setItem(LOCAL_TIMESTAMP, Date.now());
		localStorage.setItem(LOCAL_REFRESH, refresh_token);
	}
	if (localStorage.getItem(LOCAL_TOKEN)) {
		return isTokenExpired() ? refreshAccessToken() : true;
	}
	return false;
};

export const handleLogout = () => {
	localStorage.removeItem(LOCAL_TIMESTAMP);
	localStorage.removeItem(LOCAL_TOKEN);
	localStorage.removeItem(LOCAL_REFRESH);
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

const isTokenExpired = () => {
	const timestamp = localStorage.getItem(LOCAL_TIMESTAMP);
	return !timestamp || Date.now() - timestamp > 3600000;
};

const refreshAccessToken = async () => {
	try {
		const refreshToken = localStorage.getItem(LOCAL_REFRESH);
		const { data } = await axios.get(
			`https://keluld9g15.execute-api.us-east-1.amazonaws.com/dev/authorize/refresh_token?refresh_token=${refreshToken}`
		);
		const { access_token } = data;
		localStorage.setItem(LOCAL_TOKEN, access_token);
		localStorage.setItem(LOCAL_TIMESTAMP, Date.now());
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};
