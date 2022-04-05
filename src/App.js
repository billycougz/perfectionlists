import './App.css';
import { useEffect, useState } from 'react';
import { hasValidToken, handleLogout, getAuthUrl } from './api/auth';
import GlobalStyle from './styles/GlobalStyle';

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
			{isLoggedIn === false && <a href={loginUrl}>Login</a>}
			{isLoggedIn && 'Welcome'}
			{isLoggedIn && <button onClick={handleLogout}>Logout</button>}
		</>
	);
}

export default App;
