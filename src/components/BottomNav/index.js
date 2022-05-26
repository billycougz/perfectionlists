import styled from 'styled-components';
import SpotifyLogo from './spotify.png';
import ChooseSVG from './choose.svg';
import SettingsSVG from './settings.svg';

const StyledNav = styled.div`
	background-color: rgb(24, 24, 24);
	border-top: 1px solid #282828;
	position: fixed;
	bottom: 0;
	width: 100%;
	height: 70px;
	z-index: 2000;
	display: flex;
	justify-content: space-around;
`;

const NavItem = styled.div`
	opacity: ${(props) => (props.active ? 1 : 0.4)};
	padding: 2px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-evenly;
	cursor: pointer;
	img {
		height: 42px;
		padding-bottom: 5px;
		user-drag: none;
		-webkit-user-drag: none;
		user-select: none;
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}
	span {
		font-size: 11px;
	}
`;

const LogoContainer = styled.div`
	display: flex;
	flex-direction: column;
	> span {
		padding: 5px 0;
	}
	> a > img {
		height: 35px;
	}
`;

const BottomNav = ({ activeView, onNavChange }) => {
	const isChooseCompare = ['choose', 'compare'].some((view) => view === activeView);
	return (
		<StyledNav>
			<NavItem active={isChooseCompare} onClick={() => onNavChange('choose')}>
				<img src={ChooseSVG} />
			</NavItem>
			<NavItem active={activeView === 'settings'} onClick={() => onNavChange('settings')}>
				<img src={SettingsSVG} />
			</NavItem>
			<LogoContainer>
				<span>Powered by:</span>
				<a href='https://open.spotify.com/search' target='_blank'>
					<img src={SpotifyLogo} />
				</a>
			</LogoContainer>
		</StyledNav>
	);
};

export default BottomNav;
