// this file powers the mouse tests, also sends mouse data to the database

const firebaseConfig = {
  apiKey: "AIzaSyAnlwmmb-Wc_xDpW1Vli0cEMm7hbPk_tR8",
  authDomain: "pd-website-test.firebaseapp.com",
  projectId: "pd-website-test",
  storageBucket: "pd-website-test.appspot.com",
  messagingSenderId: "497582545475",
  appId: "1:497582545475:web:aaf3986c35bf5ba414d2f6"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// function to put arrays into a convenient form
function stringize(e){
  let y = 0;
  let returnstr = "";
  while (y < e.length){
    returnstr += e[y]+'NEXT';
    y += 1;
  }
  return returnstr;
}


// define some stuff we need
const sleep = ms => new Promise(res => setTimeout(res, ms));
const canvas = document.querySelector('.myCanvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'orange';
const width = canvas.width = window.innerWidth-10; 
const height = canvas.height = window.innerHeight-10;

// current mouse position
var mousepos = [0,0];

// send the data to the database
function senddata() {
  // Extract user ID from the URL
let userid = sessionStorage.getItem('userid');
let docid = sessionStorage.getItem('docid');


  // Prepare data to be sent
  let data = {
    user: userid,
    r1points: stringize(r1points),
    r2points: stringize(r2points),
    r3points: stringize(r3points),
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Send data to Firestore
// Send data to Firestore
db.collection("testData").doc(docid).set(data, { merge: true })
  .then(() => {
      console.log("Document updated for User ID: ", userid);
      // Redirect to the keyboard test after successful data submission
      document.getElementById('navbarTextContent').textContent = "Data sent! Launching keyboard tests...";
      window.open('../src/keyboard.html?' + userid, '_self');
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
  });

}
function updateProgressBar(currentLevel, totalLevels) {
  const progressPercentage = (currentLevel / totalLevels) * 100;
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  progressBar.style.width = progressPercentage + '%';
  progressBar.setAttribute('aria-valuenow', progressPercentage);
  progressText.textContent = Math.round(progressPercentage) + '% of the survey completed';
}

// make a number 0 if it is negative
function positify(i){
  if (i < 0){
    return 0;
  } else {
    return i;
  }
}


// define some stuff
// wid is how wide we want each small segment of the object to be
let wid = window.innerHeight/12;

// stores whether the user has started tracing the object or not
let started = false;

// stores the maximum x coordinate that the user has visited when tracing
let maxx = 0;

// the position last visited before the current position
let lastpos = [0,0];

// stores all the points that thes user has traced over at regular intervals
let r1points = [];
let r2points = [];
let r3points = [];

// reference time to base later timestamps on
let starttime = new Date();

// position of highlighter, which controls an animation indicating direction of tracing expected
let highlighter = 0;

// start and finish markings
ctx.font = "30px Arial";
ctx.fillStyle = 'black';
ctx.fillText("Start", 100, window.innerHeight/2+wid-10); 
ctx.fillText("Finish", window.innerWidth-110, window.innerHeight/2+wid-10); 
let windowHeight = window.innerHeight;
let windowWidth = window.innerWidth;


// level 1: tracing a straight line
(async () => {
  // while the user has not finished tracing, keep going
  while (true){

    // if the user's mouse enters the starting zone, start the timer and tracing
    if (mousepos[0] > 100 && mousepos[0] < 120 && mousepos[1] > windowHeight/2-wid && mousepos[1] < windowHeight/2){
      started = true;
    }

    //update the maximum x positon that the user has visited
    if (started && mousepos[0] >= maxx){
      maxx = mousepos[0];
    }

    // store whether the user's mouse is inside the expected region or not
    let inside = false;

    // render the object starting from x coordinate = 100, going to 45 pixels from the end of the screen
    let i = 100;
    while (i < windowWidth-45){
      
      // define the color of this part of the object based on highligter position
      let d = Math.abs(i-highlighter);
      let diff = 55-d;
      diff = positify(diff);

      // decide the color of the object based on mouse position and tracing status
      if (started && i < maxx){
        // if the user has already hovered over this part (the maximum x value reached is > the current x value of rendering)
        
        // determine whether the mouse is inside the object or not
        if (mousepos[1] > windowHeight/2-wid && mousepos[1] < windowHeight/2){
          // if so then make the onject black
          ctx.fillStyle = 'black';
          inside = true;
        
        } else {
          // otherwise, make the object gray
          ctx.fillStyle = 'gray';
          inside = false;
        }

      // if the user has not yet reached this spot in tracing
      } else {

        // color it based on highlighter position
        ctx.fillStyle = 'rgb('+(200+diff)+','+diff*2+',0)';
      }

      // fill in a rectangle that is part of the whole object
      ctx.fillRect(i,windowHeight/2-wid,2,wid);
      i += 1;
    }

    // calculate how far the mouse is from the centerline
    let deviation = mousepos[1]-(windowHeight/2-wid/2);

    // calculate timestamp
    var endtime = new Date();
    var dtime = endtime - starttime;

    // take a new measurement of data if it has been 500 miliseconds since the last measurement
    if (dtime > 500 && started){
      // ok its time 
      r1points.push(mousepos[0]+'s'+mousepos[1]+'s'+inside+'s'+deviation);
      console.log(r1points);
      starttime = new Date();
    }

    // move the highlighter a bit
    highlighter += 5;

    // if the highlighter has gone a lot beyond the end of the object, move it back to the start
    if (highlighter > windowWidth*1.5){
      highlighter = 0;
    }

    // if the user has reached the end of the object, then they are finished. break.
    if (maxx >= windowWidth-55){ // -45 is absolute finishing, but we have a bit of leeway
      break;
    }

  await sleep(2);
  }

windowHeight = window.innerHeight;
windowWidth = window.innerWidth;
wid = window.innerHeight/12;

  // update the displays
  document.getElementById('navbarTextContent').textContent = "Done!";
  updateProgressBar(1,9);
  await sleep(1000);
  document.getElementById('navbarTextContent').textContent = "Mouse Test 2: hover over the object in a rightward direction";


  // reset stuff
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  started = false;
  maxx = 0;
  highlighter = -100;

  // redraw start and finish marking
  ctx.font = "30px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText("Start", 100, windowHeight/2+ wid + windowHeight / 5+30); 
  ctx.fillText("Finish", windowWidth-110, windowHeight/2+wid+windowHeight/5+30); 

  // level 2: tracing a sine wave

  // keep going until the user finishes
  while (true){

    // if the user has entered starting zone, then start
    if (mousepos[0] > 100 && mousepos[0] < 120 && mousepos[1] > Math.sin(120/60)*windowHeight/5+windowHeight/2 && mousepos[1] < Math.sin(100/60)*windowHeight/5+windowHeight/2+wid){
      started = true;
    }

    // update the maximum x position the user has reached
    if (started && mousepos[0] >= maxx){
      maxx = mousepos[0];
    }

    // render the object from x = 100 to x = 45 px from the end
    let i = 100;
    while (i < windowWidth-45){
      
      // decide color of this segment based on highlighter position
      let d = Math.abs(i-highlighter);
      let diff = 55-d;
      diff = positify(diff);

      // if this segment has been traced by the user
      if (started && i < maxx){
       
        // turn segment black if the user is inside the object
        if (mousepos[1] > Math.sin(mousepos[0]/60)*windowHeight/5+windowHeight/2 && mousepos[1] < Math.sin(mousepos[0]/60)*windowHeight/5+windowHeight/2+wid){
          ctx.fillStyle = 'black';
          inside = true;
        } else {
          // otherwise turn the object gray
          ctx.fillStyle = 'gray';
          inside = false;
        }
      } else {
        // if the segemnt has not yet been traced by the user then color it based on highlighter position
        ctx.fillStyle = 'rgb('+(200+diff)+','+diff*2+',0)';
      }

      // render the segment
      ctx.fillRect(i,Math.sin(i/60)*windowHeight/5+windowHeight/2,2,wid);
      i += 1;
    }
    
    // calculate timestamp
    var endtime = new Date();
    var dtime = endtime - starttime;

    // if data was last measured more than 500 miliseconds ago, take another measurement and store it
    if (dtime > 500 && started){
      r2points.push(mousepos[0]+'s'+mousepos[1]+'s'+inside);
      console.log(r2points);
      starttime = new Date();
    }

    // update highlighter, and reset it if it has gone too far
    highlighter += 5;
    if (highlighter > windowWidth*1.5){
      highlighter = 0;
    }

    // if the user has finished tracing, then break
    if (maxx >= windowWidth-55){ // -45 is absolute finishing, but we have a bit of leeway
      break;
    }

    await sleep(2);
  }

windowHeight = window.innerHeight;
windowWidth = window.innerWidth;
wid = window.innerHeight/12;

  // update the display
  document.getElementById('navbarTextContent').textContent = "Done!";
  updateProgressBar(2,9);
  await sleep(1000);
  document.getElementById('navbarTextContent').textContent = "Mouse Test 3: hover over the object in a clockwise direction";

  // reset stuff
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  started = false;
  maxx = 0;
  highlighter = -100;

  // redraw start and finish markings
  ctx.font = "30px Arial";
  ctx.fillStyle = 'black';

  ctx.fillText("Start", window.innerWidth/2+50, 2*window.innerHeight/3-10); 
  ctx.fillText("Finish", window.innerWidth/2+window.innerHeight/2-10, 2*window.innerHeight/3+140); 



  // level 3: tracing a spiral
  while (true){

    // clear the screen
    //ctx.clearRect(0,0,windowWidth,windowHeight);

    // set the min and max radii
    let minrad = windowHeight/30;
    let maxrad = windowHeight/2;

    // is the user tracing inside the object or not
    let inside = false;

    // i represents the current angle what the spiral segment is rendering at
    let i = 0; 
    while (i < 360){

      // define how the highlighter will color this segment
      let d = Math.abs(i-highlighter);
      let diff = 55-d;
      diff = positify(diff);

      // set the width of the segment to be drawn
      ctx.lineWidth = wid;

      // if user has entered starting zone, then start
      if (windowWidth/2 < mousepos[0] && windowWidth/2+wid > mousepos[0] && 2*windowHeight/3 < mousepos[1] && 2*windowHeight/3+wid > mousepos[1]){
        started = true;
      }

      // calculate angle and positions to render at right now
      let thisrad = (maxrad-minrad)*(i/360)+minrad;

      // figure out whether the mouse is inside the region right now or not
      if (mousepos[0] > thisrad*Math.cos((Math.PI/180)*i)+windowWidth/2 && mousepos[0] < thisrad*Math.cos((Math.PI/180)*i)+windowWidth/2+wid && mousepos[1] > thisrad*Math.sin((Math.PI/180)*i)+2*windowHeight/3 && mousepos[1] < thisrad*Math.sin((Math.PI/180)*i)+2*windowHeight/3+wid){
        inside = true;

        // if the mouse is inside, then set the maximum angle holder variable as the current angle
        if (i > maxx && started){
          maxx = i;
        }
      }

      // if the user has already covered this 
      if (maxx > i){
        // change the color based on whether the user is inside the object or not
        if (inside){
          ctx.fillStyle = 'black';
        } else {
          ctx.fillStyle = 'gray';
        }

      // if the user hasn't yet traced this segment, color it according to the highlighter
      } else {
        ctx.fillStyle = 'rgb('+(200+diff)+','+diff*2+',0)';
      }

      // render this segment
      ctx.fillRect(thisrad*Math.cos((Math.PI/180)*i)+windowWidth/2,thisrad*Math.sin((Math.PI/180)*i)+2*windowHeight/3,wid,wid);
      
      i += 1;
    }

    // calculate the timestamp
    var endtime = new Date();
    var dtime = endtime - starttime;

    // if it has been 500 miliseconds since last data measure, measure and store data again
    if (dtime > 500 && started){
      r3points.push(mousepos[0]+'s'+mousepos[1]+'s'+inside);
      console.log(r3points);
      starttime = new Date();
    }

    // update highlighter, reset if it has gone too far
    highlighter += 2;
    if (highlighter > 450){
      highlighter = -100;
    }

    // if the user has finished tracing, then break.
    if (maxx >= 357){ // 360 is absolute finishing, but we have a bit of leeway
      break;
    }

    await sleep(2);
  }

  document.getElementById('navbarTextContent').textContent = "Done!";
  updateProgressBar(3,9);
  await sleep(1000);
  document.getElementById('navbarTextContent').textContent = "Mouse Test 4: Click on the Red Dots as they appear on screen";
  await sleep(1000);
  // Game variables
let gameData = [];
let dotCount = 10; // Number of dots to display
let dotInterval = 500; // Interval between dots in milliseconds

// Function to generate a random position within the canvas
function getRandomPosition() {
  // Define the margin
  const margin = 150;

  // Calculate the maximum x and y values inside the margin
  const maxX = canvas.width - margin * 2;
  const maxY = canvas.height - margin * 2;

  // Generate random x and y positions within the margin boundaries
  let x = Math.random() * maxX + margin;
  let y = Math.random() * maxY + margin;

  return { x, y };
}


// Function to display a dot and record data
function displayDot() {
  if (dotCount === 0) {
    endGame();
    return;
  }

  let position = getRandomPosition();
  let appearanceTime = new Date().getTime();

  // Draw the dot
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous dot
  ctx.beginPath();
  ctx.arc(position.x, position.y, 40, 0, 2 * Math.PI); // 40 is dot radius
  ctx.fillStyle = 'red';
  ctx.fill();

  // Defines the click handler as a separate function so it can be removed later
  function handleDotClick(event) {
    let clickTime = new Date().getTime();
    let reactionTime = clickTime - appearanceTime;
    let distance = Math.sqrt(Math.pow(event.clientX - position.x, 2) + Math.pow(event.clientY - position.y, 2));

    // Checks if the dot was clicked (within a certain radius)
    if (distance <= 40) { // 40 is dot radius
      gameData.push({ reactionTime });
      dotCount--;
      canvas.removeEventListener('click', handleDotClick); // Removes the event listener after a click
      setTimeout(displayDot, dotInterval); // Displays next dot after interval
    }
  };

  // Add the event listener for click
  canvas.addEventListener('click', handleDotClick);
}

// Function to end the game and send data
function endGame() {
  canvas.onclick = null; // Remove event listener
  sendGameData();
  // once user has finished this level, send the data
  document.getElementById('navbarTextContent').textContent = "Sending data...";
  senddata();
  updateProgressBar(4,9);
}

// Function to send game data to Firebase
function sendGameData() {
let userid = sessionStorage.getItem('userid');
let docid = sessionStorage.getItem('docid');
  let data = { user: userid, gameData };

  db.collection("testData").doc(docid).set({ gameData: data }, { merge: true })
    .then(() => {
      console.log("Game data sent for User ID: ", userid);
    })
    .catch((error) => {
      console.error("Error sending game data: ", error);
    });
}

// Start the game
displayDot();

})();





