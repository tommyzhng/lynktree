#include <lynktree.h>

LynkTree::LynkTree() {
    Serial.begin(115200);
    WifiSetup();
    MqttSetup();
    BmeSetup();
}

void LynkTree::WifiSetup() {
    if (cyw43_arch_init()) {
        return;
    }


    WiFi.begin(SSID, PASSWORD);

    // attempt to connect to the wifi network
    int attempt = 0;
    while (WiFi.status() != WL_CONNECTED && attempt < 20) {
        delay(500);
        Serial.print(".");
    }
}

void LynkTree::MqttSetup() 
{
    int8_t ret;

    if (mqtt.connected()) { // if already connected, return
        return;
    }


    uint8_t retries = 5;
    while ((ret = mqtt.connect()) != 0) {
        //debugMsg_.publish(String(mqtt.connectErrorString(ret)).c_str());
        mqtt.disconnect();
        delay(5000);  // wait 1 seconds
        retries--;
        if (retries == 0) {
            // die and let watchdog reset
            while (1);
        }
        // for (int i = 0; i < ret+2; i++)
        // {
        //     cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
        //     sleep_ms(250);
        //     cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
        //     sleep_ms(250);
        // }

    }
    Debug("MQTT Connected!");
}

void LynkTree::BmeSetup()
{
    if (!bme_.init()) {
        Debug("BME680 sensor not found!");
        return;
    }
    Debug("BME680 sensor found!");

}


void LynkTree::loop()
{
    // data.publish(x_++);
    bme68x_data bme_data;
    auto result = bme_.read_forced(&bme_data);

    // set up the JSON file
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["temperature"] = bme_data.temperature;
    jsonDoc["humidity"] = bme_data.humidity;

    // serialize the JSON file
    char jsonBuffer[200];
    serializeJson(jsonDoc, jsonBuffer);
    data_.publish(jsonBuffer);

    // add debug led
    // cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
    // sleep_ms(250);
    // cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
    // sleep_ms(250);

    sleep_ms(5000);
}


void LynkTree::Debug(std::string message)
{
    debugMsg_.publish(message.c_str());
}
