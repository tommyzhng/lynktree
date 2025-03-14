import sys
import subprocess
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QTimer, QThread
#from FWI import FWI
import gui


if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    LynktreeGUI = QtWidgets.QTabWidget()
    ui = gui.Ui_LynktreeGUI()
    ui.setupUi(LynktreeGUI)

    maps = gui.MapsGUI(ui)
    

    LynktreeGUI.show()
    print("System Started")
    sys.exit(app.exec())