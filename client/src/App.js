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
		const fetchData = async () => {
		const result = await fetch("/game");
		const response = await result.json();
		this.setState({
			squares: response.squares,
			stepNumber: response.stepNumber
		});
		}

		fetchData();
	}

	handleClick(i) {
		// Conduct game logic
		const squares = [...this.state.squares];
		const step = this.state.stepNumber;
		const xTurn = (step%2) === 0;
		if (calculateWinner(squares)) {
			return;
		}
        if ((squares[i] == 'X' && xTurn) || (squares[i] == 'O' && !xTurn)) {
			this.setState({ selected: i });
			return;
        }
		if (!legalMove(squares, this.state.selected, i)) {
			this.setState({ selected: null });
			return;
		}
		// Move piece
		squares[i] = xTurn ? 'X' : 'O';
		squares[this.state.selected] = null;
		// Removed captured if necessary
		if (Math.abs(this.state.selected - i) == 14) {
			if (xTurn) {
				squares[i + 7] = null;
			} else {
				squares[i - 7] = null;
			}
		} 
		else if (Math.abs(this.state.selected - i) == 18) {
			if (xTurn) {
				squares[i + 9] = null;
			} else {
				squares[i - 9] = null;
			}
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

	// Reset game
	resetGame() {
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
			<div>
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
	const moved = squares[from];
	if (moved == 'X') {
		if (from - to == 7 || from - to == 9 || 
				(from - to == 14 && squares[to+7] == 'O') || (from - to == 18 && squares[to+9] == 'O')) {
			return true;
		}
	}
	if (moved == 'O') {
		if (to - from == 7 || to - from == 9 || 
				(to - from == 14 && squares[from+7] == 'X') || (to - from == 18 && squares[from+9] == 'X')) {
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