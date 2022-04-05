import styled from 'styled-components';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import { handleLogout } from '../api/auth';

const Main = styled.main`
	@media (min-width: 769px) {
		padding-left: 250px;
	}
`;

const Toolbox = () => (
	<>
		<SideNav />
		<Main>
			<div>Welcome</div>
			<button onClick={handleLogout}>Logout</button>
		</Main>
		<BottomNav />
	</>
);

export default Toolbox;
