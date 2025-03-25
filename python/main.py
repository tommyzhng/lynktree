from subscriber import Subscriber
from FWI import FWI
import time
from datetime import datetime
import json

def get_fire_weather_index(sub, return_data, fwi, i):
    if return_data[i]["status_error_code"] == 0:
        weather_data = sub.curr_data[i]
        vFWI = fwi.run(weather_data, i)

        ret = {"fwi": vFWI, "fmcc": fwi.fmcc, "dmc": fwi.dmc, "dc": fwi.dc}
        return_data[i].update(ret)

if __name__ == "__main__":
    sub = Subscriber()
    fwi = FWI()
    time.sleep(5)

    UPDATE_INTERVAL = 30 #For FWI update (Seconds)
    PRINT_INTERVAL = 1 #For printing data for GUI to read (Seconds)

    return_data = {'1': {"status_error_code" : 0}, '2': {"status_error_code" : 0}}
    
    n = 0
    while True:
        #sub.curr_data gets overwritten by its own class, return_data will be a copy but does not get overwritten so the fmcc and other values will be saved
        for i in sub.curr_data.keys():
            return_data[i].update(sub.curr_data[i])
        if len(sub.curr_data) == 0:
            return_data = {'1': {"status_error_code" : 1}, '2': {"status_error_code" : 1}}
        else:
            for i in sub.curr_data.keys():
                if sub.curr_data[i]["error_code"] != 3:
                    if n == 0:
                        get_fire_weather_index(sub, return_data, fwi, i)
                        n = UPDATE_INTERVAL

                    today = datetime.today().strftime("%Y-%m-%d")
                    full_datetime_str = f"{today} {sub.curr_data[i]['time']}"
                    timestamp = time.mktime(time.strptime(full_datetime_str, "%Y-%m-%d %H:%M:%S"))

                    # Compare with the current time > 10 seconds
                    if time.time() - timestamp > 10:
                        return_data[i]["status_error_code"] = 2
                    else:
                        return_data[i]["status_error_code"] = 0

        print(json.dumps(return_data), flush=True)

        time.sleep(PRINT_INTERVAL)
        n -= 1
