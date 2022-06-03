import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getSearchResults } from '../api/spotify';
import Button from '../styles/Button';
import { colors } from '../styles/theme';

const Container = styled.div`
	min-height: calc(100vh);
	margin: 2em;
	padding-bottom: 2em;
	@media (max-width: 768px) {
		margin: 2em 1em;
	}
	> div {
		margin: 2em 0;
	}
`;

const TextBox = styled.div`
	@media (max-width: 480px) {
		background: white;
		color: black;
		padding: 1px 15px;
		border-radius: 10px;
	}
`;

const CollectionGroup = styled.div`
	margin: 2em 0;
`;

const InputGroup = styled.div`
	max-width: 400px;
	margin: auto;
	label {
		font-size: 1.25em;
		display: block;
		padding-bottom: 5px;
	}
	input {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid transparent;
		border-radius: 4px;
		color: #fff;
		font-size: 14px;
		height: 40px;
		width: 100%;
		box-sizing: border-box;
		padding: 0 12px;
	}
`;

const Suggestions = styled.div`
	margin: 1em 0;
	label {
		font-size: 1.25em;
		display: block;
		padding-bottom: 5px;
	}
	> div {
		white-space: nowrap;
		overflow: scroll;
		> div {
			width: 128px;
			display: inline-block;
			margin: 0 20px 0 0;
			text-align: center;
			> img {
				&:hover {
					opacity: 0.5;
					cursor: pointer;
				}
			}
			> p {
				text-overflow: ellipsis;
				overflow: hidden;
				margin: 5px 0;
			}
		}
	}
`;

const Link = styled.a`
	font-weight: bold;
	color: ${colors.green};
	text-decoration: none;
`;

const AlignCenter = styled.div`
	text-align: center;
`;

const Choose = ({ collections, onCollectionUpdate, onCompare }) => {
	const [inputValues, setInputValues] = useState(['', '']);
	const [searchTimeout, setSearchTimeout] = useState(null);
	const [suggestions, setSuggestions] = useState({});

	useEffect(() => {
		const collectionNames = collections.map((collection) => collection?.name || '');
		setInputValues(collectionNames);
		clearTimeout(searchTimeout);
		setSuggestions({});
	}, [collections]);

	const handleInputChange = async (index, value) => {
		console.log(value);
		inputValues[index] = value;
		setInputValues(inputValues.slice());
		onCollectionUpdate(index, value);
		clearTimeout(searchTimeout);
		if (value) {
			const timeout = setTimeout(async () => {
				const { albums, playlists } = await getSearchResults(value);
				suggestions.collectionIndex = index;
				suggestions.types = [
					{ type: 'Playlists', items: playlists.items },
					{ type: 'Albums', items: albums.items },
				];
				setSuggestions({ ...suggestions });
			}, 275);
			setSearchTimeout(timeout);
		} else {
			setSuggestions({});
		}
	};

	const handleSuggestionClick = (index, suggestion) => {
		inputValues[index] = suggestion.name;
		onCollectionUpdate(index, suggestion.external_urls.spotify);
		setInputValues(inputValues.slice());
		setSuggestions({});
	};

	const showSideNav = () => {
		const sideNav = document.getElementById('side-nav');
		sideNav.style.display = 'block';
	};

	const handleCompareClick = () => {
		return collections[0] && collections[1] ? onCompare() : alert('Choose two collections before clicking Compare');
	};

	const handleOpenSuggestion = (e, collectionUrl, name) => {
		if (window.confirm(`Open ${name} in Spotify?`)) {
			window.open(collectionUrl);
		}
	};

	return (
		<Container>
			<TextBox>
				<h2>Choose two collections.</h2>
				<p>
					Select a playlist from <Link onClick={showSideNav}>Your Library</Link>&nbsp;or use the text boxes to search
					for a playlist or album.
				</p>
				<p>
					The text boxes can also accept the <i>share</i> link for any Spotify playlist or album.&nbsp;
					<Link href='https://open.spotify.com/search' target='_blank'>
						Open Spotify
					</Link>
					&nbsp;to obtain a link.
				</p>
			</TextBox>
			<div>
				{['A', 'B'].map((side, index) => (
					<CollectionGroup key={index} isValid={collections[index]}>
						<InputGroup>
							<label>Side {side}</label>
							<input
								placeholder='Search or paste a link...'
								key={index}
								onChange={(e) => handleInputChange(index, e.target.value)}
								value={inputValues[index]}
							/>
						</InputGroup>

						{suggestions.collectionIndex === index &&
							suggestions.types.map(({ type, items }) => (
								<Suggestions>
									<label>{type}</label>
									<div>
										{items.map((suggestion) => (
											<div>
												<img
													height='128px'
													onClick={() => handleSuggestionClick(index, suggestion)}
													src={suggestion.images[0]?.url}
												/>
												<p>{suggestion.name}</p>
												<Button
													xs
													white
													onClick={(e) => handleOpenSuggestion(e, suggestion.external_urls.spotify, suggestion.name)}
												>
													Open Spotify
												</Button>
											</div>
										))}
									</div>
								</Suggestions>
							))}
					</CollectionGroup>
				))}
			</div>
			<AlignCenter>
				<Button onClick={handleCompareClick}>Compare</Button>
			</AlignCenter>
		</Container>
	);
};

export default Choose;
