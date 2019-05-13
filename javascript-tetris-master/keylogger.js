const deepqlearn = require("./deepqlearn.js");

var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
const PRINT_NET_ITERATION = 1000;
const PRINT_NET_MIN_ITERATION = 1000;
let piece;
let blocks;
let reward = 0;

let player = prepareNet();

export default function keydown_imp(ev) {
    var direction = "";
    switch (ev.keyCode) {
        case KEY.LEFT: direction = "left"; break;
        case KEY.RIGHT: direction = "right"; break;
        case KEY.UP: direction = "up"; break;
        case KEY.DOWN: direction = "down"; break;
    }

    var action = player.forward(blocks, piece);
    player.backward(reward);
    console.log(action);
    return direction;
}

export function getStats(piece_, blocks_) {
    piece = piece_;
    blocks = blocks_;
}

export function getReward() {

}

function prepareNet() {
    var num_inputs = 7 * 10 * 20 * 4; // 7 blocks, 10 Width, 20 Height and   4 postions for every block
    var num_actions = 4; // 4 rotations
    var temporal_window = 0; // amount of temporal memory. 0 = agent lives in-the-moment :)
    var network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

    // the value function network computes a value of taking any of the possible actions
    // given an input state. Here we specify one explicitly the hard way
    // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
    // to just insert simple relu hidden layers.
    var layer_defs = [];
    layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: network_size });
    layer_defs.push({ type: 'fc', num_neurons: 50, activation: 'relu' });
    layer_defs.push({ type: 'fc', num_neurons: 50, activation: 'relu' });
    layer_defs.push({ type: 'regression', num_neurons: num_actions });

    // options for the Temporal Difference learner that trains the above net
    // by backpropping the temporal difference learning rule.
    var tdtrainer_options = { learning_rate: 0.001, momentum: 0.0, batch_size: 64, l2_decay: 0.01 };

    var opt = {};
    opt.temporal_window = temporal_window;
    opt.experience_size = 30000;
    opt.start_learn_threshold = 1000;
    opt.gamma = 0.7;
    opt.learning_steps_total = 200000;
    opt.learning_steps_burnin = 3000;
    opt.epsilon_min = 0.05;
    opt.epsilon_test_time = 0.05;
    opt.layer_defs = layer_defs;
    opt.tdtrainer_options = tdtrainer_options;

    var b = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo
    b.learning = false;
    return b;
}

function newRound() {
    iterationCounter++;
    if (iterationCounter % PRINT_NET_ITERATION === 0 && iterationCounter > PRINT_NET_MIN_ITERATION) {
        // console.log(`Iteration: ${iterationCounter} winCounter --> x:${winCounter[X_PLAYER]} y:${winCounter[O_PLAYER]}`);
        let xBrainAsJson = JSON.stringify(player_X.value_net.toJSON());
        fs.writeFileSync(`./nets/X_net_iteration${iterationCounter}_winDiff_${winDiff}_date${getDate()}.json`, JSON.stringify(xBrainAsJson));
    }
    console.log(`Iteration: ${iterationCounter} `);
}

function getDate() {
    var a = new Date();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + '_' + min + '_' + sec;
    return time;
}