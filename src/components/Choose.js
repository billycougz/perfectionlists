import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from '../styles/Button';

const Container = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	height: calc(100vh - 140px);
	@media (max-width: 1000px) {
		flex-direction: column;
		flex-basis: auto;
		align-items: stretch;
	}
	> div {
		flex-basis: 50%;
		margin: 1em;
		@media (max-width: 1000px) {
			flex-basis: auto;
		}
		> div {
			max-width: 450px;
			margin: auto;
			padding: 0 1em;
		}
	}
`;

const TextBox = styled.div`
	h2 {
		margin-top: 0;
	}
	li {
		margin: 10px 0;
	}
	.icon {
		position: relative;
		bottom: 3px;
	}
`;

const InputGroup = styled.div`
	height: 100px;
	label {
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
	p {
		font-size: 11px;
		color: white;
		margin: 5px 0 5px 0;
		&:before {
			color: ${({ isValid }) => (isValid ? 'green' : 'red')};
			content: ${({ isValid }) => (isValid ? '"✓"' : '"✕"')};
			margin-right: 10px;
		}
	}
`;

const AlignCenter = styled.div`
	text-align: center;
`;

const Choose = ({ collections, onCollectionUpdate, onCompare }) => {
	const [inputValues, setInputValues] = useState(['', '']);

	useEffect(() => {
		const urls = collections.map((collection) => collection?.external_urls.spotify || '');
		setInputValues(urls);
	}, [collections]);

	const handleInputChange = (index, value) => {
		inputValues[index] = value;
		setInputValues(inputValues.slice());
		onCollectionUpdate(index, value);
	};

	return (
		<Container>
			<div>
				<TextBox>
					<h2>Choose the collections to compare.</h2>
					<p>
						Select a playlist from your library or copy the <b>Share</b> link from any playlist or album on Spotify.
					</p>
					<p>See Library</p>
					<p>Get from spotify</p>
					<p>
						To find a <b>Share</b> link on Spotify:
					</p>
					<ul>
						<li>
							Open a playlist or album in <b>Spotify</b>
						</li>
						<li>
							Click the <b className='icon'>...</b> icon
						</li>
						<li>
							Select <b>Share</b> then <b>Copy Link</b>
						</li>
					</ul>
					<Button white outline href='https://open.spotify.com/search' target='_blank'>
						Open Spotify
					</Button>
				</TextBox>
			</div>
			<div>
				<div>
					{['A', 'B'].map((side, index) => (
						<InputGroup key={index} isValid={collections[index]}>
							<label>Side {side}</label>
							<input
								key={index}
								onChange={(e) => handleInputChange(index, e.target.value)}
								value={inputValues[index]}
							/>
							{collections[index] && <p>{collections[index].name}</p>}
							{!collections[index] && inputValues[index] && <p>This link is not recognized</p>}
						</InputGroup>
					))}
					<AlignCenter>
						<Button onClick={onCompare}>Compare</Button>
					</AlignCenter>
				</div>
			</div>
		</Container>
	);
};

export default Choose;
