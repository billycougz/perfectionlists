import { useState } from 'react';
import { addTracksToPlaylist } from '../../api/spotify';

const Compare = ({ user, collections, onCollectionUpdate }) => {
	const [uniqueBy, setUniqueBy] = useState('id');
	const [filterBy, setFilterBy] = useState('all');

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
		onCollectionUpdate(index, playlist.external_urls.spotify);
	};

	return (
		<>
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
