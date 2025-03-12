#include <Arduino.h>
#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <WiFi.h>
#include <Adafruit_MQTT_Client.h>


class LynkTree
{
public:
    LynkTree(/* args */);
    ~LynkTree() = default;
    void loop();
private:
    /* data */
    const char* ssid_ = "tommy";
    const char* password_ = "hilfiger";

    

};

