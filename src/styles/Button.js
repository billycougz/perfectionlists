import styled from 'styled-components';
import { colors } from './theme';

const getBackground = ({ green, white, outline }) => {
	if (white) {
		return outline ? 'none' : colors.white;
	}
	return outline ? 'none' : colors.green;
};

const getColor = ({ green, white, outline }) => {
	if (white) {
		return outline ? colors.white : colors.black;
	}
	return outline ? colors.green : colors.white;
};

const getBorder = ({ green, white, outline }) => {
	const color = white ? colors.white : colors.green;
	return `solid 1px ${color}`;
};

const Button = styled.button`
	background: ${getBackground};
	color: ${getColor};
	border: ${getBorder};
	display: inline-block;
	text-decoration: none;
	font-weight: 700;
	font-size: ${({ xs }) => (xs ? '10px' : '1em')};
	letter-spacing: 1px;
	text-transform: uppercase;
	border-radius: 50px;
	padding: ${({ xs, small }) => (xs ? '2px 5px' : small ? '5px 10px' : '11px 24px')};
	cursor: pointer;
	&:hover,
	&:focus {
		background: white;
		color: black;
		outline: 0;
		opacity: 0.75;
	}
`;

export default Button;
