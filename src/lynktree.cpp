#include <lynktree.h>

LynkTree::LynkTree() {
    Serial.begin(115200);
    if (cyw43_arch_init()) {
        return;
    }

    WiFi.begin(ssid_, password_);
    Serial.println("Connecting to Wi-Fi");

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

void LynkTree::loop()
{
    Serial.println("Hello");
    delay(1000);
}

