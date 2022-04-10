import { useState } from 'react';
import { addTracksToPlaylist, getAlbum, getPlaylist } from '../../api/spotify';

const Compare = ({ user }) => {
	const [collections, setCollections] = useState([]);
	const [uniqueBy, setUniqueBy] = useState('id');
	const [filterBy, setFilterBy] = useState('all');

	const handleCollectionUpdate = async (index, url) => {
		const { type, id } = parseUrl(url);
		if (type && id) {
			const collection = type === 'playlist' ? await getPlaylist(id) : await getAlbum(id);
			const adaptedCollection = adaptCollection(collection, type);
			collections[index] = adaptedCollection;
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

	const getUniqueTracks = (uniqueTracks, collection) => {
		const getUniqueId = (track) => (uniqueBy === 'id' ? track.id : `${track.name} : ${track.artists[0].name}`);
		const trackLookup = uniqueTracks.reduce((lookup, track, index) => ({ ...lookup, [getUniqueId(track)]: index }), []);
		collection.tracks.forEach((track) => {
			const uniqueId = getUniqueId(track);
			if (trackLookup[uniqueId] === undefined) {
				track.collections = { [collection.id]: true };
				uniqueTracks.push(track);
				trackLookup[uniqueId] = uniqueTracks.length - 1;
			} else {
				const existingTrack = uniqueTracks[trackLookup[uniqueId]];
				existingTrack.collections[collection.id] = true;
			}
		});
		return uniqueTracks;
	};

	const filterTracks = (track) => {
		switch (filterBy) {
			case 'all':
				return true;
			case 'oneOnly':
				return track.collections[collections[0].id];
			case 'twoOnly':
				return track.collections[collections[1].id];
			case 'oneMissing':
				return !track.collections[collections[0].id];
			case 'twoMissing':
				return !track.collections[collections[1].id];
		}
	};

	const handleAddTrack = async (playlist, trackUri) => {
		await addTracksToPlaylist(playlist.id, [trackUri]);
		const index = collections.findIndex((collection) => collection.id === playlist.id);
		handleCollectionUpdate(index, playlist.external_urls.spotify);
	};

	return (
		<>
			{[0, 1].map((index) => (
				<input key={index} onChange={(e) => handleCollectionUpdate(index, e.target.value)} />
			))}

			<input type='checkbox' onChange={(e) => setUniqueBy(e.target.checked ? 'nameAndArtist' : 'id')} />
			<label>Consider tracks with same name and artist to be identical</label>
			<br />

			<label>Show</label>
			<select onChange={(e) => setFilterBy(e.target.value)} value={filterBy}>
				<option value='all'>All Tracks</option>
				<option value='oneOnly'>{collections[0]?.name}</option>
				<option value='twoOnly'>{collections[1]?.name}</option>
				<option value='oneMissing'>{`Missing from ${collections[0]?.name}`}</option>
				<option value='twoMissing'>{`Missing from ${collections[1]?.name}`}</option>
			</select>

			{collections
				.reduce(getUniqueTracks, [])
				.filter(filterTracks)
				.map((track) => (
					<div key={track.id}>
						{track.name}
						{collections.map((collection) => (
							<span key={collection.id}>
								{track.collections[collection.id] ? (
									'✓'
								) : collection?.owner?.id === user.id ? (
									<button onClick={() => handleAddTrack(collection, track.uri)}>Add</button>
								) : (
									'✕'
								)}
							</span>
						))}
					</div>
				))}
		</>
	);
};

export default Compare;
