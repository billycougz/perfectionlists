import styled from 'styled-components';
import { handleLogout } from '../api/auth';
import { colors } from '../styles/theme';

const Container = styled.div`
	margin: 2em;
`;

const Link = styled.a`
	font-weight: bold;
	color: ${colors.green};
	text-decoration: none;
`;

const Settings = ({ user }) => (
	<Container>
		<div>
			Logged in as &nbsp;
			<Link href={user?.external_urls.spotify} target='_blank'>
				{user?.display_name}
			</Link>
		</div>
		<br />
		<hr />
		<br />
		<button onClick={handleLogout}>Logout</button>
	</Container>
);

export default Settings;
