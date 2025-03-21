#include <lynktree.h>

LynkTree::LynkTree() {
    Serial.begin(115200);
    WifiSetup();
    MqttSetup();
    BmeSetup();
    AccelSetup();
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
    // Debug("KX132 sensor found!");

    sleep_ms(500);

    if (kxAccel_.softwareReset()){
        // Debug("KX132 software reset successful!");
    } else {
        // Debug("KX132 software reset failed!");
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

}

int LynkTree::power_source(bool *battery_powered)
{
    #if defined CYW43_WL_GPIO_VBUS_PIN
        *battery_powered = !cyw43_arch_gpio_get(CYW43_WL_GPIO_VBUS_PIN);
        Debug("Power source pin defined");
        return PICO_OK;
    #endif
    Debug("No power source pin defined");
}

int LynkTree::power_voltage(float *voltage_result){
    #if CYW43_USES_VSYS_PIN
        cyw43_thread_enter();
        // Make sure cyw43 is awake
        cyw43_arch_gpio_get(CYW43_WL_GPIO_VBUS_PIN);
    #endif

    // setup adc
    adc_gpio_init(PICO_VSYS_PIN);
    adc_select_input(PICO_VSYS_PIN - PICO_FIRST_ADC_PIN);

    adc_fifo_setup(true, false, 0, false, false);
    adc_run(true);

    // We seem to read low values initially - this seems to fix it
    int ignore_count = PICO_POWER_SAMPLE_COUNT;
    while (!adc_fifo_is_empty() || ignore_count-- > 0) {
        (void)adc_fifo_get_blocking();
    }

    // read vsys
    uint32_t vsys = 0;
    for(int i = 0; i < PICO_POWER_SAMPLE_COUNT; i++) {
        uint16_t val = adc_fifo_get_blocking();
        vsys += val;
    }

    adc_run(false);
    adc_fifo_drain();

    vsys /= PICO_POWER_SAMPLE_COUNT;
    #if CYW43_USES_VSYS_PIN
        cyw43_thread_exit();
    #endif
        // Generate voltage
        const float conversion_factor = 3.3f / (1 << 12);
        *voltage_result = vsys * 3 * conversion_factor;
        return PICO_OK;
}

void LynkTree::update_battery_status()
{
    if (power_source(&battery_status_) == PICO_OK) {
        power_str_ = battery_status_ ? "BATTERY" : "POWERED";
    }

    // Get voltage
    float voltage = 0;
    int voltage_return = power_voltage(&voltage);
    voltage = floorf(voltage * 100) / 100;

    // Display power if it's changed
    if (old_battery_status_ != battery_status_ || old_voltage_ != voltage) {
        if (battery_status_ && voltage_return == PICO_OK) {
            int percent_val = (int) (((voltage - min_battery_volts_) / (max_battery_volts_ - min_battery_volts_)) * 100);
            snprintf(percent_buf_, sizeof(percent_buf_), " (%d%%)", percent_val);
        }

        // Also get the temperature - NOT SURE HOW THIS WORKS??
        adc_select_input(4);
        const float conversionFactor = 3.3f / (1 << 12);
        float adc = (float)adc_read() * conversionFactor;
        float tempC = 27.0f - (adc - 0.706f) / 0.001721f;

        old_battery_status_ = battery_status_;
        old_voltage_ = voltage;
    }
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

    //update_battery_status();
    //Debug(("Current battery level:" + String(percent_buf_)).c_str());

    sleep_ms(5000);
}


void LynkTree::Debug(std::string message)
{
    debugMsg_.publish(message.c_str());
}
