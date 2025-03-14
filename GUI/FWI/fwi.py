import sys
import os.path

#Change path to the parent folder for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.path.pardir)))

from weather_scraping.weather import Weather

class fwi:
    def __init__(self):
        pass

    def test(self, latitude, longitude):
        weather = Weather()
        return weather.get_weather(latitude, longitude)

#Example usage
f = fwi()
print(f.test(40.7128, -74.0060)) #Expected output: {'Wind Speed': 7.2, 'Precipitation': 0.0}