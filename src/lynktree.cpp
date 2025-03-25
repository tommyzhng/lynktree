#include <lynktree.h>

LynkTree::LynkTree() {
    Serial.begin(115200);
    WifiSetup();
    MqttSetup();
    BmeSetup();
    AccelSetup();
    BatterySetup();
}

void LynkTree::BatterySetup()
{
    if (!cyw43_arch_gpio_get(CYW43_WL_GPIO_VBUS_PIN)) {
        // Debug("Battery powered");
        using_battery_ = true;
    } else {
        // Debug("Powered by USB");
        using_battery_ = false;
    }
    pinMode(26, INPUT);
}

void LynkTree::RGBSetup() {
    // Set up the RGB LED
    pinMode(red_led_, OUTPUT);
    pinMode(green_led_, OUTPUT);
    pinMode(blue_led_, OUTPUT);
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
    // Debug("MQTT Connected!");
}

void LynkTree::BmeSetup()
{
    if (!bme_.init()) {
        // Debug("BME680 sensor not found!");
        return;
    }
    // Debug("BME680 sensor found!");

}

void LynkTree::AccelSetup()
{
    Wire.begin();

    if (!kxAccel_.begin()) {
        // Debug("KX132 sensor not found!");
        return;
    }
    //Debug("KX132 sensor found!");

    sleep_ms(500);

    if (kxAccel_.softwareReset()){
        // Debug("KX132 software reset successful!");
    } else {
        //  Debug("KX132 software reset failed!");
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
    // Debug("Kx132 setup complete!");
}

void LynkTree::update_battery_status()
{
    // Take an analog reading from GP26 (ADC0)
    int adc_value = analogRead(26);  // Reads a value between 0 and 1023 (10-bit resolution)

    // Convert ADC reading to voltage
    float voltage = adc_value * (3.3f / 1023.0f);
    
    //Debug(((String)voltage).c_str());

    voltage = floorf(voltage * 100) / 100; //2 decimals

    // Display power if it's changed
    battery_percent_ = (int) (((voltage - min_battery_volts_) / (max_battery_volts_ - min_battery_volts_)) * 100);
    //Debug(((String)battery_percent_).c_str());
}   

void LynkTree::loop()
{
    StaticJsonDocument<200> jsonDoc;

    //check if things are connected or not
    while (WiFi.status() != WL_CONNECTED) {
        // Debug("Wifi not connected");
        error_code_ = 1;
        WifiSetup();
    }

    while (!mqtt.connected()) {
        error_code_ = 2;
        MqttSetup();
    }

    //check orientation
    try{
        if (kxAccel_.tiltChange()) {
            error_code_ = 5;
        }
    } catch () {
        // Debug("Failed to read KX132 sensor data");
        error_code_ = 4;
        AccelSetup();
    }
   
    if (using_battery_) {
        update_battery_status();
        if (battery_percent_ < 10) {
            // Debug("Battery is low");
            error_code_ = 6;
        }
    }

    //put this in a try catch block
    auto result = bme_.read_forced(&bme_data_);
    if (result) {
        // set up the JSON file
        jsonDoc["temperature"] = bme_data_.temperature;
        jsonDoc["humidity"] = bme_data_.humidity;
    } else {
        // Debug("Failed to read BME680 sensor data");
        error_code_ = 3;
        BmeSetup();
    }
    
    // add the error code and the battery percent to the JSON file
    jsonDoc["error_code"] = error_code_;
    jsonDoc["battery_percent"] = battery_percent_;

    // serialize the JSON file
    char jsonBuffer[200];
    serializeJson(jsonDoc, jsonBuffer);

    //send the data
    data_.publish(jsonBuffer);

    sleep_ms(5000);
}


void LynkTree::Debug(std::string message)
{
    debugMsg_.publish(message.c_str());
}
