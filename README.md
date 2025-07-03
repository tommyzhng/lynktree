## Lynktree - A Network of Wildfire Risk Sensors

Lynktree is an embedded IoT system designed to monitor environmental fire risks through a network of distributed sensors. After data is collected from the network, it is passed through MQTT to a backend server, which calculates the fire risk based on the [FWI](https://cwfis.cfs.nrcan.gc.ca/background/summary/fwi) evaluation system. This info, along with device health, is displayed on a website-based GUI.

This repository consists of:
* Device firmware with a PlatformIO embedded C++ environment for a Raspberry Pi Pico W.
* A React JS website to actively monitor fire risk and device health.
  * https://tommyzhng.github.io/lynktree/
