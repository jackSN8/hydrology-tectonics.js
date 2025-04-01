
let waterLevel = 110; //now in metres
//let waterKM = 80.5;//water level in KM, hopefully phases out above variable

//some thoughts on MOLA loading
//the MOLA template im using goes frm -8 to 8km or so - olympus seems clipped

let hmScale = 15000/255;//rgb scale from 0-255, earth & mars elevation
//generally goes between -10km and 10km
let waterVisScale = 40/hmScale;

let hmVisScale = 1/hmScale;
// Prepare a 2D array to store noise values
let terrain = [];
let waterLive = [];
let waterBuffer = [];
let viscosity = 0.06;//actually inverse of viscosity
let marsMap;
let marsTrueColor;


let desiredCols = 800;
let desiredRows = desiredCols/2;
let t = 0;


//divide area of planet - 510 earth, 144 mars by num cells
let cellArea = 144/(desiredCols*desiredRows)//*1e6*Km^2



function preload() {
  // Replace with your actual local file or URL path for the MOLA heightmap
  // e.g. "mola_mars_heightmap.jpg" or an online image URL
  marsMap = loadImage('molaPNG.png');
  marsTrueColor = loadImage('marsTrueColor.jpg')
}

function setup() {
  createCanvas(desiredCols*2, desiredRows);
  //calculate water depth using heightmap as scale unit

  // You can tweak this noise scale to stretch/compress features
  let noiseScale = 0.02;

  // Generate noise for each pixel (x,y)
  for (let x = 0; x < width/2; x++) {
    terrain[x] = [];
    waterLive[x] = [];
    for (let y = 0; y < height; y++) {
      //terrain[x][y] = noise(x * noiseScale, y * noiseScale);
      if(x>0 && x<desiredCols)
      {
        waterLive[x][y] = waterLevel;
      }
      else
      {
        waterLive[x][y] = 0;
      }
    }
  }
  loadHeightMap()

  waterBuffer = structuredClone(waterLive);
  console.log(calcWaterTotal());
  for(let t = 0; t<400; t++)
  {
    physicsTick2(t);
    //display();
  }
  console.log(calcWaterTotal());
  //noLoop();   // We'll just render once
  saveWaterHeightsToCSV(waterLive);
}

function draw() {
  t++;
  background(220);
  physicsTick2(t);
  image(marsTrueColor,0,0,width/2,height);

  //loadPixels();
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
      //let baseColor = color(get(x,y));
      let waterColor = semiRealisticColor(depthFactor);
      //coloring scheme A
      //let mixedCol = lerpColor(baseColor,waterColor,0.7);
      stroke(waterColor);
      point(x,y); 
      //set(x,y,mixedCol);
//+0.3*color(0,0,waterVisScale*depthFactor)
      //coloring scheme B
      // if(depthFactor>0.00005)
      // {
      //   set(x,y,color(0,0,200));
      // }

      //coloring scheme C (doesnt work)
      //set(x,y,getDepthColor(depthFactor))

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
      let c = hmVisScale*h ; // map noise [0..1] -> grayscale [0..255]
      set(x+width/2, y, color(c));
    }
  }
  //updatePixels();

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
      let altitude = hmScale*(r) ;

      // Store the altitude (0..255) in the terrain array
      terrain[x][y] = altitude;
    }
  }
}

function waterCycle()
{
  //Melt the ice
  //Evaporate the water
  //Move water vapor
  //Precipitate
  //Freeze the water
}
  

///will code a cleverer color function later
function semiRealisticColor(depth)
{
  let deepOcean = color(30,66,135,230);
  let shallowOcean = color(45,90,196,160);
  let wetlands = color(60,140,60,160);
  if(depth>60)
  {
    return deepOcean;
  }
  if(depth>30)
  {
    return shallowOcean;
  }
  if(depth>0.05)
  {
    return wetlands;
  }
  else
  {
    return color(0,0,0,0);
  }
}
function getDepthColor(depth) {
  // Convert depth [0..0.06] => fraction [0..1]
  // fraction=0 => d=0 => black
  // fraction=1 => d=0.06 => red
  let fraction = depth / 0.00006;

  // Define our four key colors: black, blue, green, red.
  // We’ll move from black (shallow, fraction=0)
  //    -> blue   (fraction ~ 1/3)
  //    -> green  (fraction ~ 2/3)
  //    -> red    (deep, fraction=1)
  let cBlack = color(0, 0, 0);
  let cBlue  = color(0, 0, 255);
  let cGreen = color(0, 255, 0);
  let cRed   = color(255, 0, 0);

  // We’ll do piecewise linear interpolation in three segments:
  // [0..1/3]:  black -> blue
  // (1/3..2/3): blue -> green
  // (2/3..1]:   green -> red

  if (fraction <= 1/3) {
    // Map fraction=0..1/3 => subFraction=0..1
    let subFraction = map(fraction, 0, 1/3, 0, 1);
    return lerpColor(cBlack, cBlue, subFraction);
  } 
  else if (fraction <= 3/5) {
    // Map fraction=1/3..2/3 => subFraction=0..1
    let subFraction = map(fraction, 1/3, 3/5, 0, 1);
    return lerpColor(cBlue, cGreen, subFraction);
  } 
  else {
    // fraction=2/3..1 => subFraction=0..1
    let subFraction = map(fraction, 3/5, 1, 0, 1);
    return lerpColor(cGreen, cRed, subFraction);
  }
}

function saveWaterHeightsToCSV(waterArray) {
  let lines = [];
  // waterArray is expected as [x][y]. We'll treat y as rows.
  for (let y = 0; y < waterArray[0].length; y++) {
    let rowData = [];
    for (let x = 0; x < waterArray.length; x++) {
      rowData.push(waterArray[x][y]);
    }
    // Turn one row into a CSV string
    lines.push(rowData.join(','));
  }

  // Use p5's saveStrings to download
  // Each element of 'lines' is a separate line in the output file.
  saveStrings(lines, 'water_heights.csv');
}