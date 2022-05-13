import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserPlaylists } from '../../api/spotify';
import SpotifyPNG from './spotify.png';
import { colors } from '../../styles/theme';

const StyledNav = styled.div`
	background-color: rgb(0, 0, 0);
	height: calc(100% - 100px);
	width: 205px;
	position: fixed;
	top: 0;
	left: 0;
	padding: 20px;
	@media (max-width: 768px) {
		display: none;
	}
	img {
		width: 131px;
		max-width: 100%;
		padding-bottom: 2em;
		@media (max-width: 768px) {
			display: none;
		}
	}
	#toolbox {
		bottom: 38px;
		left: 5px;
		position: relative;
		font-size: 18px;
		@media (max-width: 768px) {
			display: none;
		}
	}
	h2 {
		margin-top: 0;
		border-bottom: solid 1px;
		padding-bottom: 5px;
	}
`;

const PlaylistGrid = styled.div`
	display: grid;
	grid-template-columns: 10fr 1fr 1fr;
	gap: 1em;
	overflow: scroll;
	height: calc(100% - 110px);
	scrollbar-width: none; /* Firefox */
	&::-webkit-scrollbar {
		/* WebKit */
		width: 0;
		height: 0;
	}
	span {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
`;

const Button = styled.button`
	@media (min-width: 769px) {
		display: ${({ closeButton }) => (closeButton ? 'none' : 'initial')};
	}
	float: ${({ closeButton }) => (closeButton ? 'right' : 'initial')};
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

	const hideSideNav = () => {
		const sideNav = document.getElementById('side-nav');
		sideNav.style.display = 'none';
	};

	return (
		<StyledNav id='side-nav'>
			<Button closeButton onClick={hideSideNav}>
				Close
			</Button>
			<a href='https://open.spotify.com/search' target='_blank'>
				<img src={SpotifyPNG} />
			</a>
			<span id='toolbox'>Toolbox</span>
			<h2>Your Library</h2>
			<PlaylistGrid>
				{playlists.map((playlist) => (
					<React.Fragment key={playlist.id}>
						<span>{playlist.name}</span>
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
