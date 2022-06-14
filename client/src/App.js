import React, { useState, useEffect } from "react";
import "./App.css"
import {
	BrowserRouter as Router,
	Routes,
	Route,
  } from "react-router-dom";
  import Game from "./Components/Game";

export default function App() {
	return (
		<Router>
			<div>
				<Routes>
					<Route path="/" element={<Game/>}/>
				</Routes>
			</div>
		</Router>
	);
}
/*
function App() {
  return (
    <Game />
  );
}

function Game() {
	const blankBoard = [null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null];
	const newBoard = [null, 'O', null, 'O', null, 'O', null, 'O',
		'O', null, 'O', null, 'O', null, 'O', null,
		null, 'O', null, 'O', null, 'O', null, 'O',
		null, null, null, null, null, null, null, null,
		null, null, null, null, null, null, null, null,
		'X', null, 'X', null, 'X', null, 'X', null,
		null, 'X', null, 'X', null, 'X', null, 'X',
		'X', null, 'X', null, 'X', null, 'X', null];

	const [id, setId] = useState();
	const [squares, setSquares] = useState(blankBoard);
	const [step, setStep] = useState();
	const [selected, setSelected] = useState();

	useEffect(() => {
		const interval = setInterval(() => update(), 2000);
		return () => {
			clearInterval(interval);
		}
	})

	// Checks with server and updates game appropriately
	function update() {
		if (id == null || id == -1) {
			return;
		}

		const fetchData = async () => {
			const result = await fetch("/game");
			const response = await result.json();
			if (response.step == -1) {
				fullReset();
			} else {
				setSquares(response.squares);
				setStep(response.step);
			}
		}

		if (step == null) {
			if (id == 2) {
				fetchData();
				return;
			}
			const fetchJoin = async () => {
				const result = await fetch("/join");
				const response = await result.json();
				if (response.players == 2) {
					fetchData();
				}
			}
			fetchJoin();
			return;
		}
		fetchData();
	}

	// Handles logic of user joining a game
	function joinGame() {
		const fetchJoin = async () => {
			const req = {
				method: "POST",
				headers: { "Content-Type" : 'application/json' },
				body: JSON.stringify({id: id})
			};
			const result = await fetch("/join", req);
			const response = await result.json();
			setId(response.id);
		}
		setId(0);
		fetchJoin();
	}

	// Handles logic of restarting existing game
	function restartGame() {
		setSquares(newBoard);
		setStep(0);
        setSelected(null);
		// Update server
		const req = {
			method: "POST",
			headers: { "Content-Type" : 'application/json' },
			body: JSON.stringify({squares: newBoard, step: 0})
		};
		fetch("/game", req);
	}

	// Handles logic of reseting server
	function fullReset() {
		setId(null);
		setSquares(blankBoard);
		setStep(null);
		setSelected(null);
		// Update server
		const req = {
			method: "POST",
			headers: { "Content-Type" : 'application/json' },
			body: JSON.stringify({id: -1})
		};
		fetch("/game", req);
	}

	// Handles logic after a square is clicked
	function handleClick(i) {
		// Check turn
		if (step%2 !== id%2) {
			return;
		}
		// Conduct game logic
		const newSquares = [...squares];
		const xTurn = (step%2) === 0;
		if (calculateWinner(squares)) {
			return;
		}
        if (((squares[i] == 'X' || squares[i] == 'K') && xTurn) || ((squares[i] == 'O' || squares[i] == 'Q') && !xTurn)) {
			setSelected(i);
			return;
        }
		if (!legalMove(squares, selected, i)) {
			setSelected(null);
			return;
		}
		// Move piece
		newSquares[i] = squares[selected];
		newSquares[selected] = null;
		// Promote piece if necessary
		if ((xTurn && i < 8) || (!xTurn && i > 55)) { 
			newSquares[i] = xTurn ? 'K' : 'Q'; 
		}
		// Removed captured if necessary
		if (Math.abs(selected - i) >= 14) {
			newSquares[(i + selected)/2] = null;
		} 
		// Update server
		const req = {
			method: "POST",
			headers: { "Content-Type" : 'application/json' },
			body: JSON.stringify({squares: newSquares, step: step+1})
		};
		fetch("/game", req);
		// Update locally
		setSquares(newSquares);
		setStep(step + 1);
		setSelected(null);
	}

	// Render game
	let message, buttons;
	if (id == null) {
		message = "Online checkers";
		buttons = <div><button onClick={() => joinGame()}>Start game</button></div>;
	}
	else if (id == -1) {
		message = "Game full";
		buttons = <div><button onClick={() => fullReset()}>Reset server</button></div>;
	}
	else if (step == null) {
		message = "Waiting for opponent...";
		buttons = <div><button onClick={() => fullReset()}>Reset server</button></div>;
	}
	else {
		const winner = calculateWinner(squares);
		if (winner) {
			if ((id == 0 && winner == 'X') || (id == 1 && winner == 'O')) {
				message = 'You win!';
			} else {
				message = 'You lose';
			}
		} else {
			if ((id == step%2)) {
				message = "Your turn!";
			} else {
				message = "Opponent's turn";
			}
		}
		buttons = (<div><button onClick={() => restartGame()}>Reset game</button>
			<button onClick={() => fullReset()}>Reset server</button></div>);
	}

	return (
		<div className='game'>
			<Board 
				squares={squares}
				onClick={(i) => handleClick(i)}
			/>
			<div className='game-info'>
				<div>{message}</div>
				{buttons}
			</div>
		</div>
	);
}

/*class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: null,
			squares: [null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null],
			stepNumber: null,
            selected: null
		};
	}

	componentDidMount() {
		this.interval = setInterval(() => this.update(), 2000);
	}
	
	componentWillUnmount() {
		clearInterval(this.interval);
	}

	update() {
		if (this.state.id == null || this.state.id == -1) {
			return;
		}

		const fetchData = async () => {
			const result = await fetch("/game");
			const response = await result.json();
			if (response.stepNumber == -1) {
				this.fullReset();
			} else {
				this.setState({
					squares: response.squares,
					stepNumber: response.stepNumber
				});
			}
		}

		if (this.state.stepNumber == null) {
			if (this.state.id == 2) {
				fetchData();
				return;
			}
			const fetchJoin = async () => {
				const result = await fetch("/join");
				const response = await result.json();
				if (response.players == 2) {
					fetchData();
				}
			}
			fetchJoin();
			return;
		}
		fetchData();
	}

	handleClick(i) {
		// Check turn
		if (this.state.stepNumber%2 !== this.state.id%2) {
			return;
		}
		// Conduct game logic
		const squares = [...this.state.squares];
		const step = this.state.stepNumber;
		const xTurn = (step%2) === 0;
		const captures = [-16, -14, 14, 16]; // Used for double capture logic
		if (calculateWinner(squares)) {
			return;
		}
        if (((squares[i] == 'X' || squares[i] == 'K') && xTurn) || ((squares[i] == 'O' || squares[i] == 'Q') && !xTurn)) {
			this.setState({ selected: i });
			return;
        }
		if (!legalMove(squares, this.state.selected, i)) {
			this.setState({ selected: null });
			return;
		}
		// Move piece
		squares[i] = squares[this.state.selected];
		squares[this.state.selected] = null;
		// Promote piece if necessary
		if ((xTurn && i < 8) || (!xTurn && i > 55)) { 
			squares[i] = xTurn ? 'K' : 'Q'; 
		}
		// Removed captured if necessary
		if (Math.abs(this.state.selected - i) >= 14) {
			squares[(i + this.state.selected)/2] = null;
		} 
        // Update locally
		this.setState({
			squares: squares,
			stepNumber: step + 1,
			selected: null
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

	// Join game
	joinGame() {
		const fetchJoin = async () => {
			const req = {
				method: "POST"
			};
			const result = await fetch("/join", req);
			const response = await result.json();
			this.setState({
				id: response.id,
			});
		}
		this.setState({
			id: 0,
		}, () => {
			fetchJoin();
		});
	}

	// Restart game
	restartGame() {
		this.setState({
			squares: [null, 'O', null, 'O', null, 'O', null, 'O',
				'O', null, 'O', null, 'O', null, 'O', null,
				null, 'O', null, 'O', null, 'O', null, 'O',
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				'X', null, 'X', null, 'X', null, 'X', null,
				null, 'X', null, 'X', null, 'X', null, 'X',
				'X', null, 'X', null, 'X', null, 'X', null],
			stepNumber: 0,
            selected: null
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

	// Reset server
	fullReset() {
		this.setState({
			id: null,
			squares: [null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null],
			stepNumber: null,
            selected: null
		}, () => {
		// Update server
		const req = {
			method: "POST",
			headers: { "Content-Type" : 'application/json' },
			body: JSON.stringify({id: -1})
		};
		fetch("/game", req);
		});
	}

	render() {
		if (this.state.id == null) {
			return (
				<div className='game'>
					<div className='game-board'>
						<Board 
							squares={this.state.squares}
							onClick={(i) => this.handleClick(i)}
						/>
					</div>
					<div className='game-info'>
						<div>{"Online checkers"}</div>
						<button onClick={() => this.joinGame()}>Start game</button>
					</div>
				</div>
			)
		}

		if (this.state.id == -1) {
			return (
				<div className='game'>
					<div className='game-board'>
						<Board 
							squares={this.state.squares}
							onClick={(i) => this.handleClick(i)}
						/>
					</div>
					<div className='game-info'>
						<div>{"Game full"}</div>
						<button onClick={() => this.fullReset()}>Reset server</button>
					</div>
				</div>
			)
		}

		if (this.state.stepNumber == null) {
			return (
				<div className='game'>
					<div className='game-board'>
						<Board 
							squares={this.state.squares}
							onClick={(i) => this.handleClick(i)}
						/>
					</div>
					<div className='game-info'>
						<div>{"Waiting for oponent..."}</div>
					</div>
				</div>
			)
		}

		const winner = calculateWinner(this.state.squares);

		let status;
		if (winner) {
			if ((this.state.id == 0 && winner == 'X') || (this.state.id == 1 && winner == 'O')) {
				status = 'You win!';
			} else {
				status = 'You lose';
			}
		} else {
			if ((this.state.id == this.state.stepNumber%2)) {
				status = "Your turn!";
			} else {
				status = "Opponent's turn";
			}
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
						<button onClick={() => this.restartGame()}>Reset game</button>
						<button onClick={() => this.fullReset()}>Reset server</button>
					</div>
				</div>
		)
	}
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square 
				number={i}
				value={this.props.squares[i]} 
				onClick ={() => this.props.onClick(i)}
			/>
		);
	}

	render() {
		return (
			<div className='game-board'>
				<div className='status'>{}</div>
				<div className='board-row'>
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
					{this.renderSquare(3)}
					{this.renderSquare(4)}
					{this.renderSquare(5)}
					{this.renderSquare(6)}
					{this.renderSquare(7)}
				</div>
				<div className='board-row'>
					{this.renderSquare(8)}
					{this.renderSquare(9)}
					{this.renderSquare(10)}
					{this.renderSquare(11)}
					{this.renderSquare(12)}
					{this.renderSquare(13)}
					{this.renderSquare(14)}
					{this.renderSquare(15)}
				</div>
				<div className='board-row'>
					{this.renderSquare(16)}
					{this.renderSquare(17)}
					{this.renderSquare(18)}
					{this.renderSquare(19)}
					{this.renderSquare(20)}
					{this.renderSquare(21)}
					{this.renderSquare(22)}
					{this.renderSquare(23)}
				</div>
				<div className='board-row'>
					{this.renderSquare(24)}
					{this.renderSquare(25)}
					{this.renderSquare(26)}
					{this.renderSquare(27)}
					{this.renderSquare(28)}
					{this.renderSquare(29)}
					{this.renderSquare(30)}
					{this.renderSquare(31)}
				</div>
				<div className='board-row'>
					{this.renderSquare(32)}
					{this.renderSquare(33)}
					{this.renderSquare(34)}
					{this.renderSquare(35)}
					{this.renderSquare(36)}
					{this.renderSquare(37)}
					{this.renderSquare(38)}
					{this.renderSquare(39)}
				</div>
				<div className='board-row'>
					{this.renderSquare(40)}
					{this.renderSquare(41)}
					{this.renderSquare(42)}
					{this.renderSquare(43)}
					{this.renderSquare(44)}
					{this.renderSquare(45)}
					{this.renderSquare(46)}
					{this.renderSquare(47)}
				</div>
				<div className='board-row'>
					{this.renderSquare(48)}
					{this.renderSquare(49)}
					{this.renderSquare(50)}
					{this.renderSquare(51)}
					{this.renderSquare(52)}
					{this.renderSquare(53)}
					{this.renderSquare(54)}
					{this.renderSquare(55)}
				</div>
				<div className='board-row'>
					{this.renderSquare(56)}
					{this.renderSquare(57)}
					{this.renderSquare(58)}
					{this.renderSquare(59)}
					{this.renderSquare(60)}
					{this.renderSquare(61)}
					{this.renderSquare(62)}
					{this.renderSquare(63)}
				</div>
			</div>
		);
	}
}

function Square(props) {
	if (isDark(props.number)) {
		return (
			<button 
				className='square-odd' 
				onClick={() => props.onClick()}
			>
				{props.value}
			</button>
		);
	} else {
		return (
			<button 
				className='square' 
				onClick={() => props.onClick()}
			>
				{props.value}
			</button>
		);
	}
}

// #### HELPER FUNCTIONS ###

function calculateWinner(squares) {
	let xAlive = false;
	let oAlive = false;
	for (let i = 0; i < squares.length; i++) {
		if (squares[i] == 'X') {
			xAlive = true;
		}
		if (squares[i] == 'O') {
			oAlive = true;
		}
		if (xAlive && oAlive) {
			return null;
		}
	}
	if (xAlive) return 'X';
	return 'O';
}

function legalMove(squares, from, to) {
	if (squares[to] != null) {
		return false;
	}
	const xPieces = ['X', 'K'];
	const oPieces = ['O', 'Q'];
	let moved = squares[from];
	if (xPieces.includes(moved)) {
		if (from - to == 7 || from - to == 9 || 
				(from - to == 14 && oPieces.includes(squares[to+7])) || 
				(from - to == 18 && oPieces.includes(squares[to+9])) ||
				(moved == 'K' && (to - from == 7 || to - from == 9)) ||
				(moved == 'K' && to - from == 14 && oPieces.includes(squares[from+7])) || 
				(moved == 'K' && to - from == 18 && oPieces.includes(squares[from+9]))) {
			return true;
		}
	}
	if (oPieces.includes(moved)) {
		if (to - from == 7 || to - from == 9 || 
				(to - from == 14 && xPieces.includes(squares[from+7])) || 
				(to - from == 18 && xPieces.includes(squares[from+9])) ||
				(moved == 'Q' && (from - to == 7 || from - to == 9)) ||
				(moved == 'Q' && from - to == 14 && xPieces.includes(squares[to+7])) || 
				(moved == 'Q' && from - to == 18 && xPieces.includes(squares[to+9]))) {
			return true;
		}
	}
	return false;
}

function isDark(num) {
	const darkSquares = [1, 3, 5, 7, 8, 10, 12, 14, 
		17, 19, 21, 23, 24, 26, 28, 30, 
		33, 35, 37, 39, 40, 42, 44, 46, 
		49, 51, 53, 55, 56, 58, 60, 62];
	for (let i = 0 ; i < 32; i++) {
		if (num == darkSquares[i]) {
			return true;
		}
	}
	return false;
}

export default App;

/*[null, 'O', null, 'O', null, 'O', null, 'O',
'O', null, 'O', null, 'O', null, 'O', null,
null, 'O', null, 'O', null, 'O', null, 'O',
null, null, null, null, null, null, null, null,
null, null, null, null, null, null, null, null,
'X', null, 'X', null, 'X', null, 'X', null,
null, 'X', null, 'X', null, 'X', null, 'X',
'X', null, 'X', null, 'X', null, 'X', null]*/