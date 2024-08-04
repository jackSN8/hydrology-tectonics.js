let heightMap = [];
let waterActive = [];
let waterBuffer1 = [];
let waterBuffer2 = [];

let resolution = 1;
let rowLength = 400;
let mu = 1;//viscosity of water

function setup()
{
  createCanvas(3*resolution*rowLength,resolution*rowLength);
  //generate world
  for (let i=0; i<rowLength; i++)
  {
    heightMap[i] = [];
    waterActive[i] = [];
    for(let j=0; j<rowLength; j++)
    {
      //heightMap[i][j] = noise(i/100,j/100)*255;///Perlin for heeightmap
      heightMap[i][j] = 0*((j-rowLength/2)/50)**2;
      //console.log(heightMap[i][j]);
      waterActive[i][j] = 0;
      if(random(1)>0.70)
        {
          waterActive[i][j] = 255;
        }
    }
  }

  waterBuffer1 = structuredClone(waterActive);
  textSize(30);
  textAlign(CENTER);
  frameRate(15);
}

function draw()
{
  let waterSum = 0;
  background(127);
  let fps = getTargetFrameRate();
  fill(255);
  text(fps,20,20);
  //Draw combined height-water map, then heightmap, then water map
  for (let i=0; i<rowLength; i++)
    {
      for(let j=0; j<rowLength; j++)
      {
        stroke(heightMap[i][j],heightMap[i][j],0,255);
        point(i,j);
        point(i+rowLength,j);//Needs to be changed when resolution not 1

        stroke(0,0,255,waterActive[i][j]);
        waterSum += waterActive[i][j];
        point(i,j);
        stroke(0,0,waterActive[i][j],255);
        point(i+rowLength*2,j);
      }
    }

  waterTick();
  //console.log(waterSum);
}


function waterTick()
{
  //Loop through directions, and then diffuse in those directions
  for(let d=0; d<4; d++)
  {
    Diffuse1D(d);
  }
}

///Function that diffuses water in 1 direction
function Diffuse1D(direction)//0lr,1ud,2rl,3du
{
  let startX;
  let endX;
  if(direction<2)
  {
    startX = 0;
    endX = rowLength;
    let shiftX = 1-direction;
    let shiftY = int(direction);
    ///loop from the starting side and shift all water by expected amount
    for(let i=startX; i++; i<endX)
    {
      for(let j=startX; j++; j<endX)
      {
        let deltaH;
        //Check delta based on direction
        if(direction == 0)
        {
          deltaH = mu*(waterBuffer1[i+shiftX][j+shiftY] - waterBuffer1[i][j]);
          deltaH = floorOfThree(waterBuffer1[i][j],waterBuffer1[i+shiftX][j+shiftY],abs(deltaH));
        }
        //Shift the water
        waterActive[i+shiftX][j+shiftY] -=deltaH;
        waterActive[i][j] += deltaH;
      }
    }
    //End sweep through by updating waterMap
    waterBuffer1 = structuredClone(waterActive);
  }

  ////Can totally merge this set of code in with previous one but tbd
  ///Just need to fix for loops i think as that requires inverting sign
  else if (direction >=2)
  {
    endX = 0;
    startX = rowLength;
    ydirec = int(direction)-2;
    let shiftX = -(1-ydirec);//-1 if direction = 2, 0 if direction = 3
    let shiftY = int(ydirec);
    ///loop from the starting side and shift all water by expected amount
    for(let i=startX; i--; i<endX)
    {
      for(let j=startX; j--; j<endX)
      {
        let deltaH;
        //Check delta based on direction
        if(direction == 0)
        {
          deltaH = mu*(waterBuffer1[i+shiftX][j+shiftY] - waterBuffer1[i][j]);
          deltaH = floorOfThree(waterBuffer1[i][j],waterBuffer1[i+shiftX][j+shiftY],abs(deltaH));
        }
        //Shift the water
        waterActive[i+shiftX][j+shiftY] -=deltaH;
        waterActive[i][j] += deltaH;
      }
    }
    //End sweep through by updating waterMap
    waterBuffer1 = structuredClone(waterActive);
  }
}

//returns lowest of three inputs
function floorOfThree(inp1, inp2, inp3)
{
  if(inp1<inp2 && inp1<inp3)
  {
    return inp1;
  }
  if(inp2<inp3)
  {
    return inp2;
  }
  return inp3;

}


