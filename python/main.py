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

    #only run fwi calculation and update sub every n minutes and print the data every m minute
    n = 30
    m = 1
    while True:
        n -= 1
        if n == 0:
            get_fire_weather_index(sub)
            n = 30

        print(json.dumps(sub.curr_data)) #(, indent=4?) What is this for?
        # time.sleep(60*m) # sleep for m minutes
        time.sleep(5)
        
