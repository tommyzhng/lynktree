import sys
import os.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import math
import json
import time

#Need the temp + humidity from Hari + Tommy
from subscriber.subscriber import Subscriber
from weather_scraping import Weather

class FWI:
    def __init__(self):
        self.weather = Weather()

        #Previous variable - call on previous_data file
        #Get current month
        self.month = time.strftime("%B") #Get current month
        # self.month = "March" #Needed for the DMC and DC
        
        self.rainfall_0 = 0 #Initial rainfall set to 0
        self.time_0 = 0 #Previous value of time used to determine if sensor stops working

        self.vm = 0 #Needed for ISI calculation, obtained from FMCC

        #Current indicator values
        self.fmcc = 0
        self.dmc = 0
        self.dc = 0

        #Previous values of indicators
        self.fmcc_0 = 0
        self.dmc_0 = 0
        self.dc_0 = 0

        #Raw data values web scraped + taken off sensor
        self.rainfall = 0
        self.humidity = 0
        self.wind_speed = 0
        self.temperature = 0
        self.time = 0

    def __update(self, weather_data, id):
        #Update the current rainfall, humidity etc.. values
        #https://www.rdocumentation.org/packages/cffdrs/versions/1.8.20/topics/fwi for default values
        scraping = self.weather.get_weather(weather_data['latitude'], weather_data['longitude'])

        self.temperature = weather_data['temperature']
        self.humidity = weather_data['humidity']
        if scraping['wind_speed'] != None:
            self.rainfall = scraping['precipitation']
            self.wind_speed = scraping['wind_speed']
        self.time = weather_data['time']

        #If file does not exist, use default values given by standards
        if not os.path.exists(os.path.join(os.path.dirname(__file__), "previous_data/previous_data"+str(id)+".json")):
            self.fmcc_0 = 85
            self.dmc_0 = 6
            self.dc_0 = 15
            self.rainfall_0 = self.rainfall #Set the initial rainfall value to the current rainfall value
            self.time_0 = self.time
        else:
            with open(os.path.join(os.path.dirname(__file__), "previous_data/previous_data"+str(id)+".json"), "r") as f:
                # #get only the last line of the file
                # prev_values_dict = json.loads(f.readlines()[-1])
                prev_values_dict = json.loads(f.read())
                # prev_values_dict = json.loads(f.read())
                self.fmcc_0 = prev_values_dict["FMCC"]
                self.dmc_0 = prev_values_dict["DMC"]
                self.dc_0 = prev_values_dict["DC"]
                self.rainfall_0 = prev_values_dict["Rainfall"]
                self.time_0 = prev_values_dict["time"]
    
    #Save values into json file for future calculations
    def __save(self, id):
        # Define the directory path
        directory = os.path.join(os.path.dirname(__file__), "previous_data")
        
        # Create the directory if it doesn't exist
        os.makedirs(directory, exist_ok=True)
        file_path = os.path.join(directory, f"previous_data{id}.json")
        prev_values_dict = {
            "FMCC": self.fmcc,
            "DMC": self.dmc,
            "DC": self.dc,
            "Rainfall": self.rainfall,
            "time": self.time
        }
        with open(file_path, "w") as f:
            json.dump(prev_values_dict, f)
        
