let heightMap = [];
let waterActive = [];
let waterBuffer1 = [];
let waterBuffer2 = [];

let resolution = 1;
let rowLength = 400;
let mu = 0.3;//viscosity of water

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
      heightMap[i][j] = noise(i/100,j/100)*255;///Perlin for heightMap for now
      waterActive[i][j] = 0 ;
      if(random(1)>0.50)
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
        point(i+rowLength*2,j);
      }
    }

  for(let p =0; p<10; p++)
    {
      waterTick();
    }
  console.log(waterSum);
}


function waterTick()
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
        ///Going to try put the brakes on the diffusion - ie boundary condition forcing U>0
        let newDepth = waterActive[i][j] + duDt;
        if (newDepth<0)
        {
          newDepth *= 1/4;
          waterActive[i+1][j] += newDepth;
          waterActive[i-1][j] += newDepth;
          waterActive[i][j+1] += newDepth;
          waterActive[i][j-1] += newDepth;

          waterActive[i][j] = 0;//I think this unormalizes U, ie creates water out of nowhere,
          //So take that much water away from neighbours
        }
        else
        {
          waterActive[i][j] += duDt;
        }
        
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