import styled from 'styled-components';
import { colors } from '../styles/theme';

const Container = styled.div`
	border-radius: 8px;
	color: #fff;
	display: inline-block;
	font-size: 16px;
	padding: 12px 36px;
	text-align: center;
	background: ${colors.green};
	bottom: 100px;
	left: calc(50% + 250px);
	transform: translate(calc(-50% - 100px), 0);
	@media (max-width: 768px) {
		left: 50%;
		transform: translate(-50%, 0);
	}
	position: fixed;
	white-space: nowrap;
`;

const Toast = ({ children }) => <Container>{children}</Container>;

export default Toast;
