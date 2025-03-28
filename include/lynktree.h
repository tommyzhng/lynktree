#include <Arduino.h>
#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <WiFi.h>
#include <AdafruitIO_WiFi.h>
#include <Adafruit_MQTT_Client.h>
#include <string>
#include <Wire.h>
// #include <SPI.h>
#include <stdio.h>
#include <pico/stdio.h>
#include <bme68x.h>
#include <drivers/bme68x/bme68x.hpp>
#include <bme68x_defs.h>
#include <ArduinoJson.h>
// for using the accelerometer
#include <SPI.h>
#include <SparkFun_KX13X.h>
// for checking the current battery
#include <stdbool.h>
#include <hardware/adc.h>
#include <pico/float.h>

// definitions for communications
#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883                   // use 8883 for SSL
#define AIO_USERNAME    "CzarHC"

// Read AIO_KEY from a file
#include <fstream>
#include <string>

std::string readAIOKey() {
    std::ifstream keyFile("include/aio_key.txt");
    std::string key;
    if (keyFile.is_open()) {
        std::getline(keyFile, key);
        keyFile.close();
    }
    return key;
}

const std::string KEY = readAIOKey();

#define AIO_KEY         KEY.c_str()

// wifi
// #define SSID "tommy"
// #define PASSWORD "hilfiger"

#define SSID "Octopus"
#define PASSWORD "praxis123"

//feed being used
#define NUM "1"
#define FEED "/feeds/lynktree.comms"
#define FEED_DEBUG "/feeds/lynktree.debug"

// definitions for BME680 sensor
#define SEALEVELPRESSURE_HPA (1013.25)

//definitions for the battery check
#define PICO_POWER_SAMPLE_COUNT 3
#define PICO_FIRST_ADC_PIN 26


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
    void Debug(std::string message);
    Adafruit_MQTT_Publish debugMsg_ = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME FEED_DEBUG NUM);

    // BME680
    pimoroni::I2C i2c_bme{pimoroni::BOARD::BREAKOUT_GARDEN};
    pimoroni::BME68X bme_{&i2c_bme};
    #ifdef PICO_DEFAULT_LED_PIN
        gpio_init(PICO_DEFAULT_LED_PIN);
        gpio_set_dir(PICO_DEFAULT_LED_PIN, GPIO_OUT);
    #endif
    void BmeSetup();
    bme68x_data bme_data_;

    // accelerometer
    //i2c object
    SparkFun_KX132 kxAccel_; // For the KX132, uncomment this and comment line below
    //SparkFun_KX134 kxAccel_; // For the KX134, uncomment this and comment line above
    outputData accel_data_;
    void AccelSetup();

    //battery status
    void BatterySetup();
    void update_battery_status();
    void power_voltage(float *voltage);

    bool using_battery_;
    const float min_battery_volts_ = 1.25;
    const float max_battery_volts_ = 1.65;
    int battery_percent_;

    //RGB LED connections with the pico w
    const uint8_t red_led_ = 22;
    const uint8_t green_led_ = 17;
    const uint8_t blue_led_ = 18;
    void RGBSetup();
    void ErrorLED(int error);

    //keep track of if there are any errors
    // 0 = no error
    // 1 = wifi error
    // 2 = mqtt error
    // 3 = bme diconnected
    // 4 = accel disconnected or position change
    // 5 = low battery
    int run_ = 0;
    int error_code_ = 0;
    // the priority for sending the error is in order: 
    // BME sensor disconnected
    // low battery
    // accel disconnected
    // accel position change
    // mqtt error
    // wifi error
    
};

