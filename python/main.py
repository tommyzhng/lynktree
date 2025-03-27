from subscriber import Subscriber
from FWI import FWI
import time
from datetime import datetime
import json

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class Main:
    def __init__(self):
        self.sub = Subscriber()
        self.fwi = FWI()
        self.UPDATE_INTERVAL = 10
        self.n = 0
        self.data = {'1': {"status_error_code" : 1}, '2': {"status_error_code" : 1}}

    def update_fire_weather_index(self):
        for i in self.sub.curr_data.keys():
            if self.data[i]["status_error_code"] == 0 and self.sub.curr_data[i]["error_code"] != 3:
                weather_data = self.sub.curr_data[i]
                vFWI = self.fwi.run(weather_data, i)

                ret = {"fwi": vFWI, "fmcc": self.fwi.fmcc, "dmc": self.fwi.dmc, "dc": self.fwi.dc}
                self.data[i].update(ret)

    def update_values(self):
        for i in self.sub.curr_data.keys():
            self.data[i].update(self.sub.curr_data[i])
            today = datetime.today().strftime("%Y-%m-%d")
            full_datetime_str = f"{today} {self.sub.curr_data[i]['time']}"
            timestamp = time.mktime(time.strptime(full_datetime_str, "%Y-%m-%d %H:%M:%S"))

            # Compare with the current time > 10 seconds
            if time.time() - timestamp > 10:
                self.data[i]["status_error_code"] = 2
            else:
                self.data[i]["status_error_code"] = 0

# Create an instance of Main and store it in app config
app.config['main'] = Main()

@app.route('/api/get_data', methods=['GET'])
def run_fwi():
    main_instance = app.config['main']
    if len(main_instance.sub.curr_data) == 0:
        main_instance.data = {'1': {"status_error_code" : 1}, '2': {"status_error_code" : 1}}
    else:
        main_instance.update_values()
        if main_instance.n % main_instance.UPDATE_INTERVAL == 0:
            main_instance.update_fire_weather_index()
        main_instance.n += 1
    return jsonify(main_instance.data)

@app.route('/api/get_locations', methods=['GET'])
def get_locations():
    main_instance = app.config['main']
    return jsonify(main_instance.sub.locations)

@app.route('/api/add_location', methods=['POST'])
def add_location(request):
    main_instance = app.config['main']
    data = request.get_json()
    lat = data['lat']
    long = data['long']
    main_instance.sub.setNewLocation(lat, long)
    return jsonify(main_instance.sub.locations)



if __name__ == '__main__':
    app.run(port=5000, debug=True)
