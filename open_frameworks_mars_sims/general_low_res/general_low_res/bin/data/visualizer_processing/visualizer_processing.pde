float[][] waterHeights;
int cols, rows;
PImage backgroundImage;

float deepWater = 80;
float shallowWater = 3;
float marshland = 0.7;
float shrub = 0.003;

void setup() {
  backgroundImage = loadImage("marsFalseColor.jpg");  // Same Mars image
  size(1400, 700);  // adjust as needed
  
  

  String[] lines = loadStrings("water_heights_1400res_150depth_even.csv");
  rows = lines.length;
  cols = split(lines[0], ',').length;

  waterHeights = new float[cols][rows];

  for (int y = 0; y < rows; y++) {
    String[] vals = split(lines[y], ',');
    for (int x = 0; x < cols; x++) {
      waterHeights[x][y] = float(vals[x]);
    }
  }
}

void draw() {
  background(0);
  image(backgroundImage, 0, 0, cols, rows);

  for (int x = 0; x < cols; x++) {
    for (int y = 0; y < rows; y++) {
      float depth = waterHeights[x][y];
      color c = semiRealisticColor(depth);
      stroke(c);
      point(x, y);
    }
  }
}

// Match gradient logic from oF
color semiRealisticColor(float depth) {
  if (depth > deepWater) {
    return color(10, 30, 140, 255);
  } 
  else if (depth > shallowWater) {
    return color(30, map(depth,shallowWater,deepWater,90,30), 130, map(depth,shallowWater,deepWater,140,255));
  } 
  else if (depth > marshland) {
    return color(map(depth,marshland,shallowWater,104,30), map(depth,marshland,shallowWater,220,90), map(depth,marshland,shallowWater,50,130), map(depth,marshland,shallowWater,100,140));
  } 
  else if (depth > shrub) {
    return color(104, map(depth,shrub,marshland,180,220), map(depth,shrub,marshland,30,50), map(depth,shrub,marshland,0,100));
  } 
  else {
    return color(255, 0, 0, 0);
  }
}
