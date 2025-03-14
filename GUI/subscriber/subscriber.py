
import time
from weather_scraping.Weather import Weather
import paho.mqtt.client as mqtt


class Subscriber:
    def __init__(self):
        self.locations = {"1":{"lat":1.0, "long": 1.0}}
        self.weather = Weather()

        # setting up the mqtt client
        self.client = mqtt.Client()

        self.AIO_server = "io.adafruit.com"
        self.AIO_serverport = 1883
        self.AIO_username = "CzarHC"
        self.AIO_key = "aio_oCiM51HqaA1iuzSgx1DUMfX9MQsY"
        self.topic = "/feeds/lynktree.comms"

        self.__connect(self) #connect to the mqtt broker

    def __connect(self):
        self.client.username_pw_set(self.AIO_USERNAME, self.AIO_KEY)
        self.client.connect(self.AIO_server, self.AIO_serverport)
        self.client.subscribe(self.topic)
            
    def __get_data(self):

        return

    def __update(self):
        # update the weather data for all locations
        data = {}
        for location in self.locations:
            self.weather.get_weather(self.locations[location]["lat"], self.locations[location]["long"])
            data[location] = self.weather.get_data()
