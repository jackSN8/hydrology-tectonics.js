import java.util.Arrays;



float [][] hM;//heightMap
float [][] wB;//waterBuffer
float [][] wM;//waterMap
int wSize = 500;
float noiseScale = 0.01;
float viscous = 1;


void setup()
{
  size(1000,500);
  hM = new float[wSize][wSize];
  wM = new float[wSize][wSize];
  wB = new float[wSize][wSize];
  setupTextures();
  wB = Arrays.copyOf(wM, wM.length);//troll?
  print("Water before physics is: ");
  sumOfWater();
  for(int p = 0; p<100; p++)
  {
    physicsTick();
  }
  print("Water after physics is: ");
  sumOfWater();
}

//One physics sim loop
void physicsTick()
{
  {
    shiftWater(0);
    shiftWater(2*PI);
    wM = Arrays.copyOf(wB, wB.length);   
    shiftWater(1*PI);
    shiftWater(3*PI);
    wM = Arrays.copyOf(wB, wB.length);
  }

}


void draw()
{
  for(int i=0; i<wSize; i++)
  {  
    for(int j=0; j<wSize; j++)
    {
      stroke(0,0,wM[i][j]);
      point(i,j);
      stroke(hM[i][j],hM[i][j],0);
      point(i+wSize,j);
    }
  }
}



//Shifts water in one direction
////NOTE WATER IS NOT CONSERVED HERE, DRHO != 0 - THIS ALGORITHIM MUST BE RUN IN THE OPPOSITE DIRECTION FOR THAT TO OCCOUR
void shiftWater(float direction)
{
  ////loop starting UD then clockwise (starting clockwise) 
  int xShift = int(sin(direction));
  int yShift = int(cos(direction));//1,0,-1,0  
  if(random(1)>0.5)
  {
    for(int i=1; i<wSize-1; i++)
    {  
      for(int j=1; j<wSize-1; j++)
      {
        float dH = wM[i][j]+hM[i][j] - wM[i+xShift][j+yShift]-hM[i+xShift][j+yShift];
        float dW = viscous*dH;   
        
        ///sorry about this - but need to make sure boundary condition of each water cell having >= 0 is fixed,
        //this forces the amount of water drained from a cell to be less than the cell or the neighbour it is draining to
        float[] jeff = {dW,wM[i][j],wM[i+xShift][j+yShift]};
        dW = lowestOf(jeff);
        if(dW>0)
        {
           //println(dW);
        }
        wB[i][j] -= dW;    
      }
    }
  }
  else
  {
    for(int j=1; j<wSize-1; j++)
    {  
      for(int i=1; i<wSize-1; i++)
      {
        float dH = wM[i][j]+hM[i][j] - wM[i+xShift][j+yShift]-hM[i+xShift][j+yShift];
        float dW = viscous*dH;   
        
        ///sorry about this - but need to make sure boundary condition of each water cell having >= 0 is fixed,
        //this forces the amount of water drained from a cell to be less than the cell or the neighbour it is draining to
        float[] jeff = {dW,wM[i][j],wM[i+xShift][j+yShift]};
        dW = lowestOf(jeff);
        if(dW>0)
        {
           //println(dW);
        }
        wB[i][j] -= dW;    
      }
    }
  }
  

}

float lowestOf(float inp[])
{
  float lowest = inp[0];
  for(int i=0; i<inp.length; i++)
  {
    if(inp[i] < lowest)
    {
      lowest = inp[i];
    }
  }
  return lowest;
}

//Prints volume of water on the planet
void sumOfWater()
{
  float sum = 0;
  for(int i=0; i<wSize; i++)
  {  
    for(int j=0; j<wSize; j++)
    {
      if(Float.isNaN(wM[i][j]))
      //float t1 = 3.0;
      //Float t2 = t1;
      //if(t2 != null);
      {
        print("big problems at x ");
        println(i);
        print("y ");
        println(j);
      }
      sum += wM[i][j];
    }
  }
  println(sum);
}


void setupTextures()
{
  for(int i=0; i<wSize; i++)
  {  
    for(int j=0; j<wSize; j++)
    {
      hM[i][j] = 120*noise(i*noiseScale,j*noiseScale);
      wM[i][j] = 70;
    }
  }
}
