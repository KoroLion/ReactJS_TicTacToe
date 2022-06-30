function Square(props) {
    // todo: optional chaining?
    const value = (props.value)? props.value.value: '';
    const highlight = (props.value)? (props.value.highlight)? 'highlight': '': '';

    return (
        <button className={`square ${highlight}`} onClick={ props.onClick }>
            { value }
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, j, key) {
        return (
            <Square
                value={this.props.squares[i][j]}
                onClick={() => this.props.onClick(i, j)}
                key={key}
            />
        )
    }

    createBoardRows() {
        const boardRows = []
        for (let i = 0; i < this.props.size; i++) {
            const boardRow = []
            for (let j = 0; j < this.props.size; j++) {
                const key = i * this.props.size + j;
                const square = this.renderSquare(i, j, key)
                boardRow.push(square);
            }
            boardRows.push(<div className="board-row" key={i}>{ boardRow }</div>)
        }
        return boardRows;
    }

    render() {
        const boardRows = this.createBoardRows();

        return (
            <div>
                { boardRows }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState()
    }

    createHistory(state) {
        return {
            squares: state.squares,
            xIsNext: state.xIsNext,
            gameOver: state.gameOver
        }
    }

    getInitialState() {
        const state = {
            squares: Array(this.props.size).fill(Array(this.props.size).fill(null)),
            history: [],
            currentStep: 0,
            xIsNext: true,
            gameOver: false
        }
        state.history = [this.createHistory(state)]
        return state
    }

    getCharacter() {
        return (this.state.xIsNext)? 'X': 'O';
    }

    isGameOver(squares, i, j, c) {
        let endHorizontal = true;
        for (let k = 0; k < squares[i].length; k++) {
            const square = squares[i][k]
            const value = (square)? square.value: null;
            if (value !== c) {
                endHorizontal = false;
                break;
            }
        }
        if (endHorizontal) {
            return 'horizontal'
        }

        let endVertical = true;
        for (let k = 0; k < squares.length; k++) {
            const square = squares[k][j]
            const value = (square)? square.value: null;
            if (value !== c) {
                endVertical = false;
                break;
            }
        }
        if (endVertical) {
            return 'vertical'
        }

        let endMainDiagonal = true;
        for (let k = 0; k < squares.length; k++) {
            const square = squares[k][k]
            const value = (square)? square.value: null;
            if (value !== c) {
                endMainDiagonal = false;
                break;
            }
        }
        if (endMainDiagonal) {
            return 'mainDiagonal'
        }

        let endSecDiagonal = true;
        for (let k = 0; k < squares.length; k++) {
            const square = squares[k][squares.length - 1 - k]
            const value = (square)? square.value: null;
            if (value !== c) {
                endSecDiagonal = false;
                break;
            }
        }
        if (endSecDiagonal) {
            return 'secDiagonal'
        }

        return null;
    }

    handleClick(i, j) {
        if (this.state.squares[i][j] !== null || this.state.gameOver) {
            return
        }

        const history = this.state.history.slice(0, this.state.currentStep + 1)

        const newSquares = []
        this.state.squares.map(row => newSquares.push(Array.of(...row)))

        const c = this.getCharacter()
        newSquares[i][j] = {
            value: c,
            highlight: false
        }
        const gameOver = this.isGameOver(newSquares, i, j, c);
        if (gameOver === 'vertical') {
            for (let k = 0; k < newSquares.length; k++) {
                newSquares[k][j].highlight = true;
            }
        } else if (gameOver === 'horizontal') {
            for (let k = 0; k < newSquares[i].length; k++) {
                newSquares[i][k].highlight = true;
            }
        } else if (gameOver === 'mainDiagonal') {
            for (let k = 0; k < newSquares.length; k++) {
                newSquares[k][k].highlight = true;
            }
        } else if (gameOver === 'secDiagonal') {
            for (let k = 0; k < newSquares.length; k++) {
                newSquares[k][newSquares.length - 1 - k].highlight = true;
            }
        }

        const newStep = {
            squares: newSquares,
            xIsNext: !this.state.xIsNext
        }

        this.setState((state, props) => ({
            squares: newStep.squares,
            history: history.concat([newStep]),
            currentStep: state.currentStep + 1,
            xIsNext: newStep.xIsNext,
            gameOver: gameOver
        }))

        if (gameOver) {
            setTimeout(() => alert('GAME OVER!'), 0)
        }
    }

    reset() {
        this.setState(this.getInitialState())
    }

    jumpTo(i) {
        const step = this.state.history[i]

        this.setState({
            currentStep: i,
            squares: Array.of(...step.squares),
            xIsNext: step.xIsNext,
            gameOver: step.gameOver
        })
    }

    render() {
        const stepInfo = `Current step: #${this.state.currentStep}`;
        const status = `Current move: ${this.getCharacter()}`;

        const history = this.state.history.map((squares, i) => {
            const text = (i === 0)? `start`: `step #${i}`
            const className = (i === this.state.currentStep)? 'highlight': '';
            return <li key={i} onClick={() => this.jumpTo(i)} className={className}>Go to {text}</li>
        })

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        size={this.props.size}
                        squares={this.state.squares}
                        onClick={(i, j) => this.handleClick(i, j)}
                    />
                </div>
                <div className="game-info">
                    <div>{stepInfo}</div>
                    <div>{status}</div>

                    <div className="title">
                        <div><h2>History: </h2></div>
                        <div><button onClick={() => this.reset()}>RESET</button></div>
                    </div>
                    <ol>{history}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game size={3} />);
