from PyQt5.QtCore import QUrl
from PyQt5.QtWidgets import QApplication, QTabWidget, QVBoxLayout
from PyQt5.QtWebEngineWidgets import QWebEngineView 

import os
import sys
import gui  

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))

class MapsGUI:
    def __init__(self, ui: gui.Ui_LynktreeGUI):
        super().__init__()
        self.ui = ui

        web = QWebEngineView()
        filename = os.path.join(CURRENT_DIR, "map.html")
        url = QUrl.fromLocalFile(filename)
        web.load(url)

        # self.ui.mapsGUI.setLayout(QVBoxLayout())
        # self.ui.mapsGUI.layout().addWidget(web)
        
