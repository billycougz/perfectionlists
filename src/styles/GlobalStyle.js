import { createGlobalStyle } from 'styled-components/macro';
import { normalize } from 'styled-normalize';

const GlobalStyle = createGlobalStyle`
    ${normalize}
    body {
        background: rgb(18, 18, 18);
	    color: white;
	    height: 100%;
	    min-height: 100vh;
    }
`;

export default GlobalStyle;
