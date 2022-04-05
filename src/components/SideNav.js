import styled from 'styled-components';

const StyledNav = styled.div`
	background-color: rgb(0, 0, 0);
	height: 100%;
	width: 250px;
	position: fixed;
	z-index: 1000;
	top: 0;
	left: 0;
	padding-top: 60px;
	@media (max-width: 768px) {
		display: none;
	}
`;

const SideNav = () => {
	return <StyledNav></StyledNav>;
};

export default SideNav;
