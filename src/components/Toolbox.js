import styled from 'styled-components';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import Compare from './Compare';
import { useEffect, useState } from 'react';
import { getCurrentUser, getAlbum, getPlaylist } from '../api/spotify';
import Choose from './Choose';
import Settings from './Settings';
import Button from '../styles/Button';

const Main = styled.main`
	> h2 {
		padding-top: 5px;
		text-align: center;
	}
	@media (min-width: 769px) {
		padding-left: 285px;
		> h2 {
			display: none;
		}
	}
`;

const BackArrow = styled.button`
	@media (min-width: 769px) {
		top: 15px;
	}
	background: none;
	color: white;
	border: none;
	font-size: 3em;
	position: absolute;
	z-index: 1;
	margin-left: 10px;
	line-height: 20px;
	cursor: pointer;
`;

const Toolbox = () => {
	const [activeView, setActiveView] = useState('choose');
	const [user, setUser] = useState(null);
	const [collections, setCollections] = useState([null, null]);

	useEffect(() => {
		const setAsyncValues = async () => {
			setUser(await getCurrentUser());
		};
		setAsyncValues();
	}, []);

	const handleCollectionUpdate = async (index, url) => {
		const { type, id } = parseUrl(url);
		if (type && id) {
			const collection = type === 'playlist' ? await getPlaylist(id) : await getAlbum(id);
			const adaptedCollection = adaptCollection(collection, type);
			collections[index] = adaptedCollection;
			setCollections(collections.slice());
		} else if (collections[index] !== null) {
			collections[index] = null;
			setCollections(collections.slice());
		}
	};

	// Identifies the type (i.e. playlist or album) and id associated with a URL
	const parseUrl = (url) => {
		try {
			const { pathname } = new URL(url);
			const pathSegments = pathname.split('/');
			const { length } = pathSegments;
			const validTypes = ['playlist', 'album'];
			const type = validTypes.includes(pathSegments[length - 2]) ? pathSegments[length - 2] : undefined;
			const id = pathSegments[length - 1];
			return { type, id };
		} catch (e) {
			return {};
		}
	};

	// Adapts a collection so regardless of it's type it has the a common shape
	const adaptCollection = (collection, type) => {
		const { items } = collection.tracks;
		const adaptedTracks =
			type === 'playlist' ? items.map((item) => item.track) : items.map((item) => ({ ...item, album: collection }));
		return { ...collection, tracks: adaptedTracks };
	};

	const handleNavChange = (view) => {
		setActiveView(view);
		window.scrollTo(0, 0);
	};

	return (
		<>
			<SideNav collections={collections} onPlaylistSelect={handleCollectionUpdate} />
			<Main>
				{activeView === 'compare' && (
					<BackArrow small onClick={() => handleNavChange('choose')}>
						‹
					</BackArrow>
				)}
				<h2>Perfectionlists</h2>
				{activeView === 'choose' && (
					<Choose
						collections={collections}
						onCollectionUpdate={handleCollectionUpdate}
						onCompare={() => setActiveView('compare')}
					/>
				)}
				{activeView === 'compare' && (
					<Compare user={user} collections={collections} onCollectionUpdate={handleCollectionUpdate} />
				)}
				{activeView === 'settings' && <Settings user={user} />}
			</Main>
			<BottomNav onNavChange={handleNavChange} activeView={activeView} />
		</>
	);
};

export default Toolbox;
