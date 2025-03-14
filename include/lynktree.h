#include <Arduino.h>
#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <WiFi.h>
#include <AdafruitIO_WiFi.h>
#include <Adafruit_MQTT_Client.h>
#include <string>
#include <Wire.h>
// #include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h>

// definitions for communications
#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883                   // use 8883 for SSL
#define AIO_USERNAME    "CzarHC"
#define AIO_KEY         "aio_oCiM51HqaA1iuzSgx1DUMfX9MQsY"

// wifi
#define SSID "tommy"
#define PASSWORD "hilfiger"

// #define SSID "Octopus"
// #define PASSWORD "praxis123"

//feed being used
#define NUM "1"
#define FEED "/feeds/lynktree.comms"
#define FEED_DEBUG "/feeds/lynktree.debug"

// definitions for BME680 sensor
#define SEALEVELPRESSURE_HPA (1013.25)

class LynkTree
{
public:
    LynkTree(/* args */);
    ~LynkTree() = default;
    void loop();
private:
    // wifi
    void WifiSetup();

    // mqtt server
    void MqttSetup();
    WiFiClient client_;
    Adafruit_MQTT_Client mqtt{&client_, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY};
    // publishers
    Adafruit_MQTT_Publish data_ = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME FEED NUM);
    
    // BME680
    Adafruit_BME680 bme_;
    void BmeSetup();

    // data
    //int32_t x_ = 2;

    void Debug(std::string message);
    Adafruit_MQTT_Publish debugMsg_ = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME FEED_DEBUG NUM);
};

