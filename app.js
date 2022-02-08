const GAME_DIMENSION = 4
const COLORS = {
    "": "#e2e0da", "2": "#DBE9EE", "4": "#C0D6DF",
    "8": "#4A6FA5", "16": "#166088", "32": "#4F6D7A",
    "64": "#FBC490", "128": "#FBAA60", "256": "#F67B50",
    "512": "#A82810", "1024": "#7A1735", "2048": "#3B0404", 
}

const STATES = {
    "down": applyArrowDown,
    "up": applyArrowUp,
    "left": applyArrowLeft,
    "right": applyArrowRight,
}

function setCellObservers() {
    const observables = document.querySelectorAll('.value');

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        updateCellColor(mutation.target.parentElement)
      })
    })
    
    const config = {characterData: true, childList: true, subtree: true}
    
    observables.forEach(function(node) {
        observer.observe(node, config)
      })
}


function setupEmptyTable() {
    score = document.querySelector("#score-value")
    document.addEventListener("keydown", applyArrowButton)
    document.addEventListener('swiped', applyArrowSwipe)

    const board = document.querySelector('#board')

    for (r = 0; r < GAME_DIMENSION; r++) {
        for (c = 0; c < GAME_DIMENSION; c++) {
            let cell = document.createElement('div')
            cell.classList.add('cell')
            cell.innerHTML = `<div class='value'></div>`
            // cell.addEventListener("click", cellClicked)  // TODO Delete
            board.append(cell)
        }
    }

    setInitialNumbers()
    setCellObservers()
}

function applyArrowSwipe(event) {
    const direction = event.detail.dir.toLowerCase()
    applyArrowByDirection(direction);
}

function applyArrowButton(event) {
    const direction = event.key.substring(5).toLowerCase()
    applyArrowByDirection(direction);
}

function applyArrowByDirection(direction) {
    const currentCtate = getState();
    STATES[direction](currentCtate);

    const newState = getState();
    if (JSON.stringify(currentCtate) != JSON.stringify(newState)) {
        pushNewNumber();
    }
}

function pushNewNumber(){
    const values = document.querySelectorAll('.value')
    let emptyValues = []
    for (let i = 0; i < values.length; i++) {
        if (values[i].innerText === "") {
            emptyValues.push(values[i])
        }
    }
    const randomCell = emptyValues[randomNumber(emptyValues)]
    const initialNumber = [2, 2, 2, 2, 4][Math.floor(Math.random() * 5)]
    randomCell.innerText = initialNumber

}
function cellClicked(event) { //TODO Delete
    let clickedValue = event.target.querySelector('.value')
    clickedValue.innerText ? clickedValue.innerText = clickedValue.innerText * 2 : clickedValue.innerText = 2 
}

function randomNumber(array) { 
    return Math.floor(Math.random() * (array.length-1))
}

function setInitialNumbers() {

    const cells = document.querySelectorAll('.cell')
    const randomCell = cells[randomNumber(cells)]
    const initialNumber = [2,4][Math.floor(Math.random() * 2)]

    randomCell.querySelector('.value').innerText = initialNumber

    updateCellColor(randomCell)

}

function updateCellColor(cell) {
    cell.style.backgroundColor = COLORS[cell.innerText];
    if (Number(cell.innerText) < 5) {
        cell.style.color = "black"
    }
    else {cell.style.color = "white"}
}

function calculateRowDirected(row, direction) {
    /** Пересчитываем строку с учётом направления **/
    const directedRow = direction === "left" ? row.reverse() : row
    const calculatedRow = calculateRow(directedRow)

    return direction === "left" ? calculatedRow.reverse() : calculatedRow
}

function calculateRow(row) {
    /** Пересчитываем строку без учёта направления **/

    let sumScore = 0
    let filteredRow = row.filter(n => n)

    if (filteredRow.length > 0) {
        for (let i = filteredRow.length - 1; i >= 0; i--) {
            if (filteredRow[i] === filteredRow[i-1]) {
                filteredRow[i] = filteredRow[i] * 2
                sumScore += filteredRow[i]
                filteredRow[i-1] = null
                i--
            }
        }

        addScore(sumScore)

        filteredRow = filteredRow.filter(n => n)
        while (filteredRow.length < 4) {
            filteredRow.unshift('')
        }
        
        return filteredRow
    }
    return row
}

function addScore(newScore) {
    const scoreValue = document.querySelector("#score-value")
    const existingScore = Number(scoreValue.innerText)
    scoreValue.innerText = existingScore + newScore
}

function applyArrowRightLeft(currentState, direction) {

    let newState = []

    for (let row = 0; row < 4; row++) {
        const currentRow = currentState[row]
        newState.push(calculateRowDirected(currentRow, direction))
    }
    return newState
}

function applyNewState(newState) {
    const values = [].concat(...newState)
    const cells = document.querySelectorAll('.value')
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = values[i]
    }
}

function applyArrowDown(state) {
    const stateTransposed = transpose(state)
    const newState = applyArrowRightLeft(stateTransposed, "rigth")
    applyNewState(transpose(newState))
}


function applyArrowUp(state) {
    const stateTransposed = transpose(state)
    const newState = applyArrowRightLeft(stateTransposed, "left")
    applyNewState(transpose(newState))
}

function applyArrowLeft(state) {
    const newState = applyArrowRightLeft(state, "left")
    applyNewState(newState)
}

function applyArrowRight(state) {
    const newState = applyArrowRightLeft(state, "rigth")
    applyNewState(newState)
}

function getState() {
    const cells = document.querySelectorAll('.cell')
    let data = []
    let row = []
    for (let i = 0; i < cells.length; i++) {
        row.push(cells[i].innerText)
        if (row.length === GAME_DIMENSION) {
            data.push(row)
            row = []
        }
    }
    return data
};

function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
  }

setupEmptyTable()
