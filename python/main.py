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

        #Check if the time difference between now and the last update is greater than 30 seconds, time format is HH:MM:SS
        if time.time() - time.mktime(time.strptime(weather_data["time"], "%Y-%m-%d %H:%M:%S")) > 30:
            sub.curr_data[i]["error_code"] = 1
        else:
            sub.curr_data[i]["error_code"] = 0

        ret = {"FWI": vFWI, "FMCC": fwi.fmcc, "DMC": fwi.dmc, "DC": fwi.dc}
        sub.curr_data[i].append(ret)

if __name__ == "__main__":
    sub = Subscriber()
    time.sleep(5)

    UPDATE_INTERVAL = 30 #For FWI update (Minutes)
    PRINT_INTERVAL = 1 #For printing data for GUI to read (Seconds)
    
    n = 0
    while True:
        if n == 0:
            get_fire_weather_index(sub)
            n = UPDATE_INTERVAL
        if len(sub.curr_data) == 0:
            print(json.dumps({'1': {"error_code" : -1}, '2': {"error_code" : -1}}), flush=True)
        else:
            print(json.dumps(sub.curr_data), flush=True) #(, indent=4?) What is this for?
        
        # test_data = {'1': {"temperature": n, "humidity": 50, "wind_speed": 10, "rain": 0, "time": "2020-01-01 00:00:00", "error_code": 1}, '2': {"temperature": 20, "humidity": 50, "wind_speed": 10, "rain": 0, "time": "2020-01-01 00:00:00", "error_code": 0}}
        # print(json.dumps(test_data), flush=True)

        time.sleep(PRINT_INTERVAL)
        n -= 1
