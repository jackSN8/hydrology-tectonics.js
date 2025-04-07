#pragma once

#include "ofMain.h"

class ofApp : public ofBaseApp{

	public:
        void setup();
        void update();
        void draw();

        void loadHeightMap();
        void physicsTick2(int time);
        void areaDeposit(float lBound, float bBound, float rBound, float tBound, float depth);

        float calcWaterTotal();
        ofColor semiRealisticColor(float depth);
        void saveWaterHeightsToCSV(const std::string& filename);

        float waterLevel = 135;
        float hmScale = 29000.0f / 255.0f;
        float hmVisScale = 1.0f / hmScale;
        float viscosity = 0.1f;

        int desiredCols = 600;
        int desiredRows = 300; // desiredCols / 2
        int converganceTime = 100;//Ticks before de

        std::vector<std::vector<float>> terrain;
        std::vector<std::vector<float>> waterLive;
        std::vector<std::vector<float>> waterBuffer;

        ofImage marsMap;
        ofImage marsTrueColor;

        int t = 0;
		
};
