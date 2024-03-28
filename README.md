![Logo](admin/gira-iot.png)

# ioBroker.gira-iot

[![NPM version](https://img.shields.io/npm/v/iobroker.gira-iot?style=flat-square)](https://www.npmjs.com/package/iobroker.gira-iot)
[![Downloads](https://img.shields.io/npm/dm/iobroker.gira-iot?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/iobroker.gira-iot)
![node-lts](https://img.shields.io/node/v-lts/iobroker.gira-iot?style=flat-square)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/iobroker.gira-iot?label=npm%20dependencies&style=flat-square)

![GitHub](https://img.shields.io/github/license/klein0r/iobroker.gira-iot?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/klein0r/iobroker.gira-iot/test-and-release.yml?branch=master&logo=github&style=flat-square)

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.gira-iot.svg?color=red&label=beta)
![Stable](http://iobroker.live/badges/gira-iot-stable.svg)
![Installed](http://iobroker.live/badges/gira-iot-installed.svg)

This adapters integrates your Gira X1 or Gira HomeServer into your ioBroker installation.

## Sponsored by

[![ioBroker Master Kurs](https://haus-automatisierung.com/images/ads/ioBroker-Kurs.png?2024)](https://haus-automatisierung.com/iobroker-kurs/?refid=iobroker-gira-iot)

## Installation

Please use the "adapter list" in ioBroker to install a stable version of this adapter. You can also use the CLI to install this adapter:

```
iobroker add gira-iot
```

## Documentation

[🇺🇸 Documentation](./docs/en/README.md)

[🇩🇪 Dokumentation](./docs/de/README.md)

## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
### **WORK IN PROGRESS**

NodeJS >= 18.x and js-controller >= 5 is required

### 0.4.0 (2023-10-02)

* (klein0r) Added types for remote access (not documented by Gira)
* (klein0r) Added option for custom callback url (e.g. in Docker environments)

### 0.3.0 (2023-09-13)

* (klein0r) Url preview in instance configuration
* (klein0r) Improved error handling

### 0.2.1 (2023-01-11)

* (klein0r) Added Ukrainian language

### 0.2.0 (2022-12-12)

* (klein0r) Dropped Admin 5 support
* (klein0r) Added Ukrainian language

### 0.1.3 (2022-10-10)

* (klein0r) Update objects if configuration changed
* (klein0r) Fixed client registration for Gira Home Server

## License

MIT License

Copyright (c) 2024 Matthias Kleine <info@haus-automatisierung.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
