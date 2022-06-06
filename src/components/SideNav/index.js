import React from 'react';
import styled from 'styled-components';
import { colors } from '../../styles/theme';

const StyledNav = styled.div`
	background-color: rgb(0, 0, 0);
	width: 250px;
	overflow: scroll;
	height: calc(100vh - 70px);
	scrollbar-width: none; /* Firefox */
	&::-webkit-scrollbar {
		/* WebKit */
		width: 0;
		height: 0;
	}
	position: fixed;
	top: 0;
	left: 0;
	padding: 20px;
	@media (max-width: 768px) {
		display: none;
		width: 100%;
		box-sizing: border-box;
	}
	> h1 {
		margin-top: 0;
		> :nth-child(2) {
			font-weight: 100;
		}
	}
	> h2 {
		margin-top: 0;
		border-bottom: solid 1px;
		padding-bottom: 5px;
		font-size: 20px;
	}
`;

const PlaylistGrid = styled.div`
	display: grid;
	grid-template-columns: 10fr 1fr 1fr;
	gap: 1em;
	a {
		font-size: 12px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		cursor: pointer;
	}
`;

const Button = styled.button`
	border-radius: 10px;
	border-width: 1px;
	background: ${(props) => (props.isActive ? colors.green : 'white')};
	color: ${(props) => (props.isActive ? 'white' : 'black')};
	cursor: pointer;
	&:hover,
	&:focus {
		background: ${colors.green};
		color: white;
		outline: 0;
	}
`;

const CloseButton = styled(Button)`
	top: 8px;
	position: relative;
	float: right;
	@media (min-width: 769px) {
		display: none;
	}
`;

const SideNav = ({ collections, onPlaylistSelect, playlists }) => {
	const isActive = (index, playlist) => {
		return collections[index] ? collections[index].external_urls.spotify === playlist.external_urls.spotify : false;
	};

	const hideSideNav = () => {
		const sideNav = document.getElementById('side-nav');
		sideNav.style.display = 'none';
	};

	const handlePlaylistClick = (e, playlistUrl, name) => {
		if (window.confirm(`Open ${name} in Spotify?`)) {
			window.open(playlistUrl);
		}
	};

	return (
		<StyledNav id='side-nav'>
			<CloseButton onClick={hideSideNav}>Close</CloseButton>
			<h1>
				<span>Perfection</span>
				<span>lists</span>
			</h1>
			<h2>Your Library</h2>
			<PlaylistGrid>
				{playlists.map((playlist) => (
					<React.Fragment key={playlist.id}>
						<a onClick={(e) => handlePlaylistClick(e, playlist.external_urls.spotify, playlist.name)}>
							{playlist.name}
						</a>
						{['A', 'B'].map((side, index) => (
							<Button
								key={index}
								isActive={isActive(index, playlist)}
								onClick={() => onPlaylistSelect(index, playlist.external_urls.spotify)}
							>
								{side}
							</Button>
						))}
					</React.Fragment>
				))}
			</PlaylistGrid>
		</StyledNav>
	);
};

export default SideNav;
