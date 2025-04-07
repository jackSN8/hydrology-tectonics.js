#include "ofApp.h"


void ofApp::setup() {
    ofSetWindowShape(desiredCols * 2, desiredRows);
    ofSetFrameRate(60);
    ofBackground(255);
    ofEnableAlphaBlending();

    marsMap.load("MOLAdata_v2.png");
    marsTrueColor.load("marsFalseColor.jpg");
    marsMap.resize(desiredCols, desiredRows);
    marsTrueColor.resize(desiredCols, desiredRows);

    terrain.resize(desiredCols, std::vector<float>(desiredRows));
    waterLive.resize(desiredCols, std::vector<float>(desiredRows));
    waterBuffer.resize(desiredCols, std::vector<float>(desiredRows));

    loadHeightMap();

    for (int x = 0; x < desiredCols; x++) {
        for (int y = 0; y < desiredRows; y++) {
            if (x > 0 && x < desiredCols) {
                waterLive[x][y] = waterLevel;
            }
            else {
                waterLive[x][y] = 0;
            }
        }
    }
    //areaDeposit(0, 270, desiredCols, 300, 150);
    //areaDeposit(0, 0, desiredCols, 30, 150);

    waterBuffer = waterLive;

    ofLog() << "Initial water: " << calcWaterTotal();
    for (int i = 0; i < converganceTime; i++) {
        physicsTick2(i);
        if (i % 100==0)
        {
            ofLog() << "At tick: " << i;
        }
    }
    ofLog() << "Post-simulation water: " << calcWaterTotal();
    saveWaterHeightsToCSV("water_heights.csv");

}

void ofApp::update() {
    t++;
    physicsTick2(t);
}

void ofApp::draw() {
    marsTrueColor.draw(0, 0, desiredCols, desiredRows);

    for (int x = 0; x < desiredCols; x++) {
        for (int y = 0; y < desiredRows; y++) {
            float depthFactor = waterLive[x][y];
            ofSetColor(semiRealisticColor(depthFactor));
            ofDrawRectangle(x, y, 1, 1);

            // Optional: right half grayscale heightmap
            float h = terrain[x][y];
            float c = hmVisScale * h;
            ofSetColor(c);
            ofDrawRectangle(x + desiredCols, y, 1, 1);
        }
    }
}

void ofApp::loadHeightMap() {
    ofPixels& pixels = marsMap.getPixels();
    for (int x = 0; x < desiredCols; x++) {
        for (int y = 0; y < desiredRows; y++) {
            int imgX = ofMap(x, 0, desiredCols - 1, 0, marsMap.getWidth() - 1);
            int imgY = ofMap(y, 0, desiredRows - 1, 0, marsMap.getHeight() - 1);

            ofColor color = pixels.getColor(imgX, imgY);
            float altitude = hmScale * color.r; // just red channel for now
            terrain[x][y] = altitude;
        }
    }
}

void ofApp::areaDeposit(float lBound, float bBound, float rBound, float tBound, float depth)
{
    for (int x = lBound; x < rBound; x++) 
    {
        for (int y = bBound; y < tBound; y++) 
        {
            waterLive[x][y] = depth;
        }
    }
}


void ofApp::physicsTick2(int time) {
    for (int x = 0; x < desiredCols; x++) {
        for (int y = 0; y < desiredRows; y++) {
            float tOff = int(ofRandom(0, 3)) * PI / 2;
            for (float t = 0; t < TWO_PI; t += PI / 2) {
                int targetX = x + int(sin(t + tOff));
                int targetY = y + int(cos(t + tOff));

                if (targetX >= 0 && targetX < desiredCols && targetY >= 0 && targetY < desiredRows) {
                    float targetH = waterLive[targetX][targetY] + terrain[targetX][targetY];
                    float deltaH = viscosity * (targetH - waterLive[x][y] - terrain[x][y]);

                    if (waterBuffer[x][y] + deltaH < 0 || waterBuffer[targetX][targetY] - deltaH < 0) {
                        deltaH = std::min(waterBuffer[x][y], waterBuffer[targetX][targetY]);
                    }

                    waterBuffer[x][y] += deltaH;
                    waterBuffer[targetX][targetY] -= deltaH;
                }
            }
        }
    }
    waterLive = waterBuffer;

    if (calcWaterTotal() < 0) {
        ofLog() << "Negative water total on tick " << time;
    }
}

float ofApp::calcWaterTotal() {
    float waterTotal = 0;
    for (int x = 0; x < desiredCols; x++) {
        for (int y = 0; y < desiredRows; y++) {
            waterTotal += waterLive[x][y];
        }
    }
    return waterTotal;
}

ofColor ofApp::semiRealisticColor(float depth) {
    if (depth > 60) return ofColor(10, 30, 140, 255);//deep ocean
    if (depth > 20) return ofColor(10, 50, 160, 200);
    if (depth > 5) return ofColor(70, 130, 180, 140);
    if (depth > 0.5) return ofColor(100, 160, 140, 100);
    if (depth > 0.05) return ofColor(194, 178, 128, 0);
    return ofColor(0, 0, 0, 0);
}

void ofApp::saveWaterHeightsToCSV(const std::string& filename) {
    ofFile file(filename, ofFile::WriteOnly);
    if (!file) {
        ofLogError() << "Unable to open file: " << filename;
        return;
    }

    for (int y = 0; y < desiredRows; y++) {
        std::string line = "";
        for (int x = 0; x < desiredCols; x++) {
            line += ofToString(waterLive[x][y]);
            if (x < desiredCols - 1) line += ",";
        }
        file << line << "\n";
    }

    ofLogNotice() << "Water heights saved to " << filename;
}
