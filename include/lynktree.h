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
#define AIO_KEY         "aio_oCiM51HqaA1iuzSgx1DUMfX9MQsY"

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
    int power_source(bool *battery_powered); //retunrs whether the device is on battery or on power source
    int power_voltage(float *voltage); // retunrns the system voltage
    void update_battery_status();
    bool old_battery_status_ = false;
    bool battery_status_ = true;
    float old_voltage_ = -1;
    const char *power_str_ = "UNKNOWN";
    const float min_battery_volts_ = 3.0f;
    const float max_battery_volts_ = 4.2f;
    char percent_buf_[10] = {0};
    
};

