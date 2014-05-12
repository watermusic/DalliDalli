var holder = document.getElementById('holder'),
    state = document.getElementById('status'),
    upload_message = document.getElementById('upload_message'),
    step_1 = document.getElementById('step-1'),
    step_2 = document.getElementById('step-2'),
    settingsform = document.getElementById('settingsform'),
    game_canvas = document.getElementById('game-canvas'),
    game_image = document.getElementById('game-image');

var IMAGE_NEXT = 0,
    TILES_NEXT = 1,
    TILES_ALL = 2;

var files = [],
    current_image = 0,
    delay = 2000,
    timer = null,
    random_cells;

var number_of_parts = 15,
    current_part = number_of_parts;

if (typeof window.FileReader === 'undefined') {
    state.classList.add('fail');
} else {
    state.classList.add('success');
    state.innerHTML = 'File API & FileReader available';
}

var reader = new FileReader(),
    img = new Image();

reader.onload = function (event) {
    // console.log(event.target);
    img.src = event.target.result;
    game_image.classList.remove('limit-height');
};

img.onload = function (event) {
    if (img.height > document.documentElement.clientHeight) {
        game_image.classList.add('limit-height');
    } else {
        var space = (document.documentElement.clientHeight - img.height) / 2;
        game_image.style.top = space + 'px';
    }

    game_image.src = this.src;

};

game_image.onload = function () {
    var dimension = [game_image.offsetWidth, game_image.offsetHeight];
    console.log(dimension);

    // to fix problems with same width rendered differently on different elements
    // better give the canvas 1 pixel more
    dimension[0]++;

    game_canvas.width = dimension[0];
    game_canvas.height = dimension[1];
    game_canvas.style.top = game_image.offsetTop + 'px';
    game_canvas.style.left = game_image.offsetLeft + 'px';


    VoronoiRenderer.init(game_canvas, number_of_parts, game_canvas.width, game_canvas.height);
    random_cells = [];

    for (var i = 0; i < number_of_parts; i++) {
        random_cells.push(i);
    }
    shuffle(random_cells);
    //holder.dispatchEvent(onImageNext);
    step(number_of_parts);
};

holder.ondragover = function () {
    this.className = 'hover';
    return false;
};
holder.ondragend = function () {
    this.className = '';
    return false;
};
holder.ondrop = function (e) {
    this.className = '';
    e.preventDefault();

    files = e.dataTransfer.files;

    upload_message.innerHTML = "Selected " + files.length + " files.";
    upload_message.classList.remove('hidden');
    step_1.classList.add('hidden');
    step_2.classList.remove('hidden');

    settingsform.addEventListener('input', numberOfParts_on_input);
    // and for IE 11
    document.getElementById('numberOfParts').addEventListener('change', numberOfParts_on_input);

    window.setTimeout(function () { // hide alert message
        upload_message.classList.add('hidden');
    }, delay);

    settingsform.addEventListener('submit', evaluate_settings_form);

    return false;
};


var onTilesAll = new CustomEvent("onTilesAll", {}),
    onImageNext = new CustomEvent("onImageNext", {}),
    onTilesNext = new CustomEvent("onTilesNext", {});

holder.addEventListener('onTilesAll', function(e) {
    console.info("alle Teile aufdecken");

    window.clearInterval(timer);

    step(TILES_ALL);
});

holder.addEventListener('onImageNext', function(e) {
    console.info("nächstes Bild");

    window.clearInterval(timer);

    step(IMAGE_NEXT);

    timer = window.setInterval(function () {
        console.info("delay dispatch onTilesNext");
        holder.dispatchEvent(onTilesNext);
    }, delay);

});

holder.addEventListener('onTilesNext', function(e) {
    console.info("nächstes Teil");
    step(TILES_NEXT);
});



function numberOfParts_on_input(e) {
    document.getElementById('numberOfPartsOutput').innerHTML = document.getElementById('numberOfParts').value;
}

function evaluate_settings_form(e) {
    e.preventDefault();
    number_of_parts = document.getElementById('numberOfParts').value;
    document.getElementById('header').classList.add('hidden');
    document.getElementById('jumbotron').classList.add('hidden');
    document.getElementById('container').className = 'container-fluid';
    game_canvas.classList.remove('hidden');
    game_image.classList.remove('hidden');
    game();
    return false;
}

function game() {
    document.getElementsByTagName("body")[0].style.backgroundColor = 'black';
    document.getElementById('start-button').disabled = true;

    // to hide everything
    game_canvas.style.top = '0';
    game_canvas.style.left = '0';
    game_canvas.width = document.documentElement.clientWidth;
    game_canvas.height = document.documentElement.clientHeight;

    var objContext = game_canvas.getContext('2d');
    objContext.fillStyle = "black";
    objContext.fillRect(0, 0, game_canvas.width, game_canvas.height);

    game_image.src = '';
    upload_message.classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    game_image.style.top = '0';
    game_canvas.classList.remove('hidden');
    // document.getElementById('game').height = document.documentElement.clientHeight;

    console.log(files[current_image]);
    reader.readAsDataURL(files[current_image]);
}

function step(n) {

    if(n > number_of_parts) {
        n = 0;
        current_part = number_of_parts;
    }

    if (n === 0) {
        current_image++;
        if (current_image >= files.length) {
            // reset everything
            current_image = 0;
            window.clearInterval(timer);
            game_canvas.classList.add('hidden');
            game_image.classList.add('hidden');
            document.getElementsByTagName("body")[0].style.backgroundColor = 'white';
            document.getElementById('start-button').disabled = false;
            document.onkeypress = null;
            document.getElementById('header').classList.remove('hidden');
            document.getElementById('jumbotron').classList.remove('hidden');
            document.getElementById('container').className = 'container';
            step_1.classList.remove('hidden');
            step_2.classList.add('hidden');
            window.location.reload();
        } else {
            game();
        }
    } else {
        var ctx = game_canvas.getContext('2d');
        ctx.clearRect(0, 0, game_canvas.width, game_canvas.height);

        if(n === TILES_NEXT){
            random_cells.pop();
        }

        if(n === TILES_ALL){
            random_cells.length = 0;
        }

        for (var i = 0; i <= random_cells.length; i++) {
            VoronoiRenderer.renderCell(random_cells[i], 'black', 'black');
        }
    }
}



document.onkeypress = function (e) {

    console.log(e.keyCode);

    switch(e.keyCode) {
        case 32:
            console.log("Space Key");
            holder.dispatchEvent(onTilesAll);
            break;
        case 13:
            console.log("Return Key");
            holder.dispatchEvent(onImageNext);
            break;
        case 43:
            console.log("Plus Key");
            holder.dispatchEvent(onTilesNext);
            break;
        case 45:
            console.log("Minus Key");
            step(2);
            break;
    }

//  32 - space
//  13 - return
//  43 - +
//  45 - -

//
//    step(1);
};

//timer = _.delay(function () {
//    step(n - 1);
//}, 3000);

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}