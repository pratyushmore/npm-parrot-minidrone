# Deterministically Coding Parrot Minidrones to Follow Action Sequences

This software will help you programmatically control your Parrot Minidrone. It provides two levels - an intermediate level - where you actually dabble with code - as well as a beginner level - where you specify commands within a text file.

This project aims to demystify, for beginner drone pilots, the programmatic control of a drone - this is not magic!

## Requirements
- This software requires macOS (or Linux, but the instructions for this are not included in this readme).
- You should have a GitHub account - make one at http://www.github.com.
- Ideally you would have flown the drown using your mobile controller.

## Setting up the Dependencies

### Xcode

Download and install Xcode from the Mac App Store.

Also install the Xcode Command Line Tools. In order to do this:
1. Open the Terminal application
2. Type `xcode-select --install` and hit return (enter).

### Node
While still inside a Terminal, do the following:

1. Install Homebrew, if you do not have it already.

```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
2. `brew install node`

## Installing the package

Inside Terminal, do the following:
1. `mkdir ~/drone_flying`
2. `cd ~/drone_flying`
3. Grab the module: `npm install parrot-minidrone`
4. Get the code from this repository: `git clone https://github.com/pratyushmore/npm-parrot-minidrone.git`. You will be prompted for your username and password. There will be no output as you type in the password - this is alright.

## Controlling the Drone Through Your Keyboard
Let us first start by controlling the drone through a keyboard. Hopefully this shows you how, ultimately, the drone is simply controlled through programming. Thus we can use a computer to act as a controller as well.

1. Turn on the drone
2. Go to terminal and type `cd ~/drone_flying`
3. Run `node npm-parrot-minidrone/examples/keyboard/drone.js`
4. Wait to see the drone connected message in the console output
5. Use the following controls to fly the drone.

#### Control Layout
*Key* | Function
--- | ---
**Arrow Up** | Pitch +
**Arrow Down** | Pitch -
**Left Arrow** | Roll left
**Left Arrow** | Roll right
**w** | Altitude +
**s** | Altitude +
**a** | Yaw left
**d** | Yaw right
**u** | Flip Front
**j** | Flip Back
**h** | Flip Left
**k** | Flip Right
**t** | Toggle takeoff & land
**f** | Flattrim
**Escape** | Emergency land

## Controlling the Drone Programmatically

If the drone is simply controlled through some programming, however, we should be able to control it based on precoded routines, instead of having to control it real-time. This section aims to do just that - first by making you run a sample routine, and then telling you how to create your own!

### Running a Sample Routine

1. Activate Bluetooth for your Mac.
2. Turn on the drone.
3. Make sure you are a safe radialdistance away from the drone.
4. Open Terminal and type `cd ~/drone_flying`
5. `node npm-parrot-minidrone/examples/programmed/simpleFlip.js`.
6. Watch and Enjoy!

### Creating Custom Routines
