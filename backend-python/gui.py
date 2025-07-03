"""
This file is the main file, where everything is integrated and ran into the PyQt5 GUI

Usage: gui.py
"""

import sys
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QTimer, QThread
import gui


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    LynktreeGUI = QtWidgets.QTabWidget()
    ui = gui.Ui_LynktreeGUI()
    ui.setupUi(LynktreeGUI)

    maps = gui.MapsGUI(ui)
    maps.update_map()

    LynktreeGUI.show()
    print("System Started")
    sys.exit(app.exec())