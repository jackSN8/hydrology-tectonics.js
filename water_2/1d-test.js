//1D of this flow system

let heightmap = []
let waterActive = []
let waterBuffer1 = []
let length = 200;
let mu = 0.03;

function setup()
{
    createCanvas(length,100);    
    //Distribute water evenly, and perlin the height
    for(let i=0; i<length; i++)
    {
        waterActive[i] = 50;
        heightmap[i] = noise(i/10)*100;       
    }
    waterBuffer1 = structuredClone(waterActive);  

}

function draw()
{
    for(let i=0; i<length; i++)
    {
        //Visualization
        stroke(0,0,waterActive[i]);
        for(let j=0; j<50; j++)
        {
            point(i,j);
        }
        stroke(heightmap[i],heightmap[i],0);
        for(let j=50; j<100; j++)
        {
            point(i,j);
        }
    }
    //Loop L-R and shift water
    for(let i=0; i<length-1; i++)
    {
        let deltaH = mu*(heightmap[i]+waterBuffer1[i]-heightmap[i+1]-waterBuffer1[i+1]);
        if(waterBuffer1[i] - deltaH<0)
        {
            deltaH = waterBuffer1[i];
        }
        else if(waterBuffer1[i+1] + deltaH <0)
        {
            deltaH = waterBuffer1[i+1];
        }      
        waterActive[i] -= deltaH;
        waterActive[i+1] += deltaH;
    }
    //asdh
    waterBuffer1 = structuredClone(waterActive);
    //Loop R-L and shift water
    for(let i=length-1; i>0; i--)
    {
        let deltaH = mu*(heightmap[i]+waterBuffer1[i]-heightmap[i-1]-waterBuffer1[i-1]);
        if(waterBuffer1[i] - deltaH<0)
        {
            deltaH = waterBuffer1[i];
        }
        else if(waterBuffer1[i-1] + deltaH <0)
        {
            deltaH = waterBuffer1[i-1];
        }      
        waterActive[i] -= deltaH;
        waterActive[i-1] += deltaH;
    }
    waterBuffer1 = structuredClone(waterActive);



}