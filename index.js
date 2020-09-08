const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 7;
const cellsVertical = 6;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const maxVelocity = 8;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);


//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height / 2 , 2, height, {isStatic: true}),
    Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})
];
World.add(world, walls);


//Maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
};

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

const verticles = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    //if I have visitd the cell at [row, column], then return
    if(grid[row][column]){
        return;
    }

    //Mark this cell as been visited
    grid[row][column] = true;

    //Assemble randomly ordered list of neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    //For each neighbor...
    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour;

        //See if that neighbour is out of bounds
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue;
        }

        //If we have visited that neighbour, continue to next neighbour
        if(grid[nextRow][nextColumn]){
            continue;
        }

        //Remove a wall remove either horizontal or vertical array
        if(direction === 'left'){
            verticles[row][column - 1] = true;
        } else if (direction === 'right'){
            verticles[row][column] = true;
        } else if (direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if (direction === 'down'){
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow, nextColumn);
    }
    //Visit that next cell
}

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'skyblue'
                }
            }
        );
        World.add(world, wall);
    });
});

verticles.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'skyblue'
                }
            }
        );
        World.add(world, wall);
    });
});


//Goal

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.5,
    unitLengthY * 0.5,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);

World.add(world, goal);


//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'red'
        }
    }
);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const {x,y} = ball.velocity;
    
    if(event.keyCode === 87){
        Body.setVelocity(ball, {x, y: Math.max(y - 5, -maxVelocity)});
    }

    if(event.keyCode === 68){
        Body.setVelocity(ball, {x: Math.min(x + 5, maxVelocity), y});
    }

    if(event.keyCode === 83){
        Body.setVelocity(ball, {x, y: Math.min(y + 5, maxVelocity)});
    }

    if(event.keyCode === 65){
        Body.setVelocity(ball, {x: Math.max(x - 5, -maxVelocity), y});
    }
});

//win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            document.querySelector('.newGame').classList.remove('hidden');
            const restart = document.querySelector('#newGame');
            restart.addEventListener('click', newGame);
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })
        }
    });
});


const newGame = () => {
    location.reload();
    localStorage.clear();
};