#Updates values, needs to be saved
    def __FMCC(self):  

        """Fine Fuel Moisture Code:
        
        Numeric rating of the moisture content of litter and other cured fine fuels.
        This code is an indicator of the relative ease of ignition and the flammability of fine fuel.  
        """

        #Initalize variables
        vF_0 = self.fmcc_0 #Previous FMCC value
        vr_f =  self.rainfall
        vH = self.humidity
        vT = self.temperature
        vW = self.wind_speed

        vm = 0 #Fine fuel moisture CONTENT of current day
        vk_o = 0
        vk_d = 0
        vE_w = 0
        
        #Start calculations
        vm_0 = 147.2 * (101 - vF_0) / (59.5 + vF_0) #Fine fuel moisture CONTENT from previous day
        if self.rainfall_0 > 0.5:
            vr_f -= 0.5
        
            vm_r = vm_0 + 42.5 * vr_f * (math.exp(-100/(251-vm_0)) * (1 - math.exp(-6.93 / vr_f)))
            if vm_0 > 150:
                vm_r += 0.0015*(vm_0 - 150)**2 * vr_f**0.5
            if vm_r > 250:
                vm_r = 250
            vm_0 = vm_r
        
        vE_d = 0.942 * vH**0.679 + 11 * math.exp((vH - 100) / 10) + 0.18 * (21.1 - vT) * (1 - math.exp(-0.115 * vH))

        if vm_0 > vE_d:
            vk_o = 0.424 * (1 - (vH / 100)**1.7) + 0.0694 * vW**0.5
            vk_d = vk_o * 0.581 * math.exp(0.0365 * vT)
            vm = vE_d + (vm_0 - vE_d) * 10**-vk_d
        elif vm_0 < vE_d:
            vE_w = 0.618 * vH**0.753 + 10 * math.exp((vH - 100) / 10) + 0.18 * (21.1 - vT) * (1 - math.exp(-0.115 * vH))
        
        if vE_d >= vm_0 and vm_0 >= vE_w:
            vm = vm_0 #Set current fine fuel moisture CONTENT as that of the previous day
        
        vF = 59.5 * (250 - vm) / (147.2 + vm)

        self.vm = vm
        self.fmcc = vF
        
    def __DMC(self):

        """Duff Moisture Code:
        
         Numeric rating of the average moisture content of loosely compacted organic layers of moderate depth. 
         Code gives an indication of fuel consumption in moderate duff layers and medium-size woody material.
        """

        vP_0 = self.dmc_0
        vT = self.temperature
        vH = self.humidity
        vM = self.month
        vr_0 = self.rainfall #Current rainfall
        
        vL_e = {"January": 6.5,
            "February": 7.5,
            "March": 9.0,
            "April": 12.8,
            "May": 13.9,
            "June": 13.9,
            "July": 12.4,
            "August": 10.9,
            "September": 9.4,
            "October": 8.0,
            "November": 7.0,
            "December": 6.0
        } #Effective day-lengths

        if vr_0 > 1.5: 
            vr_e = 0.92 * vr_0 - 1.27
            vM_0 = 20 + math.e ** (5.6348 - vP_0/43.43) #Duff moisture CONTENT from prevoius day
            
            if vP_0 <= 33:
                vb = 100 / (0.5 + 0.3 * vP_0)
            if 33 < vP_0 <= 65:
                vb = 14 - 1.3 * math.log(vP_0)
            else: 
                vb = 6.2 * math.log(vP_0) - 17.2
            vM_r = vM_0 + 1000 * vr_e / (48.77 + vb * vr_e) #Duff moisture CONTENT of current day
            vP_r = 244.72 - 43.43 * math.log(vM_r - 20)

            if vP_r < 0:
                vP_r = 0
        
        if vT < -1.1:
            vT = -1.1
            
        vK = 1.894 * (vT + 1.1) * (100 - vH) * vL_e[vM] * 10 **(-6)

        if vr_0 > 1.5:
            vP = vP_r + 100 * vK
        
        else:
            vP = vP_0 + 100 * vK

        self.dmc = vP

    def __DC(self):

        """
        Drought Code:

        Numeric rating of the average moisture content of deep, compact organic layers.
        Useful indicator of seasonal drought effects on forest fuels and the amount of smoldering in deep duff layers and large logs.
        """

        vr_0 = self.rainfall #Current rainfall
        vD_0 = self.dc_0 #Previous day DC
        vT = self.temperature
        vM = self.month

        vL_f = {"January": -1.6,
            "February": -1.6,
            "March": -1.6,
            "April": 0.9,
            "May": 3.8,
            "June": 5.8,
            "July": 6.4,
            "August": 5.0,
            "September": 2.4,
            "October": 0.4,
            "November": -1.6,
            "December": -1.6
        } #Effective day-lengths
        
        if vr_0 > 2.8:       
            vr_d = 0.83 * vr_0 - 1.27
            vQ_0 = 800 * math.e ** (-vD_0 / 400) #Moisture equivalent of previous day's DC
            vQ_r = vQ_0 + 3.937 * vr_d #Moisture equivalent after rain
            vD_r = 400 * math.log(800 / vQ_r)
        
        vV = 0.36 * (vT + 2.8) + vL_f[vM]

        if vr_0 > 2.8:
            vD = vD_r + 0.5 * vV
        else:
            vD = vD_0 + 0.5 * vV

        self.dc = vD

