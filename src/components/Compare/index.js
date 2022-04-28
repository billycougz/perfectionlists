import { useState } from 'react';
import { addTracksToPlaylist } from '../../api/spotify';
import styled from 'styled-components';
import { colors } from '../../styles/theme';

const ViewContainer = styled.div`
	margin: 1em;
`;

const CompareRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	display: grid;
	grid-template-columns: 7fr 1fr 1fr;
	border-bottom: 1px solid #2b2b2b;
`;

const CompareHeaders = styled(CompareRow)`
	padding: 1em 0;
	color: #808081;
	position: sticky;
	top: 225px;
	background: ${colors.backgroundBlack};
`;

const Container = styled.div`
	display: flex;
	align-items: center;
	padding: 1em 0;
	white-space: nowrap;
	overflow: hidden;
`;

const SideStatus = styled.div`
	text-align: center;
`;

const Image = styled.img`
	padding-right: 1em;
	height: 60px;
`;

const TrackDetail = styled.div`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	> div {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const PlaylistSummaryGroup = styled.div`
	display: flex;
	justify-content: space-around;
	padding: 1em 0;
	position: sticky;
	top: 0;
	background: ${colors.backgroundBlack};
`;

const PlaylistSummary = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	> img {
		height: 152px;
	}
	> div {
		padding-top: 10px;
	}
`;

const ShowOptions = styled.select``;

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
		<ViewContainer>
			<input type='checkbox' onChange={(e) => setUniqueBy(e.target.checked ? 'nameAndArtist' : 'id')} />
			<label>Consider tracks with same name and artist to be identical</label>
			<br />

			<label>Show</label>
			<ShowOptions onChange={(e) => setFilterBy(e.target.value)} value={filterBy}>
				<option value='all'>All Tracks</option>
				<option value='oneOnly'>{collections[0]?.name}</option>
				<option value='twoOnly'>{collections[1]?.name}</option>
				<option value='oneMissing'>{`Missing from ${collections[0]?.name}`}</option>
				<option value='twoMissing'>{`Missing from ${collections[1]?.name}`}</option>
			</ShowOptions>

			<PlaylistSummaryGroup>
				{collections.map((collection, index) => (
					<PlaylistSummary>
						<img src={collection.images[0].url} />
						<div>{collection.name}</div>
						<div>Side {index ? 'B' : 'A'}</div>
					</PlaylistSummary>
				))}
			</PlaylistSummaryGroup>

			{collections[0] && collections[1] && (
				<div>
					<CompareHeaders>
						<span>TRACK</span>
						<SideStatus>
							<span>A</span>
						</SideStatus>
						<SideStatus>
							<span>B</span>
						</SideStatus>
					</CompareHeaders>
					{collections
						.reduce(getUniqueTracks, [])
						.filter(filterTracks)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((track) => (
							<CompareRow key={track.id}>
								<Container>
									<Image src={track.album.images[0].url} />
									<TrackDetail>
										<div>{track.name}</div>
										<div>{track.artists[0].name}</div>
									</TrackDetail>
								</Container>
								{collections.map((collection) => (
									<SideStatus key={collection.id}>
										{track.collections[collection.id] ? (
											'✓'
										) : collection?.owner?.id === user.id ? (
											<button onClick={() => handleAddTrack(collection, track.uri)}>Add</button>
										) : (
											'✕'
										)}
									</SideStatus>
								))}
							</CompareRow>
						))}
				</div>
			)}
		</ViewContainer>
	);
};

export default Compare;
