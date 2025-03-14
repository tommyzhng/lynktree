
import sys
import os
import time
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from weather_scraping.Weather import Weather
import paho.mqtt.client as mqtt

class Subscriber:
    def __init__(self):
         # add more to these as you make more modules
        self.locations = {"1":{"lat":43.67, "long": -79.39}, #Myhall
                          "2":{"lat":26.61, "long": -81.08}} #Florida - Hendry County
        self.curr_data = {}
        self.weather = Weather()

        # setting up the mqtt client
        self.client = mqtt.Client()

        # defaults to connect to adafruit io
        self.AIO_server = "io.adafruit.com"
        self.AIO_serverport = 1883
        self.AIO_username = "CzarHC"
        self.AIO_key = "aio_oCiM51HqaA1iuzSgx1DUMfX9MQsY"
        self.topic = "/feeds/lynktree.comms"

        self.__connect() #connect to the mqtt broker

    def __connect(self):
        self.client.username_pw_set(self.AIO_username, self.AIO_key) # set the mqtt username and password
        self.client.connect(self.AIO_server, self.AIO_serverport) # connect to the mqtt broker
        for i in self.locations.keys(): # subscribe to all the locations
            self.client.subscribe(self.AIO_username + self.topic + i)
        self.client.on_message = self.__on_message
        self.client.loop_start() # start the mqtt loop to listen for messages
            
    def __on_message(self, client, userdata, msg):
        module_name = msg.topic[-1] # get the module name from the topic
        self.curr_data[module_name] = self.weather.get_weather(self.locations[module_name]["lat"], self.locations[module_name]["long"])
        value = json.loads(msg.payload.decode())  # Decode message
        self.curr_data[module_name].update(value)  # Update data dictionary
        # print(f"Updated {module_name}: {value}")
        return


if __name__ == "__main__":
    sub = Subscriber()
    while True:
        time.sleep(1) # sleep for 1 second
        print(sub.curr_data) # print the current data
