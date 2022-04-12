import { useEffect, useState } from 'react';
import styled from 'styled-components';

const InputGroup = styled.div`
	width: 100%;
	margin-bottom: 10px;
	height: 65px;
	input {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid transparent;
		border-radius: 4px;
		color: #fff;
		font-size: 14px;
		height: 40px;
		padding: 0 12px;
		width: 100%;
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

const Choose = ({ collections, onCollectionUpdate }) => {
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
		<>
			{[0, 1].map((index) => (
				<InputGroup>
					<input key={index} onChange={(e) => handleInputChange(index, e.target.value)} value={inputValues[index]} />
				</InputGroup>
			))}
		</>
	);
};

export default Choose;
