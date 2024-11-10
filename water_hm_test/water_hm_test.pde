import java.util.Arrays;



float [][] hM;//heightMap
float [][] wB;//waterBuffer
float [][] wM;//waterMap
int wSize = 500;
int wdth = 800;
int hght = 500;
float noiseScale = 0.01;
float viscous = 0.01;
float waterStart = 8;
PImage img; // To store the input image


void setup()
{
  size(800*2,500);
  hM = new float[wdth][hght];
  wM = new float[wdth][hght];
  wB = new float[wdth][hght];
  setupTextures();
  wB = Arrays.copyOf(wM, wM.length);//troll?
  hM = getHeightMap("molaPNG.png");
  //hM = readMatrixFromFile("titan_hm.txt");
  //hM = transposeMatrix(hM);
  print("Water before physics is: ");
  sumOfWater();
  for(int p = 0; p<3000; p++)
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
    shiftWater(1*PI);
    shiftWater(3*PI);
    wM = Arrays.copyOf(wB, wB.length);
    shiftWater(0);
    shiftWater(2*PI);
    wM = Arrays.copyOf(wB, wB.length);   

  }

}


void draw()
{
  for(int i=0; i<wdth; i++)
  {  
    for(int j=0; j<hght; j++)
    {
      float colorAlpha = map(wM[i][j],0,40,0,255);
      if(wM[i][j]>0.5)
      {
        stroke(0,colorAlpha/2,colorAlpha);
      }
      //stroke(0,0,wM[i][j]);
      point(i,j);
      stroke(hM[i][j],hM[i][j],0);
      point(i+wdth,j);
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
    for(int i=1; i<wdth-1; i++)
    {  
      for(int j=1; j<hght-1; j++)
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
    for(int j=1; j<hght-1; j++)
    {  
      for(int i=1; i<wdth-1; i++)
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
  for(int i=0; i<wdth; i++)
  {  
    for(int j=0; j<hght; j++)
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
  for(int i=0; i<wdth; i++)
  {  
    for(int j=0; j<hght; j++)
    {
      hM[i][j] = 120*noise(i*noiseScale,j*noiseScale);
      if(hM[i][j]<40)
      {
         wM[i][j] = waterStart;
      }
    }
  }
}

// Function to read 180x360 matrix from a text file and return a 2D float array
float[][] readMatrixFromFile(String filePath) {
  float[][] matrix = new float[180][360]; // Define a 2D array of 180 rows and 360 columns
  
  String[] lines = loadStrings(filePath); // Load the file into an array of Strings, each representing a row
  
  if (lines.length != 180) {
    println("Error: The file does not have 180 rows");
    return null;
  }
  
  for (int i = 0; i < 180; i++) {
    // Use a regular expression to handle multiple spaces or other delimiters like tabs
    String[] values = splitTokens(lines[i], " ,\t"); // Split by space, comma, or tab
    
    if (values.length != 360) {
      println("Error: Row " + i + " does not have 360 columns. Found: " + values.length);
      return null;
    }
    
    for (int j = 0; j < 360; j++) {
      matrix[i][j] = map(float(values[j]),-600,600,40,250); // Convert each value to a float and store it in the array
    }
  }
  
  return matrix; // Return the 2D float array
}

// Function to load a B&W PNG image and return a 2D float array of heights
float[][] getHeightMap(String filePath) {
  img = loadImage(filePath); // Load the image file
  img.loadPixels(); // Load the pixel data
  
  // Initialize a 2D float array based on the image dimensions
  float[][] heightMap = new float[img.width][img.height];
  
  // Loop through each pixel in the image
  for (int x = 0; x < img.width; x++) {
    for (int y = 0; y < img.height; y++) {
      // Get the brightness of the pixel at (x, y) and scale it to a float from 0.0 to 1.0
      float brightnessValue = brightness(img.get(x, y)) ;
      heightMap[x][y] = brightnessValue; // Store in the height map
    }
  }
  
  return heightMap; // Return the height map as a 2D float array
}

float [][] transposeMatrix(float [][] inp)
{
  float [][] out = new float[inp[0].length][inp.length];
  for(int i=0; i<inp[0].length; i++)
  {
    for(int j=0; j<inp.length; j++)
    {
      out[i][j] = inp[j][i];
    }
  }
  return out;
}
