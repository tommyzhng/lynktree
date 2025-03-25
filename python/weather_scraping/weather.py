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
            name = ['wind_speed', 'precipitation']

            weather_data_dict = {}
            for i in range(len(keys)):
                weather_data_dict[name[i]] = weather_data['current'][keys[i]]
            return weather_data_dict
        else:
            return None

# if __name__ == "__main__":
#     weather = Weather()
#     weather_data = weather.get_weather(latitude=-43.066667, longitude=171.026667) # Rainiest place on earth in Cropp River

#     if weather_data:
#         print(f"Weather Data for Cropp River:")
#         print(f"Wind Speed: {weather_data['Wind Speed']} km/h")
#         print(f"Precipitation: {weather_data['Precipitation']} mm")
#     else:
#         print("Failed to fetch weather data.")