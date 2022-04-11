import { handleLogout } from '../api/auth';

const Settings = ({ user }) => (
	<>
		<div>
			Logged in as &nbsp;
			<a href={user?.external_urls.spotify} target='_blank'>
				{user?.display_name}
			</a>
		</div>
		<button onClick={handleLogout}>Logout</button>
	</>
);

export default Settings;
