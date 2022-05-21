import styled from 'styled-components';
import { handleLogout } from '../api/auth';
import Button from '../styles/Button';
import { colors } from '../styles/theme';

const Container = styled.div`
	margin: 2em;
	text-align: center;
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
		<Button small onClick={handleLogout}>
			Logout
		</Button>
	</Container>
);

export default Settings;
