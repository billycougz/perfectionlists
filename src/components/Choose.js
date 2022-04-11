const Choose = ({ collections, onCollectionUpdate }) => (
	<>
		{[0, 1].map((index) => (
			<input key={index} onChange={(e) => onCollectionUpdate(index, e.target.value)} />
		))}
	</>
);

export default Choose;
