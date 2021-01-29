#ifdef ESP32
    #include <WiFi.h>
    #include <ESPAsyncWebServer.h>
    #include <SPIFFS.h>
#else
    #include <Arduino.h>
    #include <ESP8266WiFi.h>
    #include <Hash.h>
    #include <ESPAsyncTCP.h>
    #include <ESPAsyncWebServer.h>
    #include <FS.h>
#endif


#include <Wire.h>
#include "Adafruit_SGP40.h"

#include "DHT.h"
#define DHTPIN 26
#define DHTTYPE DHT11


AsyncWebServer server(80);
DHT dht(DHTPIN, DHTTYPE);


const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";


Adafruit_SGP40 sgp;


// SGP40 and DHT11 sensor values.
int sgp40_raw;
float humi;
float temp;

int voc_index;


// Functions to read from sensors and return values as strings.
String readSGPReading() {
    sgp40_raw = sgp.measureRaw();
    return String(sgp40_raw);
}

String readHumi() {
    humi = dht.readHumidity();
    return String(humi);
}

String readTemp() {
    temp = dht.readTemperature();
    return String(temp);
}

String readVOCIndex() {
    voc_index = sgp.measureVocIndex(temp, humi);
    return String(voc_index);
}



void setup() {
    Serial.begin(115200);
    
    if (!sgp.begin()){
        Serial.println("SGP40 sensor not found");
        while(100);
    }

    dht.begin();

    if(!SPIFFS.begin()){
        Serial.println("An Error has occurred while mounting SPIFFS");
        return;
    }
    
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        WiFi.begin(ssid, password);
        delay(1000);
    }

    Serial.print("\nConnection established on: ");
    Serial.println(WiFi.localIP());


    // Server setup with SPIFFS.
    // Home page.
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(SPIFFS, "/index.html");
    });

    // JavaScript files.
    server.on("/github_helper.js", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send(SPIFFS, "/github_helper.js", "text/javascript");
    });
    server.on("/chart.js", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send(SPIFFS, "/chart.js", "text/javascript");
    });

    // Sensor data.
    server.on("/sgp40_raw", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/plain", readSGPReading().c_str());
    });
    server.on("/humidity", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/plain", readHumi().c_str());
    });
    server.on("/temp", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/plain", readTemp().c_str());
    });
    server.on("/voc_index", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send_P(200, "text/plain", readVOCIndex().c_str());
    });

    
    server.begin();
}

void loop() {
    delay(1000);  
}
