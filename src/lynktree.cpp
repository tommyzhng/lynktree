#include <lynktree.h>

LynkTree::LynkTree() {
    Serial.begin(115200);
    BatterySetup();
    WifiSetup();
    MqttSetup();
    BmeSetup();
    AccelSetup();
}

void LynkTree::BatterySetup()
{
    if (!cyw43_arch_gpio_get(CYW43_WL_GPIO_VBUS_PIN)) {
        Debug("Battery powered");
        using_battery_ = true;
    } else {
        Debug("Powered by USB");
        using_battery_ = false;
    }

}

void LynkTree::RGBSetup() {
    // Set up the RGB LED
    pinMode(red_led, OUTPUT);
    pinMode(green_led, OUTPUT);
    pinMode(blue_led, OUTPUT);
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
        //Serial.print(".");
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

void LynkTree::AccelSetup()
{
    Wire.begin();

    if (!kxAccel_.begin()) {
        Debug("KX132 sensor not found!");
        return;
    }
    //Debug("KX132 sensor found!");

    sleep_ms(500);

    if (kxAccel_.softwareReset()){
        // Debug("KX132 software reset successful!");
    } else {
         Debug("KX132 software reset failed!");
    }
    sleep_ms(5);

    kxAccel_.enableAccel(false);

    kxAccel_.setRange(SFE_KX132_RANGE2G); // 16g Range
    // kxAccel_.setRange(SFE_KX134_RANGE16G);         // 16g for the KX134

    kxAccel_.enableTiltEngine(true);
    // kxAccel_.enableSleepEngine(true);
    // kxAccel_.enableWakeEngine(true);
    
    kxAccel_.enableAccel(true);

    sleep_ms(20);

    kxAccel_.tiltChange(); // 0x01 = 0.063g
    kxAccel_.clearInterrupt();

    // kxAccel_.forceSleep();
    Debug("Kx132 setup complete!");
}

void LynkTree::update_battery_status()
{
    
    // read the voltage at the adc0 pin
    adc_select_input(0);
    const float conversionFactor = 3.3f / (1 << 12);
    float voltage = (float)adc_read() * conversionFactor;

    voltage = floorf(voltage * 100) / 100; //2 decimals

    // Display power if it's changed
    battery_percent_ = (int) (((voltage - min_battery_volts_) / (max_battery_volts_ - min_battery_volts_)) * 100);
}   

void LynkTree::loop()
{
    // data.publish(x_++);
    auto result = bme_.read_forced(&bme_data_);

    // set up the JSON file
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["temperature"] = bme_data_.temperature;
    jsonDoc["humidity"] = bme_data_.humidity;

    // serialize the JSON file
    char jsonBuffer[200];
    serializeJson(jsonDoc, jsonBuffer);
    data_.publish(jsonBuffer);

    //check orientation
    if (kxAccel_.tiltChange()) {
        Debug("device has moved!");
    } else {
        Debug("No Fall");
        kxAccel_.clearInterrupt();
    }
    kxAccel_.clearInterrupt();
   
    // sleep_ms(5);
    // Debug(kxAccel_.getOperatingMode() == 0 ? "Low Power Mode" : "High Power Mode");
    if (using_battery_) {
        update_battery_status();
    }

    //Debug(("Current battery level:" + String(percent_buf_)).c_str());

    sleep_ms(5000);
}


void LynkTree::Debug(std::string message)
{
    debugMsg_.publish(message.c_str());
}