////This is an attempt at modeeling the diffusion, that takes cells with neighbours
//loops thro neighbours, and then works out the difference between each cells water height
//Then it checks to see if this movement of water will make a cell have negative water
//if so, then apply a scale factor that forces that to zero rather than negative
function waterTickOld2()
{
  console.log(waterBuffer1[110][210]);
  console.log(waterBuffer1[111][210]);

  ////Surely can combine these at some point?
  //Left-right pass
  for (let i=0; i<rowLength-1; i++)///Loop through cells that have neighbours on all sides only
    {
      for(let j=0; j<rowLength; j++)
      {
        ///Calculate hight difference with neighbour to right
        let deltaH = mu*(waterBuffer1[i][j]+heightMap[i][j]-waterBuffer1[i+1][j]-heightMap[i+1][j]);
        //deltaH is positive when water should move to the right
        //Check if that much change will make the height go negative
        if(waterBuffer1[i][j] - deltaH < 0)
        {
          deltaH = waterBuffer1[i][j];
          
        }
        //Check if the water movement is negative, will giving that much negative water make the next cell negative
        if(waterBuffer1[i+1][j] + deltaH < 0)
        {
          //Check to see forcing that previous cell to zero will make the other cell go negative
          if(deltaH>waterBuffer1[i+1][j])
          {
            deltaH = waterBuffer1[i+1][j];
          }
        }
        waterActive[i+1][j] += deltaH;
        waterActive[i][j] -= deltaH;
      }
    }
  waterBuffer1 = structuredClone(waterActive);
  //Up-down pass
  for (let j=0; j<rowLength-1; j++)///Loop through cells that have neighbours on all sides only
    {
      for(let i=0; i<rowLength; i++)
      {
        ///Calculate hight difference with neighbour below
        let deltaH = mu*(waterBuffer1[i][j]+heightMap[i][j]-waterBuffer1[i][j+1]-heightMap[i][j+1]);
        //deltaH is positive when water should move down
        //Check if that much change will make the height go negative
        if(waterBuffer1[i][j] - deltaH < 0)
        {
          deltaH = waterBuffer1[i][j];
        }
        if(waterBuffer1[i][j+1] + deltaH < 0)
        {
          deltaH = waterBuffer1[i][j+1];
        }
        waterActive[i][j+1] += deltaH;
        waterActive[i][j] -= deltaH;
      }
    }
    waterBuffer1 = structuredClone(waterActive);  


}


function waterTickOld()
{
  //This function will be called every frame (tick), and handles the diffusion
  //Basic tenant is diffusion equation, which discretized looks like
  //change in water height per tick is proportional to difference w neighbours
  for (let i=1; i<rowLength-1; i++)///Loop through cells that have neighbours on all sides only
    {
      for(let j=1; j<rowLength-1; j++)
      {
        //let dU = mu*(waterBuffer1[i+1][j]+waterBuffer1[i-1][j]+waterBuffer1[i][j+1]+waterBuffer1[i][j-1]-4*waterBuffer1[i][j])
        let xDu =  mu*(heightMap[i+1][j]+waterBuffer1[i+1][j]+heightMap[i-1][j]+waterBuffer1[i-1][j]-2*waterBuffer1[i][j]-2*heightMap[i][j]);
        let yDu =  mu*(waterBuffer1[i][j+1]+heightMap[i][j+1]+waterBuffer1[i][j-1]+heightMap[i][j-1]-2*waterBuffer1[i][j]-2*heightMap[i][j]);
        ///Perhaps this is the real diffusion eq
        let duDt = xDu+yDu;
        //Just adding the expected change in depth leads to unphysical negative values of depth,
        //waterActive[i][j] += duDt;
        ///MAYBE Going to try put the brakes on the diffusion - ie boundary condition forcing U>0
        // let newDepth = waterActive[i][j] + duDt;
        // if (newDepth<0)
        // {
        //   newDepth *= 1/4;
        //   waterActive[i+1][j] += newDepth;
        //   waterActive[i-1][j] += newDepth;
        //   waterActive[i][j+1] += newDepth;
        //   waterActive[i][j-1] += newDepth;

        //   waterActive[i][j] = 0;//I think this unormalizes U, ie creates water out of nowhere,
        //   //So take that much water away from neighbours
        // }
        // else
        // {
          waterActive[i][j] += duDt;
        //}
        
      }
    }
    waterBuffer1 = structuredClone(waterActive);

}









////Long deleted fake diffusion equation
///////All this below is the troll fake diffusion equation
        //Then loop through the Ith and Jth cells neighbours, perha
        // for(let k=0; k<4; k++)
        // {
        //   let theta = k*PI/2;
        //   //This loop setup is from the right counterclockwise
        //   let tX = int(cos(theta));
        //   let tY = int(sin(theta));
        //   // console.log(i+tX);
        //   // console.log(j+tY);
        //   //let dif = heightMap[i+tX][j+tY]+waterBuffer1[i+tX][j+tY]-heightMap[i][j]-waterBuffer1[i][j];//This is NOT the real diffusion eq
        //   ///perhaps this is:
        //   let dif = 


        //   if(dif>0)
        //     {
        //       waterActive[i+tX][j+tY] -=dif;
        //       waterActive[i][j] +=dif;             
        //     }
        // }