

// define some stuff
const sleep = ms => new Promise(res => setTimeout(res, ms));
const canvas = document.querySelector('.myCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth; 
const height = canvas.height = window.innerHeight-100;

// define more variables
var center = [window.innerWidth/2,window.innerHeight/2];  // center of the screen
var pressedit = false;
var timestamps = [[],[],[]];
var squareactive = false;
var falseclick = [0,0,0];
var kpressed = [[],[],[]];
var kexpected = [[],[],[]];
var wrongclicks = [0,0,0];
var rightclicks = [0,0,0];
var pDominantTimestamps = [];
var qDominantTimestamps = [];
var pNonDominantTimestamps = [];
var qNonDominantTimestamps = [];
var currentround = 0;

// average function
function avg(arr){
  let u = 0;
  let total = 0;
  while (u < arr.length){
    total += arr[u];
    u += 1;
  }
  return total/arr.length;
}
function updateProgressBar(currentLevel, totalLevels) {
  const progressPercentage = (currentLevel / totalLevels) * 100;
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  progressBar.style.width = progressPercentage + '%';
  progressBar.setAttribute('aria-valuenow', progressPercentage);
  progressText.textContent = Math.round(progressPercentage) + '% of the survey completed';
}
// draw the cue rectangle in the center of the screen
function drawrect(){
  ctx.beginPath();
  ctx.strokeStyle = 'rgb(255,0,0)';
  ctx.lineWidth = 10;

  ctx.strokeRect(center[0]-center[1]/2,center[1]/2,center[1],center[1]);
}

// erase the rectangle (by drawing a white rectangle over it)
function eraserect(){
  ctx.beginPath();
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineWidth = 15;

  ctx.strokeRect(center[0]-center[1]/2,center[1]/2,center[1],center[1]);
}

// convert an array into a convenient form
function stringize(e){
  let y = 0;
  let returnstr = "";
  while (y < e.length){
    returnstr += e[y]+'NEXT';
    y += 1;
  }

  return returnstr;
}


// send data to the database
// send data to the database
function senddata() {
  let userid = sessionStorage.getItem('userid');
  let docid = sessionStorage.getItem('docid');
  // Prepare data to be sent
  let data = {
    user: userid,
    timestamps: {
      round1: timestamps[0],
      round2: timestamps[1],
      round3: timestamps[2]
    },
    keyPresses: {
      round1: kpressed[0],
      round2: kpressed[1],
      round3: kpressed[2]
    },
    expectedKeys: {
      round1: kexpected[0],
      round2: kexpected[1],
      round3: kexpected[2]
    },
    falseClicks: falseclick,
    rightClicks: rightclicks,
    wrongClicks: wrongclicks,
    pDominantTimes: stringize(pDominantTimestamps),
    qDominantTimes: stringize(qDominantTimestamps),
    pNonDominantTimes: stringize(pNonDominantTimestamps),
    qNonDominantTimes: stringize(qNonDominantTimestamps)
  };


}


// display the stats after each round
function dispstats(round) {
  let y = document.getElementById('statsdisp');
  y.textContent = "Results:";
  y = document.getElementById('statsdisp1');
  y.textContent = "Avg response time: " + avg(timestamps[round]) + " ms";
  y = document.getElementById('statsdisp2');
  y.textContent = "False clicks: " + falseclick[round];
  y = document.getElementById('statsdisp3');
  y.textContent = "Correct presses: " + rightclicks[round];
  y = document.getElementById('statsdisp4');
  y.textContent = "Wrong presses: " + wrongclicks[round];

  // Open the stats modal
  $('#statsModal').modal('show');
}

// make the stats disappear
function hidestats() {
  $('#statsModal').modal('hide');
}

function dispstats2() {
  document.getElementById('statsdisp').textContent = "Average Times:";
  document.getElementById('statsdisp1').textContent = "P (Dominant): " + avg(pDominantTimestamps) + " ms";
  document.getElementById('statsdisp2').textContent = "Q (Dominant): " + avg(qDominantTimestamps) + " ms";
  document.getElementById('statsdisp3').textContent = "P (Non-Dominant): " + avg(pNonDominantTimestamps) + " ms";
  document.getElementById('statsdisp4').textContent = "Q (Non-Dominant): " + avg(qNonDominantTimestamps) + " ms";
  // Open the stats modal
  $('#statsModal').modal('show');
}

function hidestats2() {
  $('#statsModal').modal('hide');
  $('#statsModal').on('hidden.bs.modal', function (e) {
    window.location.href = '../src_practice/memorytest.html';
  });
}


// list of letters to get a random letter from
let letters = 'abcdefghijklmnopqrstuvqxyz';

// define stuff
let rand = Math.floor(Math.random()*26);
var pressedkey = '';
var eachround = 10; // number of prompts per round

// get a random letter to use
var subjletter = letters.substring(rand,rand+1);

async function additionalLevel() {
var  rounds  = 3;
  // Instructions for the user
  let instructions = [
    { key: 'p', hand: 'dominant' },
    { key: 'q', hand: 'dominant' },
    { key: 'p', hand: 'non-dominant' },
    { key: 'q', hand: 'non-dominant' }
  ];

  for (let instruction of instructions) {
    document.getElementById('navbarTextContent').innerHTML = `Test 4: Press ${instruction.key.toUpperCase()} with your <span style="color: #F91604; font-weight: bold;">${instruction.hand.toUpperCase()}</span> hand when the square appears`;


    await sleep(1000);

    for (let i = 0; i < rounds; i++) {
      await sleep(Math.random() * 3500 + 1);
      drawrect();
      squareactive = true;
      let starttime = new Date();

      while (!pressedit) {
        await sleep(2);
      }

      pressedit = false;
      eraserect();

      let endtime = new Date();
      let elapsedtime = endtime - starttime;

      if (instruction.key === 'p' && instruction.hand === 'dominant') {
        pDominantTimestamps.push(elapsedtime);
      } else if (instruction.key === 'q' && instruction.hand === 'dominant') {
        qDominantTimestamps.push(elapsedtime);
      } else if (instruction.key === 'p' && instruction.hand === 'non-dominant') {
        pNonDominantTimestamps.push(elapsedtime);
      } else if (instruction.key === 'q' && instruction.hand === 'non-dominant') {
        qNonDominantTimestamps.push(elapsedtime);
      }
    }
  }

  // Display average times
  dispstats2();
  updateProgressBar(8,9);
  // Prepare and send data
  document.getElementById('navbarTextContent').textContent = "Sending data...";
  senddata();
  hidestats2();
}


(async () => {
  
  // level 1
  document.getElementById('navbarTextContent').textContent = "Press any key to proceed to Start the Keyboard Test";
  updateProgressBar(4,9);
  // wait until user presses a key
  squareactive = true;
  while (!pressedit){
    await sleep(2);
  }
  // set message
  document.getElementById('navbarTextContent').textContent = "Test 1: Press "+subjletter+" when the square appears";
  await sleep(1000);
  // repeat the test until all the trials are finished
  let u = 0;
  let passedtrials = 0;
  while (passedtrials < eachround){
    
    // wait for a random amount of time
    await sleep(Math.random()*3500+1);

    // render the cue on the screen
    drawrect();
    squareactive = true;

    // start the timer
    let starttime = new Date();

    // wait for the user to press any key
    while (!pressedit){
      await sleep(2);
    }

    // update and reset variables
    passedtrials += 1;
    pressedit = false;

    // erase the cue
    eraserect();

    // mark the end time and calculate response time
    let endtime = new Date();
    let elapsedtime = (endtime-starttime);

    // update stats based on user response
    if (pressedkey == subjletter){
      rightclicks[0] += 1;
    } else {
      wrongclicks[0] += 1;
    }

    // update data
    kpressed[0].push(pressedkey);
    kexpected[0].push(subjletter);
    timestamps[0].push(elapsedtime);

    u += 1;
  }

  // display stats and messagewhen they are done with the level
  dispstats(0);
  updateProgressBar(5,9);
  document.getElementById('navbarTextContent').textContent = "Press any key to proceed to level 2";

  // wait until the user presses any key to continue
  squareactive = true; // for temp
  while (!pressedit){
    await sleep(2);
  }

  // once user presses something, reset stuff
  squareactive = false; // go back
  pressedit = false;
  hidestats();


  // level 2

  // get two new random letters to use
  currentround += 1;
  rand = Math.floor(Math.random()*26);
  var subjletter1 = letters.substring(rand,rand+1);
  rand = Math.floor(Math.random()*26);
  var subjletter2 = letters.substring(rand,rand+1);

  passedtrials = 0;

  // keep giving trials until you finish the amount of trails necessary
  while (passedtrials < eachround){

    // generate a random number of 0 or 1
    rand = Math.floor(Math.random()*2);

    // either display one letter or the other letter based on the random number
    if (rand == 0){
      document.getElementById('navbarTextContent').textContent = "Test 2: Press "+subjletter1+" when the square appears";
      subjletter = subjletter1;
    } else {
      document.getElementById('navbarTextContent').textContent = "Test 2: Press "+subjletter2+" when the square appears";
      subjletter = subjletter2;
    }

    // wait for a random amount of time
    await sleep(Math.random()*3500+1);

    // draw the cue
    drawrect();
    squareactive = true;

    // wait for the user to press a letter
    let starttime = new Date();
    while (!pressedit){
      await sleep(2);
    }

    // update variables
    passedtrials += 1;
    pressedit = false;

    // erase the rectangle
    eraserect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // calculate elapsed time
    let endtime = new Date();
    let elapsedtime = (endtime-starttime);

    // figure out if the user pressed the right letter
    if (pressedkey == subjletter){
      rightclicks[1] += 1;
    } else {
      wrongclicks[1] += 1;
    }

    // update data
    kpressed[1].push(pressedkey);
    kexpected[1].push(subjletter);
    timestamps[1].push(elapsedtime);
    u += 1;
  }

  // display the stats from the second round
  dispstats(1);
  updateProgressBar(6,9);
  // update text display
  document.getElementById('navbarTextContent').textContent = "Press any key to proceed to level 3";

  // wait until user presses a key
  squareactive = true;
  while (!pressedit){
    await sleep(2);
  }

  // reset stuff and continue when the user presses a key
  squareactive = false;
  pressedit = false;
  hidestats();

  // go to next round
  currentround += 1;



  // level 3

  // repeat until user finishes the required trials
  passedtrials = 0;
  while (passedtrials < eachround){

    // generate a random letter
    rand = Math.floor(Math.random()*26);
    let subjletter3 = letters.substring(rand,rand+1);

    // update display to ask for letter
    document.getElementById('navbarTextContent').textContent = "Test 3: Press "+subjletter3+" when the square appears";

    // wait for a random amount of time
    await sleep(Math.random()*3500+1);

    // display the cue
    drawrect();
    squareactive = true;

    // start  time counting
    let starttime = new Date();

    // wait for user to press a key
    while (!pressedit){
      await sleep(2);
    }

    // update variables
    passedtrials += 1;
    pressedit = false;

    // erase the cue square
    eraserect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // calculate elapsed time
    let endtime = new Date();
    let elapsedtime = (endtime-starttime);

    // determine if the user pressed the correct letter
    if (pressedkey == subjletter3){
      rightclicks[2] += 1;
    } else {
      wrongclicks[2] += 1;
    }

    // update data
    kpressed[2].push(pressedkey);
    kexpected[2].push(subjletter3);
    timestamps[2].push(elapsedtime);

    u += 1;
  }
  
  // display stats for the last round 
  dispstats(2);
  updateProgressBar(7,9);
  document.getElementById('navbarTextContent').textContent = "Press any key to proceed to level 4";

  // wait until the user presses any key to continue
  squareactive = true; // for temp
  while (!pressedit){
    await sleep(2);
  }
  squareactive = false;
  pressedit = false;
  hidestats();
  await additionalLevel();
})();


(async () => {
  window.addEventListener("keydown", function(event) {
    if (event.defaultPrevented) {
      return;
    }

    // filter the key
    let actkey = event.code.replace('Key','').replace('Digit','')

    // respond to the click
    if (squareactive){
      // if the cue was currently being shown, then update the variables
      pressedit = true;
      squareactive = false;
      pressedkey = actkey.toLowerCase();
    } else {
      // the cue wasn't being shown, is a false click
      // ignore the click and update false click
      falseclick[currentround] += 1;
    }
  }, true);
})();
