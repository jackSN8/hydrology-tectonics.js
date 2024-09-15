float [][] hM;//heightMap
float [][] wB;//waterBuffer
float [][] wM;//waterMap
int wSize = 250;
float noiseScale = 0.1;

void setup()
{
  hM = new float[wSize][wSize];
  wM = new float[wSize][wSize];
  wB = new float[wSize][wSize];

}


void draw()
{
}


//simulation looOp
void shiftWater()
{
  
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
