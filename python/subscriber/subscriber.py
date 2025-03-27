
import sys
import os
import time
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from weather_scraping import Weather
import paho.mqtt.client as mqtt


class Subscriber:
    def __init__(self):
        # Load locations from a JSON file
        with open('python/subscriber/locations.json') as file:
            self.locations = json.load(file)
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
        weather_data = self.weather.get_weather(self.locations[module_name]["lat"], self.locations[module_name]["long"])

        # if the API call fails, return None - uncomment this if you want to see the error message - Alex
        # if weather_data == None:
        #     print("API call failed")

        
        self.curr_data[module_name] = weather_data
        value = json.loads(msg.payload.decode())  # Decode message
        self.curr_data[module_name].update(value)  # Update data dictionary
        self.curr_data[module_name]["time"] = time.strftime("%H:%M:%S")  # format in HH:MM:SS
        # print(f"Updated {module_name}: {value}")
        return

    def getLocation(self, num = 0):
        if num == 0:
            return self.locations
        else:
            return self.locations[num]
    
    def setNewLocation(self, lat, long):
        self.locations[len(self.locations) + 1] = {"lat": lat, "long": long}
        self.saveLocations_()
        self.client.subscribe(self.AIO_username + self.topic + (len(self.locations)+1))
        return True
    
    def updateLocation(self, num, lat, long):
        self.locations[num] = {"lat": lat, "long": long}
        self.saveLocations_()
        return True
    
    def removeLocation(self, num):
        del self.locations[num]
        self.saveLocations_()
        return True
    
    def saveLocations_(self):
        with open('python/subscriber/locations.json', 'w') as file:
            json.dump(self.locations, file)
        return True

# for testing
if __name__ == "__main__":
    sub = Subscriber()
    while True:
        time.sleep(5) # sleep for 1 second
        print(sub.curr_data) # print the current data
    
