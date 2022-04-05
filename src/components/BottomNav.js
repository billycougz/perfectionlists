import styled from 'styled-components';

const StyledNav = styled.div`
	background-color: rgb(24, 24, 24);
	border-top: 1px solid #282828;
	position: fixed;
	bottom: 0;
	width: 100%;
	height: 70px;
	z-index: 2000;
`;

const BottomNav = () => {
	return <StyledNav></StyledNav>;
};

export default BottomNav;
