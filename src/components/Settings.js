import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { API } from 'aws-amplify';
import { handleLogout } from '../api/auth';
import Button from '../styles/Button';
import { colors } from '../styles/theme';
import { useState } from 'react';
import Spinner from './Spinner';
import Toast from './Toast';

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
		background: rgba(255, 255, 255, 0.1);
		color: white;
		padding: 0.5em;
		border-radius: 5px;
	}
	button {
		display: block;
		margin: auto;
		width: min-content;
		margin-top: 1em;
	}
`;

const RadioContainer = styled.label`
	display: block;
	position: relative;
	padding-left: 35px;
	margin-bottom: 20px;
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;

	/* Hide the browser's default radio button */
	> input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
	}

	/* Create a custom radio button */
	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 25px;
		width: 25px;
		background-color: #eee;
		border-radius: 50%;
	}

	/* On mouse-over, add a grey background color */
	&:hover > input ~ .checkmark {
		background-color: #ccc;
	}

	/* When the radio button is checked, add a blue background */
	> input:checked ~ .checkmark {
		background-color: ${colors.green};
	}

	/* Create the indicator (the dot/circle - hidden when not checked) */
	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
	}

	/* Show the indicator (dot/circle) when checked */
	> input:checked ~ .checkmark:after {
		display: block;
	}

	/* Style the indicator (dot/circle) */
	.checkmark:after {
		top: 9px;
		left: 9px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: white;
	}
`;

const feedbackOptions = [
	{ label: 'Features & Functionality Ideas', value: 'feature' },
	{ label: 'Bugs', value: 'bug' },
	{ label: 'General', value: 'general' },
];

const Settings = ({ user }) => {
	const [feedbackType, setFeedbackType] = useState('');
	const [feedbackMessage, setFeedbackMessage] = useState('');
	const [toast, setToast] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const submitFeedback = async () => {
		setIsLoading(true);
		const apiName = 'perfectionlistsApi';
		const path = '/feedback';
		const body = { id: uuidv4(), message: feedbackMessage, type: feedbackType, emailAddress: user.email };
		await API.post(apiName, path, { body });
		setToast(true);
		setTimeout(() => setToast(false), 3000);
		setFeedbackMessage('');
		setFeedbackType('');
		setIsLoading(false);
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

			{!isLoading && (
				<SuggestionsContainer>
					<h3>Feedback & Suggestions</h3>

					{feedbackOptions.map((option) => (
						<RadioContainer>
							{option.label}
							<input
								checked={feedbackType === option.value}
								type='radio'
								name='feedback'
								value={option.value}
								onChange={(e) => setFeedbackType(e.target.value)}
							/>
							<span class='checkmark' />
						</RadioContainer>
					))}
					<textarea
						rows='4'
						placeholder='Write a brief description...'
						value={feedbackMessage}
						onChange={(e) => setFeedbackMessage(e.target.value)}
					></textarea>
					<div>
						<Button small disabled={!feedbackMessage || !feedbackType} onClick={submitFeedback}>
							Submit
						</Button>
					</div>
				</SuggestionsContainer>
			)}
			{isLoading && <Spinner leftAdjust />}
			{toast && <Toast>Feedback submitted</Toast>}
		</Container>
	);
};

export default Settings;
