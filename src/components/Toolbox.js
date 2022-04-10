import styled from 'styled-components';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import { handleLogout } from '../api/auth';
import Compare from './Compare';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/spotify';

const Main = styled.main`
	@media (min-width: 769px) {
		padding-left: 250px;
	}
`;

const Toolbox = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const setAsyncValues = async () => {
			setUser(await getCurrentUser());
		};
		setAsyncValues();
	}, []);

	return (
		<>
			<SideNav />
			<Main>
				<Compare user={user} />
				<button onClick={handleLogout}>Logout</button>
			</Main>
			<BottomNav />
		</>
	);
};

export default Toolbox;
