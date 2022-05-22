import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { API } from 'aws-amplify';
import { handleLogout } from '../api/auth';
import Button from '../styles/Button';
import { colors } from '../styles/theme';
import { useState } from 'react';

const Container = styled.div`
	margin: 2em;
`;

const AccountContainer = styled.div`
	text-align: center;
	> div {
		margin: 1em;
	}
`;

const Link = styled.a`
	font-weight: bold;
	color: ${colors.green};
	text-decoration: none;
`;

const SuggestionsContainer = styled.div`
	textarea {
		margin-top: 1em;
		width: 100%;
	}
	input {
		margin: 0.5em 1em;
	}
	a {
		display: block;
		margin: auto;
		width: min-content;
		margin-top: 1em;
	}
`;

const Toast = styled.div`
	border-radius: 8px;
	color: #fff;
	display: inline-block;
	font-size: 16px;
	max-width: 450px;
	padding: 12px 36px;
	text-align: center;
	background: ${colors.green};
	bottom: 100px;
	left: 50%;
	transform: translate(-50%, 0px);
	position: fixed;
`;

const Settings = ({ user }) => {
	const [feedbackType, setFeedbackType] = useState('');
	const [feedbackMessage, setFeedbackMessage] = useState('');
	const [toast, setToast] = useState(false);

	const submitFeedback = async () => {
		const apiName = 'perfectionlistsApi';
		const path = '/feedback';
		const body = { id: uuidv4(), message: feedbackMessage, type: feedbackType };
		await API.post(apiName, path, { body });
		setToast(true);
		setTimeout(() => setToast(false), 3000);
		setFeedbackMessage('');
		setFeedbackType('');
	};

	return (
		<Container>
			<AccountContainer>
				Logged in as &nbsp;
				<Link href={user?.external_urls.spotify} target='_blank'>
					{user?.display_name}
				</Link>
				<div>
					<Button small onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</AccountContainer>

			<hr />

			<SuggestionsContainer>
				<h3>Feedback & Suggestions</h3>
				<input type='radio' name='feedback' value='feature' onChange={(e) => setFeedbackType(e.target.value)} />
				<label>Feature & Functionality Ideas</label>
				<br />
				<input type='radio' name='feedback' value='bug' onChange={(e) => setFeedbackType(e.target.value)} />
				<label>Bugs</label>
				<br />
				<input type='radio' name='feedback' value='general' onChange={(e) => setFeedbackType(e.target.value)} />
				<label>General</label>
				<br />
				<textarea
					rows='4'
					placeholder='Write a brief description...'
					value={feedbackMessage}
					onChange={(e) => setFeedbackMessage(e.target.value)}
				></textarea>
				<div>
					<Button small onClick={submitFeedback}>
						Submit
					</Button>
				</div>
				{toast && <Toast>Your feedback was submitted</Toast>}
			</SuggestionsContainer>
		</Container>
	);
};

export default Settings;
