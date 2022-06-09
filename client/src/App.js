import React from "react";
import ReactDOM from 'react-dom/client';
import logo from "./logo.svg";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: []
    };
  }

  async componentDidMount() {
    const res = await fetch("/game");
    const data = await res.json();
    if (data.length == 0) {
      const data = [{ squares: Array(9).fill(null), }]
      const req = {
        method: "POST",
        headers: { "Content-Type" : 'application/json' },
        body: JSON.stringify({ history: data })
      };
      fetch("/game", req);
    }
    this.setState({ history: data });
    this.timer = setInterval(() => {
      const res = fetch("/game");
      const data = res.json();
      this.setState({ history: data });
    }, 1000);
  }

  render() {
    return (<Game history = {this.state.history} />)
  };
}

/*
 * Square is a 'function component' - a component 
 * 	that only contains a 'render' method. Thus, 
 * 	it is abbreviated.
 */
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

/*
 * Board contains more than just the 'render' method,
 *  so it cannot be abbreviated.
 */
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

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [],
			stepNumber: null,
			xIsNext: null,
		};
	}

  componentDidMount() {
    this.setState({
      history: this.props.history,
      stepNumber: this.props.history.length,
      xIsNext: (this.props.history.length % 2) === 0,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.history !== this.props.history) {
      this.setState({ 
        history: this.props.history,
        stepNumber: this.props.history.length,
        xIsNext: (this.props.history.length % 2) === 0,
      })
    }
  }

	handleClick(i) {
    // Update locally
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{
				squares: squares,
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});

    // Update server
    const req = {
      method: "POST",
      headers: { "Content-Type" : 'application/json' },
      body: JSON.stringify({ history: history })
    };
    fetch("/game", req);
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
		})
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		const moves = history.map((step, move) => {
			const desc = move ?
				'Go to move #' + move :
				'Go to game start';
			return (
				<li>
					<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		let status;
		if (winner) {
			status = 'Winner: ' + winner;
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className='game'>
				<div className='game-board'>
					<Board 
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className='game-info'>
					<div>{status}</div>
					<ol>{moves}</ol>
				</div>
			</div>
		)
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


/*
function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{!data ? "Loading..." : data}</p>
      </header>
    </div>
  );
}

export default App;
*/