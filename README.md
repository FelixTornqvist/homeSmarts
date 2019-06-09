# HomeSmarts
HomeSmarts is a webapp designed to make it easy to execute a command that controls your power outlets. Use it for example with a tellstick connected to your computer, or using [433Utils](https://github.com/ninjablocks/433Utils/tree/master/RPi_utils) combined with a 433MHz transmitter connected to a raspberry pi. [Click here for a preview](http://htmlpreview.github.io/?https://github.com/FelixTornqvist/homeSmarts/blob/master/app/index.html) (will probably crash without its backend)

## Features
* Manually control outlets
* Easily set timers for outlets

## Requirements
Only Node.js is required to run this project. Developed using version 8.11.4.

## Running
To start the server, run:

    ./start.sh
and open your webbrowser using the ip of the machine running the server and port 8080 (should look something like: http://192.168.1.5:8080).

## Config
To change what command is used to control outlets, edit toggle.sh.
To change names of, or add outlets, edit app/outlet_settings.json 
