import './App.css';
import { useEffect, useState } from 'react';
import { hasValidToken, handleLogout } from './api/auth';

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(null);

	useEffect(() => {
		const setIsLoggedInAsync = async () => setIsLoggedIn(await hasValidToken());
		setIsLoggedInAsync();
	}, []);

	return (
		<div className='App'>
			{isLoggedIn === null && 'Loading'}
			{isLoggedIn === false && (
				<a href='https://keluld9g15.execute-api.us-east-1.amazonaws.com/dev/authorize/login'>Login</a>
			)}
			{isLoggedIn && 'Welcome'}
			{isLoggedIn && <button onClick={handleLogout}>Logout</button>}
		</div>
	);
}

export default App;
