import styled from 'styled-components';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import Compare from './Compare';
import { useEffect, useState } from 'react';
import { getCurrentUser, getAlbum, getPlaylist, getUserPlaylists, getArtistTracks } from '../api/spotify';
import Choose from './Choose';
import Settings from './Settings';

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
	font-weight: bold;
	position: absolute;
	z-index: 1;
	margin-left: 10px;
	line-height: 26px;
	cursor: pointer;
`;

const Toolbox = () => {
	const [activeView, setActiveView] = useState('choose');
	const [user, setUser] = useState(null);
	const [collections, setCollections] = useState([null, null]);
	const [userPlaylists, setUserPlaylists] = useState([]);

	useEffect(() => {
		const setAsyncValues = async () => {
			setUser(await getCurrentUser());
			const { items } = await getUserPlaylists();
			setUserPlaylists(items);
		};
		setAsyncValues();
	}, []);

	const handleCollectionUpdate = async (index, url, suggestion) => {
		const { type, id } = parseUrl(url);
		if (type && id) {
			const collection = await getCollection(type, id);
			const adaptedCollection = adaptCollection(collection, type, suggestion);
			collections[index] = adaptedCollection;
			setCollections(collections.slice());
		} else if (collections[index] !== null) {
			collections[index] = null;
			setCollections(collections.slice());
		}
	};

	const getCollection = (type, id) => {
		switch (type) {
			case 'playlist':
				return getPlaylist(id);
			case 'album':
				return getAlbum(id);
			case 'artist':
				return getArtistTracks(id);
		}
	};

	const handleNewPlaylist = async () => {
		const { items } = await getUserPlaylists();
		setUserPlaylists(items);
	};

	// Identifies the type and id associated with a URL
	const parseUrl = (url) => {
		try {
			const { pathname } = new URL(url);
			const pathSegments = pathname.split('/');
			const { length } = pathSegments;
			const validTypes = ['playlist', 'album', 'artist'];
			const type = validTypes.includes(pathSegments[length - 2]) ? pathSegments[length - 2] : undefined;
			const id = pathSegments[length - 1];
			return { type, id };
		} catch (e) {
			return {};
		}
	};

	// Adapts a collection so regardless of it's type it has the a common shape
	const adaptCollection = (collection, type, suggestion) => {
		if (type === 'artist') {
			return {
				name: suggestion.name,
				images: suggestion.images,
				external_urls: suggestion.external_urls,
				...collection,
			};
		}
		const { items } = collection.tracks;
		const adaptedTracks =
			type === 'playlist' ? items.map((item) => item.track) : items.map((item) => ({ ...item, album: collection }));
		return { ...collection, tracks: adaptedTracks };
	};

	const handleNavChange = (view) => {
		setActiveView(view);
		window.scrollTo(0, 0);
	};

	const handlePlaylistSelect = (index, url, isNew) => {
		handleCollectionUpdate(index, url);
		if (isNew) {
			handleNewPlaylist();
		}
	};

	return (
		<>
			<SideNav
				user={user}
				playlists={userPlaylists}
				collections={collections}
				onPlaylistSelect={handlePlaylistSelect}
			/>
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
					<Compare
						user={user}
						collections={collections}
						onCollectionUpdate={handleCollectionUpdate}
						onNewPlaylistCreated={handleNewPlaylist}
					/>
				)}
				{activeView === 'settings' && <Settings user={user} />}
			</Main>
			<BottomNav onNavChange={handleNavChange} activeView={activeView} />
		</>
	);
};

export default Toolbox;
