
#Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
#venv\scripts\activate

import requests

# Example usage for Toronto Coordinates
# weather = Weather()
# weather.get_weather(latitude = 43.6570, longitude = -79.3903)

class Weather:
    '''
    Class to get weather data for a given latitude and longitude\n
    Returns {'Wind Speed': %f, 'Precipitation': %f}\n
    Wind speed in km/h and Precipitation in mm\n
    Returns None if API call fails\n\n

    Example usage for Toronto Coordinates\n
    weather = Weather()\n
    weather.get_weather(latitude = 43.6570, longitude = -79.3903)\n
    '''
    def __init__(self):
        pass
    
    # Call function
    def get_weather(self, latitude, longitude):
        return self.__fetch_weather(latitude, longitude)

    # Private function for API call
    def __fetch_weather(self, latitude, longitude):
        url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation"

        response = requests.get(url)
        
        if response.status_code == 200:
            weather_data = response.json()
            keys = ['wind_speed_10m', 'precipitation']
            name = ['Wind Speed', 'Precipitation']

            weather_data_dict = {}
            for i in range(len(keys)):
                weather_data_dict[name[i]] = weather_data['current'][keys[i]]
            return weather_data_dict
        else:
            return None
