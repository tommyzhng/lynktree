import sys
import os.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import math

# Need the temp + humidity from Hari + Tommy
from weather_scraping.weather import Weather

class FWI:
    def __init__(self):
        #Previous variable - call on previous_data file
        self.month = "March" # Needed for the DMC
        
        self.rainfall_0 = 0
        self.humidity_0 = 0
        self.wind_speed_0 = 0
        self.temperature_0 = 0

        self.vm = 0 #Needed for ISI calculation, obtained from FMCC

        self.fmcc_0 = 0
        self.dmc_0 = 0
        self.dc_0 = 0

        self.rainfall = 0
        self.humidity = 0
        self.wind_speed = 0
        self.temperature = 0

    def __update(self):
        #Update the current rainfall, humidity etc.. values
        pass
    
    def __FMCC(self):
        
        #Initalize variables
        vF_0 = self.fmcc_0
        vr_f =  self.rainfall
        vH = self.humidity
        vT = self.temperature
        vW = self.wind_speed

        vm = 0
        vk_o = 0
        vk_d = 0
        vE_w = 0
        
        #Start calculations
        vm_0 = 147.2*(101-vF_0)/(59.5+vF_0)
        if self.rainfall_0 > 0.5:
            vr_f -= 0.5
        
            vm_r = vm_0 + 42.5*vr_f*(math.exp(-100/(251-vm_0))*(1-math.exp(-6.93/vr_f)))
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
            vm = vm_0
        
        vF = 59.5 * (250 - vm) / (147.2 + vm)

        self.vm = vm
        return vF           
        
    def __DMC(self):
        vP_0 = self.dmc_0
        vT = self.temperature
        vH = self.humidity
        vM = self.month
        vr_0 = self.rainfall
        
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
        } # Effective day-lengths

        if vr_0 > 1.5: 
            vr_e = 0.92 * vr_0 - 1.27
            vM_0 = 20 + math.e ** (5.6348 - vP_0/43.43)
            
            if vP_0 <= 33:
                vb = 100 / (0.5 + 0.3 * vP_0)
            if 33 < vP_0 <= 65:
                vb = 14 - 1.3 * math.log(vP_0)
            else: 
                vb = 6.2 * math.log(vP_0) - 17.2
            vM_r = vM_0 + 1000 * vr_e / (48.77 + vb * vr_e)
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

        return vP

    def __DC(self):
        vr_0 = self.rainfall
        vD_0 = self.dc_0
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
        } # Effective day-lengths
        
        if vr_0 > 2.8:       
            vr_d = 0.83 * vr_0 - 1.27
            vQ_0 = 800 * math.e ** (-vD_0 / 400)
            vQ_r = vQ_0 + 3.937 * vr_d
            vD_r = 400 * math.log(800 / vQ_r)
        
        vV = 0.36 * (vT + 2.8) + vL_f[vM]

        if vr_0 > 2.8:
            vD = vD_r + 0.5 * vV
        else:
            vD = vD_0 + 0.5 * vV

        return vD

    def __ISI(self):
        vW = self.wind_speed
        self.__FMCC() #Updates self.vm, value of FMCC never actually used
        vm = self.vm

        vf_W = math.exp(0.05039 * vW)
        vf_F = 91.9 * math.exp(-0.1386 * vm) * (1 + vm**5.31 / (4.93 * 10**7))
        vR = 0.208 * vf_W * vf_F
        return vR
    
    def __BUI(self):
        vD = self.__DC()
        vP = self.__DMC()
        vU = 0

        if vP <= 0.4 * vD:
            vU = 0.8 * vP * vD / (vP + 0.4 * vD)
        else:
            vU = vP - (1 - 0.8 * vD / (vP + 0.4 * vD)) * (0.92 + (0.0114 * vP)**1.7)
        return vU

    def __FWI(self):
        vU = self.__BUI()
        vR = self.__ISI()
        vFD = 0
        vS = 0
        if vU <= 80:
            vFD = 0.626 * vU**0.809 + 2
        else:
            vFD = 1000 / (25 + 108.64 * math.exp(-0.023 * vU))
        
        vB = 0.1 * vR * vFD

        if vB > 1:
            vS = math.exp(2.72 * (0.434 * math.log(vB))**0.647)
        else:
            vS = vB
        
        return vS


    def test(self, latitude, longitude):
        weather = Weather()
        return weather.get_weather(latitude, longitude)

#Example usage
f = FWI()
print(f.test(40.7128, -74.0060)) #Expected output: {'Wind Speed': 7.2, 'Precipitation': 0.0}