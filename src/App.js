import styled from 'styled-components';
import './App.css';
import { useEffect, useState } from 'react';
import { hasValidToken, getAuthUrl } from './api/auth';
import GlobalStyle from './styles/GlobalStyle';
import Toolbox from './components/Toolbox';
import { colors } from './styles/theme';
import Spinner from './components/Spinner';

const Container = styled.div`
	margin: 2em;
	text-align: center;
	display: flex;
	flex-direction: column;
	height: 50vh;
	justify-content: center;
	> h1 {
		font-size: 3em;
	}
`;

const Link = styled.a`
	color: ${colors.green};
	text-decoration: none;
	font-size: 2.5em;
`;

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
			{isLoggedIn === null && <Spinner />}
			{isLoggedIn === true && <Toolbox />}

			{isLoggedIn === false && (
				<Container>
					<h1>Perfectionlists</h1>
					<p>Build the perfect playlist by comparing against any playlist, album, or artist on Spotify.</p>
					<Link href={loginUrl}>Login</Link>
				</Container>
			)}
		</>
	);
}

export default App;
