import { useState } from 'react';
import { addTracksToPlaylist, createPlaylist } from '../../api/spotify';
import styled from 'styled-components';
import { colors } from '../../styles/theme';
import Toast from '../Toast';

const ViewContainer = styled.div`
	margin: 1em;
	margin-top: -1em;
	padding-bottom: 50px;
`;

const CompareRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	display: grid;
	border-radius: 5px;
	grid-template-columns: 7fr 1fr 1fr;
	border-bottom: 1px solid #2b2b2b;
	&:hover {
		background: rgb(43, 43, 43);
	}
`;

const CompareHeaders = styled(CompareRow)`
	padding: 1em 0;
	color: ${colors.textGray};
	position: sticky;
	top: 230px;
	background: ${colors.backgroundBlack};
	margin: 0 -1px;
	&:hover {
		cursor: initial;
		background: ${colors.backgroundBlack};
	}
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
		:nth-child(2) {
			color: ${colors.textGray};
		}
	}
`;

const PlaylistSummaryGroup = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: 1fr;
	grid-gap: 1em;
	position: sticky;
	top: -1px;
	padding: 1em 0;
	margin: 0 -1px;
	background: ${colors.backgroundBlack};
`;

const PlaylistSummary = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	overflow: hidden;
	text-align: center;
	> img {
		height: 152px;
		&:hover {
			opacity: 0.5;
			cursor: pointer;
		}
	}
	> div {
		padding-top: 10px;
		:nth-child(3) {
			color: ${colors.textGray};
		}
	}
`;

const OptionsContainer = styled.div`
	display: flex;
	justify-content: center;
	padding: 1em 0;
`;

const FilterSelect = styled.select`
	background: rgba(255, 255, 255, 0.1);
	text-align: center;
	color: white;
	padding: 5px;
	border-radius: 5px;
	margin-right: 5px;
	max-width: 75%;
`;

const ForkButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	text-align: center;
	color: white;
	padding: 6px 15px;
	border-radius: 5px;
	border: solid 1px gray;
	width: 170px;
`;

const AddButton = styled.button`
	background: rgba(255, 255, 255, 0.1);
	text-align: center;
	color: white;
	padding: 4px 6px;
	border-radius: 5px;
	border: solid 1px gray;
	@media (max-width: 768px) {
		width: 100%;
	}
`;

const Compare = ({ user, collections, onCollectionUpdate }) => {
	// Defaulting uniqueBy to name/artist and have removed the option from the UI for now
	const [uniqueBy, setUniqueBy] = useState('nameAndArtist');
	const [filterBy, setFilterBy] = useState('all');
	const [toast, setToast] = useState(null);

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
			case 'both':
				return track.collections[collections[0].id] && track.collections[collections[1].id];
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

	const handleAddTrack = async (e, playlist, trackUri) => {
		e.stopPropagation();
		await addTracksToPlaylist(playlist.id, [trackUri]);
		const index = collections.findIndex((collection) => collection.id === playlist.id);
		onCollectionUpdate(index, playlist.external_urls.spotify);
		handleToast('Track added');
	};

	const handleForkClick = async () => {
		const filterByMap = {
			all: 'all tracks',
			both: 'tracks that Side A & Side B have in common',
			oneOnly: collections[0].name,
			twoOnly: collections[1].name,
			oneMissing: `tracks missing from ${collections[0].name}`,
			twoMissing: `tracks missing from ${collections[1].name}`,
		};
		const playlistName = window.prompt(
			`This will copy ${filterByMap[filterBy]} into a new playlist.`,
			'New Playlist Name'
		);
		if (playlistName) {
			const trackUris = collections
				.reduce(getUniqueTracks, [])
				.filter(filterTracks)
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((track) => track.uri);
			const newPlaylist = await createPlaylist(user.id, playlistName);
			await addTracksToPlaylist(newPlaylist.id, trackUris);
			handleToast('Playlist created');
		}
	};

	const handleToast = (message) => {
		clearTimeout(toast?.timeout);
		const timeout = setTimeout(() => setToast(null), 3000);
		setToast({ message, timeout });
	};

	const trackCount = collections.reduce(getUniqueTracks, []).filter(filterTracks).length;

	const handleContentClick = (e, url, name) => {
		if (window.confirm(`Open ${name} in Spotify?`)) {
			window.open(url);
		}
	};

	return (
		<ViewContainer>
			{false && (
				<>
					<label>Consider tracks with same name and artist to be identical</label>
					<input type='checkbox' onChange={(e) => setUniqueBy(e.target.checked ? 'nameAndArtist' : 'id')} />
				</>
			)}

			<PlaylistSummaryGroup>
				{collections.map((collection, index) => (
					<PlaylistSummary>
						<img
							src={collection.images[0]?.url}
							onClick={(e) => handleContentClick(e, collection.external_urls.spotify, collection.name)}
						/>
						<div>{collection.name}</div>
						<div>Side {index ? 'B' : 'A'}</div>
					</PlaylistSummary>
				))}
			</PlaylistSummaryGroup>

			<OptionsContainer>
				<FilterSelect onChange={(e) => setFilterBy(e.target.value)} value={filterBy}>
					<option value='all'>All Tracks</option>
					<option value='both'>Tracks in Common</option>
					<option value='oneOnly'>Tracks from Side A</option>
					<option value='twoOnly'>Tracks from Side B</option>
					<option value='oneMissing'>Missing from Side A</option>
					<option value='twoMissing'>Missing from Side B</option>
				</FilterSelect>
				<ForkButton onClick={handleForkClick}>Fork</ForkButton>
			</OptionsContainer>

			{toast && <Toast>{toast.message}</Toast>}

			{collections[0] && collections[1] && (
				<div>
					<CompareHeaders>
						<span>{trackCount} TRACKS</span>
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
							<CompareRow
								key={track.id}
								onClick={(e) => handleContentClick(e, track.external_urls.spotify, track.name)}
							>
								<Container>
									<Image src={track.album.images[0]?.url} />
									<TrackDetail>
										<div>{track.name}</div>
										<div>{track.artists[0].name}</div>
									</TrackDetail>
								</Container>
								{collections.map((collection, index) => (
									<SideStatus key={collection.id + track.id + index}>
										{track.collections[collection.id] ? (
											'✓'
										) : collection?.owner?.id === user.id ? (
											<AddButton onClick={(e) => handleAddTrack(e, collection, track.uri)}>Add</AddButton>
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
