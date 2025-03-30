// Let's pick a water threshold for “sea level”
let waterLevel = 0.08; 
let hmScale = 20;
let hmVisScale = 0.1
// Prepare a 2D array to store noise values
let terrain = [];
let waterLive = [];
let waterBuffer = [];
let viscosity = 0.05;
let marsMap;
// Adjust these to whatever final grid size you want
let desiredCols = 800;
let desiredRows = 400;
let t = 0;

function preload() {
  // Replace with your actual local file or URL path for the MOLA heightmap
  // e.g. "mola_mars_heightmap.jpg" or an online image URL
  marsMap = loadImage('molaPNG.png');
}

function setup() {
  createCanvas(1600, 400);


  // You can tweak this noise scale to stretch/compress features
  let noiseScale = 0.02;

  // Generate noise for each pixel (x,y)
  for (let x = 0; x < width/2; x++) {
    terrain[x] = [];
    waterLive[x] = [];
    for (let y = 0; y < height; y++) {
      //terrain[x][y] = noise(x * noiseScale, y * noiseScale);
      waterLive[x][y] = waterLevel;

    }
  }
  loadHeightMap()

  waterBuffer = structuredClone(waterLive);
  console.log(calcWaterTotal());
  // for(let t = 0; t<200; t++)
  // {
  //   physicsTick2(t);
  //   display();
  // }
  console.log(calcWaterTotal());
  //noLoop();   // We'll just render once
}

function draw() {
  t++;
  background(220);
  physicsTick2(t);
  loadPixels();
  if(random(0,100)<5)
  {
    console.log(calcWaterTotal());
    console.log("On tick ");
    console.log(t);
  }
  // Left half: draw water if below waterLevel, otherwise land
  for (let x = 0; x < width / 2; x++) {
    for (let y = 0; y < height; y++) {
      let h = terrain[x][y];
      // If the noise value is below the water level, it's underwater
      // if (h < waterLevel) {
      //   // Depth factor (0 to 1) based on how far below waterLevel it is
      //   let depthFactor = (waterLevel - h) / waterLevel;
      //   // Deeper = darker blue
      //   set(x, y, color(0, 0, 255 * depthFactor));
      // } else {
      //   // Above water is land
      //   set(x, y, color(139, 69, 19)); // a brownish color
      // }
      let depthFactor = waterLive[x][y];
      
      //coloring scheme A
      set(x,y,color(0,0,1505*depthFactor));

      //coloring scheme B
      // if(depthFactor>0.1)
      // {
      //   set(x,y,color(0,0,200));
      // }

      //freaksout if depth goes negative
      if(depthFactor<0)
      {
        set(x,y,color(255,0,0));
      }
    
    }
  }
  // Right half: show the raw heightmap in grayscale
  for (let x = 0; x < width/2; x++) 
  {
    for (let y = 0; y < height; y++) 
    {
      let h = terrain[x][y];
      let c = hmVisScale*h * 255; // map noise [0..1] -> grayscale [0..255]
      set(x+width/2, y, color(c));
    }
  }

  updatePixels();
}

///This function should shift water totally
function physicsTick(time)
{
  ///Change in depth per tick is equal to some constant times the gradient of the depth scalar field
  for (let x = 0; x < width/2; x++) 
  {
    for (let y = 0; y < height; y++) 
    {
      // let tOff = int(random(0,3))*PI/2;//start looping around cells from random side each time
      let tOff = 0;
      let deltaHTotal = 0;
      for(let t = 0; t< 2*PI; t+=PI/2)
      {
        let targetX = x+int(sin(t+tOff));
        let targetY = y+int(cos(t+tOff));
        let targetH = 0;
        if(targetX<0 || targetX>=width/2 || targetY<0 || targetY>=height)
        {
          targetH =  waterLive[x][y]+terrain[x][y]// walls at same height as neighbours
        }
        else
        {
          targetH = waterLive[targetX][targetY]+terrain[targetX][targetY];
        }
        deltaHTotal += viscosity*(targetH - waterLive[x][y]-terrain[x][y]);
      }
      //Shift the water in the buffer after enforcing boundary condition, depth>0
      if(waterBuffer[x][y]-deltaHTotal<0 || waterBuffer[targetX][targetY]+deltaHTotal<0)
      {
        deltaHTotal = min(waterBuffer[x][y],waterBuffer[targetX][targetY]);
      }
      waterBuffer[x][y]+=deltaHTotal;
    }
  }
  waterLive = structuredClone(waterBuffer);
  if (calcWaterTotal()<0)
  {
    console.log("I just went negative on");
    console.log(time);
  }
}

