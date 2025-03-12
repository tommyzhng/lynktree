# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'GUI/gui/lynktree.ui'
#
# Created by: PyQt5 UI code generator 5.14.1
#
# WARNING! All changes made in this file will be lost!


from PyQt5 import QtCore, QtGui, QtWidgets


class Ui_LynktreeGUI(object):
    def setupUi(self, LynktreeGUI):
        LynktreeGUI.setObjectName("LynktreeGUI")
        LynktreeGUI.resize(546, 414)
        self.webView = QtWebKitWidgets.QWebView(LynktreeGUI)
        self.webView.setGeometry(QtCore.QRect(90, 70, 300, 200))
        self.webView.setUrl(QtCore.QUrl("about:blank"))
        self.webView.setObjectName("webView")

        self.retranslateUi(LynktreeGUI)
        QtCore.QMetaObject.connectSlotsByName(LynktreeGUI)

    def retranslateUi(self, LynktreeGUI):
        _translate = QtCore.QCoreApplication.translate
        LynktreeGUI.setWindowTitle(_translate("LynktreeGUI", "Lynktree"))
from PyQt5 import QtWebKitWidgets


if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    LynktreeGUI = QtWidgets.QDialog()
    ui = Ui_LynktreeGUI()
    ui.setupUi(LynktreeGUI)
    LynktreeGUI.show()
    sys.exit(app.exec_())
