/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
const GAME_DIMENSION = 4;
const COLORS = {
    '': '#e2e0da', '2': '#DBE9EE', '4': '#C0D6DF',
    '8': '#4A6FA5', '16': '#166088', '32': '#4F6D7A',
    '64': '#FBC490', '128': '#FBAA60', '256': '#F67B50',
    '512': '#A82810', '1024': '#7A1735', '2048': '#3B0404',
};

const STATES = {
    'down': applyArrowDown,
    'up': applyArrowUp,
    'left': applyArrowLeft,
    'right': applyArrowRight,
};

function setCellObservers() {
    const observables = document.querySelectorAll('.value');

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            updateCellColor(mutation.target.parentElement);
        });
    });

    const config = {characterData: true, childList: true, subtree: true};

    observables.forEach(function(node) {
        observer.observe(node, config);
    });
}


function setupEmptyTable() {
    document.addEventListener('keydown', applyArrowButton);
    document.addEventListener('swiped', applyArrowSwipe);

    const board = document.querySelector('#board');

    for (r = 0; r < GAME_DIMENSION; r++) {
        for (c = 0; c < GAME_DIMENSION; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.innerHTML = `<div class='value'></div>`;
            board.append(cell);
        }
    }
    startNewGame();
    setCellObservers();
}

function startNewGame() {
    const values = document.querySelectorAll('.value');
    for (let i = 0; i < values.length; i++) {
        values[i].innerText = '';
    }
    setInitialNumbers();
    document.querySelector('#score-current').innerText = 0;
}


function applyArrowSwipe(event) {
    const direction = event.detail.dir.toLowerCase();
    applyArrowByDirection(direction);
}

function applyArrowButton(event) {
    const direction = event.key.substring(5).toLowerCase();
    applyArrowByDirection(direction);
}

function applyArrowByDirection(direction) {
    const currentState = getState();
    STATES[direction]();
    const newState = getState();
    if (JSON.stringify(currentState) != JSON.stringify(newState)) {
        pushNewNumber();
    }
}

function pushNewNumber() {
    const values = document.querySelectorAll('.value');
    const emptyValues = [];
    for (let i = 0; i < values.length; i++) {
        if (values[i].innerText === '') {
            emptyValues.push(values[i]);
        }
    }
    const randomCell = emptyValues[randomNumber(emptyValues)];
    const initialNumber = [2, 2, 2, 2, 4][Math.floor(Math.random() * 5)];
    randomCell.innerText = initialNumber;
}

function randomNumber(array) {
    return Math.floor(Math.random() * (array.length-1));
}

function setInitialNumbers() {
    const cells = document.querySelectorAll('.cell');
    const randomCell = cells[randomNumber(cells)];
    const initialNumber = [2, 4][Math.floor(Math.random() * 2)];

    randomCell.querySelector('.value').innerText = initialNumber;

    updateCellColor(randomCell);
}

function updateCellColor(cell) {
    cell.style.backgroundColor = COLORS[cell.innerText];
    Number(cell.innerText) < 5 ?
        cell.style.color = 'black' : cell.style.color = 'white';
}

function applyArrowRightLeft(currentState, direction) {
    const newState = [];
    for (let row = 0; row < 4; row++) {
        const currentRow = currentState[row];
        newState.push(calculateRowDirected(currentRow, direction));
    }
    return newState;
}

function applyNewState(newState) {
    const values = [].concat(...newState);
    const cells = document.querySelectorAll('.value');
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = values[i];
    }
}

function calculateRowDirected(row, direction) {
    /** Пересчитываем строку с учётом направления **/
    const directedRow = direction === 'left' ? row.reverse() : row;
    const calculatedRow = calculateRow(directedRow);
    return direction === 'left' ? calculatedRow.reverse() : calculatedRow;
}

function calculateRow(row) {
    /** Пересчитываем строку без учёта направления **/
    let sumCurrentScore = 0;
    let filteredRow = row.filter((n) => n);

    if (filteredRow.length > 0) {
        for (let i = filteredRow.length - 1; i >= 0; i--) {
            if (filteredRow[i] === filteredRow[i-1]) {
                filteredRow[i] = filteredRow[i] * 2;
                sumCurrentScore += filteredRow[i];
                filteredRow[i-1] = null;
                i--;
            }
        }

        updateScoreCurrent(sumCurrentScore);
        updateScoreBest();

        filteredRow = filteredRow.filter((n) => n);
        while (filteredRow.length < 4) {
            filteredRow.unshift('');
        }

        return filteredRow;
    }
    return row;
}

function applyArrowDown() {
    const state = getState();
    const stateTransposed = transpose(state);
    const newState = applyArrowRightLeft(stateTransposed, 'right');
    applyNewState(transpose(newState));
}


function applyArrowUp() {
    const state = getState();
    const stateTransposed = transpose(state);
    const newState = applyArrowRightLeft(stateTransposed, 'left');
    applyNewState(transpose(newState));
}

function applyArrowLeft() {
    const state = getState();
    const newState = applyArrowRightLeft(state, 'left');
    applyNewState(newState);
}

function applyArrowRight() {
    const state = getState();
    const newState = applyArrowRightLeft(state, 'right');
    applyNewState(newState);
}

function updateScoreCurrent(newScore) {
    const scoreValue = document.querySelector('#score-current');
    const existingScore = Number(scoreValue.innerText);
    scoreValue.innerText = existingScore + newScore;
}

function updateScoreBest() {
    const scoreCurrent = document.querySelector('#score-current');
    const scoreBest = document.querySelector('#score-best');
    if (Number(scoreCurrent.innerText) > Number(scoreBest.innerText)) {
        scoreBest.innerText = scoreCurrent.innerText;
    }
}

function getState() {
    const cells = document.querySelectorAll('.cell');
    const data = [];
    let row = [];
    for (let i = 0; i < cells.length; i++) {
        row.push(cells[i].innerText);
        if (row.length === GAME_DIMENSION) {
            data.push(row);
            row = [];
        }
    }
    return data;
};

function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}

setupEmptyTable();
