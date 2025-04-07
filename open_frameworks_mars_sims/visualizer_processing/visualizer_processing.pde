float[][] waterHeights;
int cols, rows;
PImage backgroundImage;

void setup() {
  backgroundImage = loadImage("marsTrueColor.jpg");  // Same Mars image
  size(800*2, 400);  // adjust as needed

  String[] lines = loadStrings("water_heights.csv");
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
  if (depth > 40) {
    return color(10, 30, 80, 255);
  } else if (depth > 20) {
    return color(30, 90, 160, map(depth, 20, 40, 160, 220));
  } else if (depth > 5) {
    return color(70, 130, 180, map(depth, 5, 20, 100, 160));
  } else if (depth > 0.5) {
    return color(100, 160, 140, map(depth, 0.5, 5, 60, 100));
  } else if (depth > 0.01) {
    return color(194, 178, 128, map(depth, 0.01, 0.5, 30, 60));
  } else {
    return color(0, 0, 0, 0);
  }
}
