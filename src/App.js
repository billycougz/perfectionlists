import './App.css';
import { useEffect, useState } from 'react';
import { hasValidToken, getAuthUrl } from './api/auth';
import GlobalStyle from './styles/GlobalStyle';
import Toolbox from './components/Toolbox';

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(null);
	const [loginUrl, setLoginUrl] = useState(null);

	useEffect(() => {
		const setAsyncValues = async () => {
			setIsLoggedIn(await hasValidToken());
			setLoginUrl(await getAuthUrl('login'));
		};
		setAsyncValues();
	}, []);

	return (
		<>
			<GlobalStyle />
			{isLoggedIn === null && 'Loading'}
			{isLoggedIn === true && <Toolbox />}

			{isLoggedIn === false && <a href={loginUrl}>Login</a>}
			{isLoggedIn === false && (
				<>
					<p>
						Spotify provides a platform that helps creators like Music Artists and Podcaststers bring their work to
						their fans.
					</p>
					<p>
						Playlist Studio provides a platform that helps Spotify users like you compose and share creative works of
						your own - playlists.
					</p>
				</>
			)}
		</>
	);
}

export default App;
