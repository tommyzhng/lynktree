from subscriber import Subscriber
from fwi import FWI
import time
import json

def get_fire_weather_index(sub):
    fwi = FWI()
    for i in sub.curr_data.keys():
        weather_data = sub.curr_data[i]
        vFWI = fwi.run(weather_data, i)
        #Make dict of all important values

        ret = {"FWI": vFWI, "FMCC": fwi.fmcc, "DMC": fwi.dmc, "DC": fwi.dc, "time": fwi.time}
        sub.curr_data[i].append(ret)

if __name__ == "__main__":
    sub = Subscriber()
    time.sleep(5)

    UPDATE_INTERVAL = 30 #For FWI update (Minutes)
    PRINT_INTERVAL = 1 #For printing data for GUI to read (Minutes)

    n = 0
    while True:
        if n == 0:
            get_fire_weather_index(sub)
            n = UPDATE_INTERVAL

        # print(json.dumps(sub.curr_data)) #(, indent=4?) What is this for?
        test_data = {'1': {"temp": n, "humidity": 50, "wind_speed": 10, "rain": 0, "time": "2020-01-01 00:00:00"}, '2': {"temp": 20, "humidity": 50, "wind_speed": 10, "rain": 0, "time": "2020-01-01 00:00:00"}}
        print(json.dumps(test_data), flush=True)
        # time.sleep(60*m) # sleep for m minutes
        time.sleep(5)
        n -= 1
