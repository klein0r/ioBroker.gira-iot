![Logo](admin/gira-iot.png)

# ioBroker.gira-iot

[![NPM version](https://img.shields.io/npm/v/iobroker.gira-iot?style=flat-square)](https://www.npmjs.com/package/iobroker.gira-iot)
[![Downloads](https://img.shields.io/npm/dm/iobroker.gira-iot?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/iobroker.gira-iot)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/iobroker.gira-iot?label=npm%20vulnerabilities&style=flat-square)
![node-lts](https://img.shields.io/node/v-lts/iobroker.gira-iot?style=flat-square)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/iobroker.gira-iot?label=npm%20dependencies&style=flat-square)

![GitHub](https://img.shields.io/github/license/klein0r/iobroker.gira-iot?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/klein0r/iobroker.gira-iot?logo=github&style=flat-square)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/klein0r/iobroker.gira-iot/Test%20and%20Release?label=Test%20and%20Release&logo=github&style=flat-square)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/klein0r/iobroker.gira-iot?label=repo%20vulnerabilities&logo=github&style=flat-square)

## Versions

![Beta](https://img.shields.io/npm/v/iobroker.gira-iot.svg?color=red&label=beta)
![Stable](http://iobroker.live/badges/gira-iot-stable.svg)
![Installed](http://iobroker.live/badges/gira-iot-installed.svg)

This adapters integrates your Gira X1 or Gira HomeServer into your ioBroker installation.

## Sponsored by

[![ioBroker Master Kurs](https://haus-automatisierung.com/images/ads/ioBroker-Kurs.png)](https://haus-automatisierung.com/iobroker-kurs/?refid=iobroker-gira-iot)

## Installation

Please use the "adapter list" in ioBroker to install a stable version of this adapter. You can also use the CLI to install this adapter:

```
iobroker add gira-iot
```

## Getting started

- Install the iobroker.web adapter and create a new instance
- Configure HTTPS (secure) on that instance and choose the IP address which should be used for external connections
- Choose this web instance in the configuration of the gira-iot instance
- Configure IP, user name and password of your Gira X1 (or Home Server) in the instance
- Start the instance

## API Documentation (dev)

- [Gira IoT REST API Documentation - EN](https://partner.gira.de/data3/Gira_IoT_REST_API_v2_EN.pdf)
- [Gira IoT REST API Dokumentation - DE](https://partner.gira.de/data3/Gira_IoT_REST_API_v2_DE.pdf)

## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
### 0.1.3 (2022-10-10)

* (klein0r) Update objects if configuration changed
* (klein0r) Fixed client registration for Gira Home Server

### 0.1.2 (2022-10-01)

* (klein0r) Improved callback registration handling
* (klein0r) Improved error handling

### 0.1.1 (2022-09-29)

* (klein0r) Changed registration of callbacks via web adapter
* (klein0r) Request current values on init
* (klein0r) Updated state roles

### 0.1.0 (2022-09-29)

* (klein0r) Publish new values via HTTP
* (klein0r) Updated state roles
* (klein0r) Use sendTo to communicate with adapter instance
* (klein0r) Implemented status update of value callbacks

### 0.0.4 (2022-09-29)

NodeJS 14.x is required (NodeJS 12.x is EOL)

* (klein0r) Create devices and states
* (klein0r) Added option to create rooms and functions automatically
* (klein0r) Updated depedency for js-controller to 4.0.15

## License

MIT License

Copyright (c) 2022 Matthias Kleine <info@haus-automatisierung.com>

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
