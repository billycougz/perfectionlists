import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserPlaylists } from '../../api/spotify';
import SpotifyPNG from './spotify.png';
import { colors } from '../../styles/theme';

const StyledNav = styled.div`
	background-color: rgb(0, 0, 0);
	height: calc(100% - 100px);
	width: 215px;
	position: fixed;
	top: 0;
	left: 0;
	padding: 1em;
	@media (max-width: 768px) {
		display: none;
	}
	img {
		width: 131px;
		max-width: 100%;
		padding-bottom: 2em;
	}
`;

const PlaylistGrid = styled.div`
	display: grid;
	grid-template-columns: 10fr 1fr 1fr;
	gap: 1em;
	span {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
`;

const Button = styled.button`
	border-radius: 10px;
	border-width: 1px;
	background: ${(props) => (props.isActive ? colors.green : 'white')};
	cursor: pointer;
`;

const SideNav = ({ collections, onPlaylistSelect }) => {
	const [playlists, setPlaylists] = useState([]);

	useEffect(() => {
		const setAsyncValues = async () => {
			const { items } = await getUserPlaylists();
			setPlaylists(items);
		};
		setAsyncValues();
	}, []);

	const isActive = (index, playlist) => {
		return collections[index] ? collections[index].external_urls.spotify === playlist.external_urls.spotify : false;
	};

	return (
		<StyledNav>
			<a href='https://open.spotify.com/search' target='_blank'>
				<img src={SpotifyPNG} />
			</a>
			<PlaylistGrid>
				{playlists.map((playlist) => (
					<>
						<span>{playlist.name}</span>
						{['A', 'B'].map((side, index) => (
							<Button
								isActive={isActive(index, playlist)}
								onClick={() => onPlaylistSelect(index, playlist.external_urls.spotify)}
							>
								{side}
							</Button>
						))}
					</>
				))}
			</PlaylistGrid>
		</StyledNav>
	);
};

export default SideNav;
