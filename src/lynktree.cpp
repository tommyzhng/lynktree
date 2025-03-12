#include <lynktree.h>

LynkTree::LynkTree() {
    Serial.begin(115200);
    Serial.println("Connecting to Wi-Fi");
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

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Connected to Wi-Fi");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nConnection failed");
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
        Serial.println(mqtt.connectErrorString(ret));
        Serial.println("Retrying MQTT connection in 5 seconds...");
        mqtt.disconnect();
        delay(5000);  // wait 1 seconds
        retries--;
        if (retries == 0) {
            // die and let watchdog reset
            while (1);
        }
        for (int i = 0; i < ret+2; i++)
        {
            cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
            sleep_ms(250);
            cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
            sleep_ms(250);
        }

    }

    Serial.println("MQTT Connected!");
}

void LynkTree::BmeSetup()
{
    Serial.println(F("BME680 test"));
  
    if (!bme_.begin()) {
        Serial.println("Could not find a valid BME680 sensor, check wiring!");
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
        sleep_ms(250);
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
        sleep_ms(250);
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
        sleep_ms(250);
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
        sleep_ms(250);
        while (1);
    }
  
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
    data.publish(bme_.temperature);


    // add debug led
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
    sleep_ms(250);
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
    sleep_ms(250);

    sleep_ms(2000);
}

