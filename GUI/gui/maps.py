from PyQt5.QtCore import QUrl
from PyQt5.QtWidgets import QApplication, QTabWidget, QVBoxLayout
from PyQt5.QtWebEngineWidgets import QWebEngineView
import folium

import os
import io
import gui  
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

class MapsGUI:
    def __init__(self, ui: gui.Ui_LynktreeGUI):
        super().__init__()
        self.ui = ui
        self.coordinates = (43.6622993431624, -79.39552899809453)

        self.map = folium.Map(
            title='Toronto',
            zoom_start=16,
            location=self.coordinates
        )

        data = io.BytesIO()
        self.map.save(data, close_file=False)

        self.webView = QWebEngineView()
        self.webView.setHtml(data.getvalue().decode())

        self.ui.lyMaps.addWidget(self.webView)


    def update_map(self, new_image=None):
        image = np.zeros((61, 61))
        image[0, :] = 1.0
        image[60, :] = 1.0
        image[:, 0] = 1.0
        image[:, 60] = 1.0
        folium.raster_layers.ImageOverlay(
            image=image,
            bounds=[[43.661, -79.397], [43.664, -79.394]],
            colormap=lambda x: (1, 0, 0, x),
        ).add_to(self.map)

        data = io.BytesIO()
        self.map.save(data, close_file=False)
        self.webView.setHtml(data.getvalue().decode())
        

        
