import React from "react";
import "./App.css";

function App() {
  return (
    <Game />
  );
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			squares: null,
			stepNumber: null
		};
	}

	componentDidMount() {
		this.interval = setInterval(() => this.update(), 1000);
	}
	
	componentWillUnmount() {
		clearInterval(this.interval);
	}

	update() {
		const fetchData = async () => {
		const result = await fetch("/game");
		const response = await result.json();
		this.setState({
			squares: response.squares,
			stepNumber: response.stepNumber
		});
		}

		fetchData();
		console.log("fetched data")
	}

	handleClick(i) {
		// Update locally
		const squares = [...this.state.squares];
		const step = this.state.stepNumber;
			if (calculateWinner(squares) || squares[i]) {
				return;
			}
			squares[i] = (this.state.stepNumber%2) === 0 ? 'X' : 'O';
			this.setState({
				squares: squares,
				stepNumber: step + 1
			}, () => {
			// Update server
			const req = {
				method: "POST",
				headers: { "Content-Type" : 'application/json' },
				body: JSON.stringify(this.state)
			};
			fetch("/game", req);
		});
	}

	// Reset game
	resetGame() {
		this.setState({
			squares: Array(9).fill(null),
			stepNumber: 0
		}, () => {
		// Update server
		const req = {
			method: "POST",
			headers: { "Content-Type" : 'application/json' },
			body: JSON.stringify(this.state)
		};
		fetch("/game", req);
		});
	}

	render() {
		if (this.state.squares == null) {
			return(<div className='game-info'>
				<div>{"Loading..."}</div>
			</div>);
		}

		const winner = calculateWinner(this.state.squares);

		let status;
		if (winner) {
			status = 'Winner: ' + winner;
		} else {
			status = 'Next player: ' + ((this.state.stepNumber%2) === 0 ? 'X' : 'O');
		}

		return (
				<div className='game'>
					<div className='game-board'>
						<Board 
							squares={this.state.squares}
							onClick={(i) => this.handleClick(i)}
						/>
					</div>
					<div className='game-info'>
						<div>{status}</div>
						<button onClick={() => this.resetGame()}>Reset game</button>
					</div>
				</div>
		)
	}
}

function Square(props) {
	return (
		<button 
			className='square' 
			onClick={() => props.onClick()}
		>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square 
				value={this.props.squares[i]} 
				onClick ={() => this.props.onClick(i)}
			/>
		);
	}

	render() {
		return (
			<div>
				<div className='status'>{}</div>
				<div className='board-row'>
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
				</div>
					<div className='board-row'>
					{this.renderSquare(3)}
					{this.renderSquare(4)}
					{this.renderSquare(5)}
				</div>
				<div className='board-row'>
					{this.renderSquare(6)}
					{this.renderSquare(7)}
					{this.renderSquare(8)}
				</div>
			</div>
		);
	}
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}

export default App;