///This function should shift water totally, attempt 2
function physicsTick2(time)
{
  ///Change in depth per tick is equal to some constant times the gradient of the depth scalar field
  for (let x = 0; x < width/2; x++) 
  {
    for (let y = 0; y < height; y++) 
    {
      let tOff = int(random(0,3))*PI/2;//start looping around cells from random side each time
      //let tOff = 0;
      let deltaHTotal = 0;
      for(let t = 0; t< 2*PI; t+=PI/2)
      {
        let targetX = x+int(sin(t+tOff));
        let targetY = y+int(cos(t+tOff));
        let targetH = 0;
        let deltaH = 0;
        if(targetX<0 || targetX>=width/2 || targetY<0 || targetY>=height)
        {
          //do nothing, yay
        }
        else
        {
          targetH = waterLive[targetX][targetY]+terrain[targetX][targetY];
          deltaH = viscosity*(targetH - waterLive[x][y]-terrain[x][y]);
          if(waterBuffer[x][y]+deltaH<0 || waterBuffer[targetX][targetY]-deltaH<0)
          {
            deltaH = min(waterBuffer[x][y],waterBuffer[targetX][targetY]);            
          }
          waterBuffer[x][y] += deltaH;
          waterBuffer[targetX][targetY] -= deltaH;

        }
        

      }

    }
  }
  waterLive = structuredClone(waterBuffer);
  if (calcWaterTotal()<0)
  {
    console.log("I just went negative on");
    console.log(time);
  }
}


function calcWaterTotal()
{
  let waterTotal = 0;
  for (let x = 0; x < width/2; x++) 
    {
      for (let y = 0; y < height; y++) 
      {
        waterTotal+=waterLive[x][y];
      }
    }
  return waterTotal;
}

function loadHeightMap()
{
  // 1) Load underlying pixel data from the Mars map
  marsMap.loadPixels();

  // 2) Fill our 2D array, terrain[x][y]
  for (let x = 0; x < desiredCols; x++) {
    terrain[x] = []; 
    for (let y = 0; y < desiredRows; y++) {
      // Map our discrete x,y onto the actual pixel coordinates in the image
      let imgX = floor(map(x, 0, desiredCols - 1, 0, marsMap.width - 1));
      let imgY = floor(map(y, 0, desiredRows - 1, 0, marsMap.height - 1));

      let idx = 4 * (imgY * marsMap.width + imgX);
      let r = marsMap.pixels[idx + 0];
      let g = marsMap.pixels[idx + 1];
      let b = marsMap.pixels[idx + 2];

      // Average RGB if it’s a color image. 
      // If it’s purely grayscale, you might just use r or any channel.
      let altitude = hmScale*(r + g + b) / 1200.0;

      // Store the altitude (0..255) in the terrain array
      terrain[x][y] = altitude;
    }
  }
}

function display()
{
  background(220);
  
  loadPixels();

  // Left half: draw water if below waterLevel, otherwise land
  for (let x = 0; x < width / 2; x++) {
    for (let y = 0; y < height; y++) {
      let h = terrain[x][y];
      // If the noise value is below the water level, it's underwater
      // if (h < waterLevel) {
      //   // Depth factor (0 to 1) based on how far below waterLevel it is
      //   let depthFactor = (waterLevel - h) / waterLevel;
      //   // Deeper = darker blue
      //   set(x, y, color(0, 0, 255 * depthFactor));
      // } else {
      //   // Above water is land
      //   set(x, y, color(139, 69, 19)); // a brownish color
      // }
      let depthFactor = waterLive[x][y];
      
      //coloring scheme A
      //set(x,y,color(0,0,1505*depthFactor));

      //coloring scheme B
      if(depthFactor>0.01)
      {
        set(x,y,color(0,0,200));
      }

      //freaksout if depth goes negative
      if(depthFactor<0)
      {
        set(x,y,color(255,0,0));
      }
    
    }
  }
  // Right half: show the raw heightmap in grayscale
  for (let x = 0; x < width/2; x++) 
  {
    for (let y = 0; y < height; y++) 
    {
      let h = terrain[x][y];
      let c = h * 255; // map noise [0..1] -> grayscale [0..255]
      set(x+width/2, y, color(c));
    }
  }

  updatePixels();
}
  