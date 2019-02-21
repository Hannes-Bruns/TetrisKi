const convnetjs = require("./convnet.js");
const deepqlearn = require("./deepqlearn.js");
let fs = require('fs');

const PRINT_NET_ITERATION = 1000;
const PRINT_NET_MIN_ITERATION = 1000;

let iterationCounter = 0;
let player = prepareNet();

//-----------------------------------------------------
// check if a piece can fit into a position in the grid
//-----------------------------------------------------
function occupied(type, x, y, dir) {
    var result = false
    eachblock(type, x, y, dir, function (x, y) {
        if ((x < 0) || (x >= nx) || (y < 0) || (y >= ny) || getBlock(x, y))
            result = true;
    });
    return result;
}

function unoccupied(type, x, y, dir) {
    return !occupied(type, x, y, dir);
}

function run() {

    addEvents(); // attach keydown and resize events
    resize(); // setup all our sizing information
    reset();  // reset the per-game variables

}

function calcReward() {

}

function newRound() {

}

function prepareNet() {
    let num_inputs = 20 * 10 * 2; // Länge * Breite von Tetris * Besetzt und nicht Besetzt
    let num_actions = 4; // 4 Actions
    // let temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment :)
    // let network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;

    // the value function network computes a value of taking any of the possible actions
    // given an input state. Here we specify one explicitly the hard way
    // but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
    // to just insert simple relu hidden layers.
    var layer_defs = [];
    layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: num_inputs });
    layer_defs.push({ type: 'conv', sx: 1, filters: 16, stride: 1, pad: 0, activation: 'relu' });
    layer_defs.push({ type: 'conv', sx: 1, filters: 16, stride: 1, pad: 0, activation: 'relu' });
    layer_defs.push({ type: 'fc', num_neurons: 30, activation: 'relu' });
    layer_defs.push({ type: 'regression', num_neurons: num_actions });

    // options for the Temporal Difference learner that trains the above net
    // by backpropping the temporal difference learning rule.

    // hier war mal batch_size: 64 , evtl. wieder reinnehmen
    let tdtrainer_options = { learning_rate: 0.001, momentum: 0.0, batch_size: 32, l2_decay: 0.01 };

    let opt = {};
    opt.temporal_window = 8;
    opt.experience_size = 100000;
    opt.start_learn_threshold = 15000;
    opt.gamma = 0.8;
    opt.learning_steps_total = 200000;
    opt.learning_steps_burnin = 200;
    opt.epsilon_min = 0.05;
    opt.epsilon_test_time = 0.05;
    opt.layer_defs = layer_defs;
    opt.tdtrainer_options = tdtrainer_options;

    return new deepqlearn.Brain(num_inputs, num_actions, opt);
}