#Returns values
    def __ISI(self):
        
        """
        Initial Spread Index:

        Numeric rating of the expected rate of fire spread. 
        It is based on wind speed and FFMC.
        It does not take into account fuel type.        
        """

        vW = self.wind_speed
        self.__FMCC() #Updates self.vm, value of FMCC never actually used
        vm = self.vm

        vf_W = math.exp(0.05039 * vW) #Wind function
        vf_F = 91.9 * math.exp(-0.1386 * vm) * (1 + vm**5.31 / (4.93 * 10**7)) #Fine fuel moisture function
        vR = 0.208 * vf_W * vf_F #ISI value
        return vR
    
    def __BUI(self):

        """
        Buildup Index:

        Numeric rating of the total amount of fuel available for combustion
        Based on the DMC and the DC. 
        Generally less than twice the DMC value, and moisture in the DMC layer is expected to help prevent burning in material deeper down in the available fuel.
        """

        self.__DC()
        self.__DMC()
        
        vD = self.dc #DC value
        vP = self.dmc #DMC value
        vU = 0 #BUI value

        if vP <= 0.4 * vD:
            vU = 0.8 * vP * vD / (vP + 0.4 * vD)
        else:
            vU = vP - (1 - 0.8 * vD / (vP + 0.4 * vD)) * (0.92 + (0.0114 * vP)**1.7)
        return vU

    def __FWI(self):

        """
        Fire Weather Index

        Numeric rating of fire intensity.
        It is based on the ISI and the BUI, and is used as a general index of fire danger throughout the forested areas of Canada.
        """

        vU = self.__BUI() #BUI value
        vR = self.__ISI() #ISI value
        vFD = 0 #Duff moisture function
        vS = 0 #FWI value
        if vU <= 80:
            vFD = 0.626 * vU**0.809 + 2
        else:
            vFD = 1000 / (25 + 108.64 * math.exp(-0.023 * vU))
        
        vB = 0.1 * vR * vFD #FWI value (intermediate form)

        if vB > 1:
            vS = math.exp(2.72 * (0.434 * math.log(vB))**0.647)
        else:
            vS = vB
        
        return vS #FWI value (final form)

    def __error(self, id):
        #If the sensor stops working, return an error message
        #time format is HH:MM:SS
        #if more than 30 seconds have passed, print error
        if int(self.time[6:8]) - int(self.time_0[6:8]) > 30:
            print("Sensor "+str(id)+" not working for: "+str(int(self.time[6:8]) - int(self.time_0[6:8]))+" seconds")

    def run(self, weather_data, id):
        #Obtaining data
        self.__update(weather_data, id)
        # self.__error(id)
        fwi = self.__FWI()
        self.__save(id)
        return fwi

#Test code

if __name__ == "__main__":
    sub = Subscriber()
    time.sleep(5)
    print(sub.curr_data)
    fwi = FWI()

    for i in sub.curr_data.keys():
        weather_data = sub.curr_data[i]
        vFWI = fwi.run(weather_data, i)
        #Make dict of all important values

        ret = {"FWI": vFWI, "FMCC": fwi.fmcc, "DMC": fwi.dmc, "DC": fwi.dc}
        print(json.dumps(ret))