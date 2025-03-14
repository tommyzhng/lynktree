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
    debugMsg_.publish("MQTT Connected!");
}

void LynkTree::BmeSetup()
{
    Wire.begin(0x77);
    if (!bme_.begin()) {
        debugMsg_.publish("Could not find a valid BME680 sensor, check wiring!");
        while (1);
    }
    debugMsg_.publish("BME680 sensor found!");
  
    // Set up oversampling and filter initialization
    bme_.setTemperatureOversampling(BME680_OS_8X);
    bme_.setHumidityOversampling(BME680_OS_2X);
    bme_.setPressureOversampling(BME680_OS_4X);
    bme_.setIIRFilterSize(BME680_FILTER_SIZE_3);
    bme_.setGasHeater(320, 150); // 320*C for 150 ms
}


void LynkTree::loop()
{
    // data.publish(x_++);
    data_.publish(bme_.temperature);

    // add debug led
    // cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
    // sleep_ms(250);
    // cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
    // sleep_ms(250);

    sleep_ms(2000);
}


void LynkTree::Debug(std::string message)
{
    debugMsg_.publish(message.c_str());
}
