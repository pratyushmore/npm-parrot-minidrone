# Deterministically Coding Parrot Minidrones to Follow Action Sequences

This software will help you programmatically control your Parrot Minidrone.

This project aims to demystify, for beginner drone pilots, the programmatic control of a drone - this is not magic!

## Requirements
- This software requires macOS (or Linux, but the instructions for this are not included in this readme).
- You should have a GitHub account - make one at http://www.github.com.
- Ideally you would have flown the drown using your mobile controller.

## Setting up the Dependencies

### Xcode

Download and install Xcode from the Mac App Store.

Also install the Xcode Command Line Tools. In order to do this:
1. Open the Terminal application on your Mac
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
4. Get the code from this repository: run `git clone https://github.com/pratyushmore/npm-parrot-minidrone.git`. You will be prompted for your username and password. There will be no output as you type in the password - this is alright.

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

If the drone is simply controlled through some programming, we should be able to control it based on precoded routines, instead of having to control it in real-time. This section aims to do just that - first by making you run a sample routine, and then telling you how to create your own!

### Running a Sample Routine

1. Activate Bluetooth for your Mac.
2. Turn on the drone.
3. Make sure you are a safe radial distance away from the drone.
4. Open Terminal and type `cd ~/drone_flying`
5. Run `node npm-parrot-minidrone/examples/programmed/simpleFlip.js`.
6. Watch and Enjoy!

### Creating Custom Routines

1. Open Terminal and type `cd ~/drone_flying`
2. Open the file customRoutine.js - `open npm-parrot-minidrone/customRoutine.js`.
3. You should see an area designated for your changes.
4. Follow the instructions given in the following subsection to create actions for the drone!
5. Save the file.
6. Activate Bluetooth for your Mac.
7. Turn on the drone.
8. Make sure you are a safe radial distance away from the drone.
9. In terminal run `node npm-parrot-minidrone/customRoutine.js`.
10. Watch and Enjoy!

#### Instructions to Create Actions

* You need to specify what you want the drone to do once it is in the air. You do **not** need to handle the take off or landing.
* You need to add actions to the **actions** list. You should do this in three steps:
 	1. Choose one of the following tasks (which are rather self explanatory):
		* drone.forward
		* drone.back
		* drone.left
		* drone.right
		* drone.up
		* drone.down
		* drone.rotateLeft
		* drone.rotateRight
		* drone.animate (This helps make the drone do flips etc.)
	2. In the case of all actions apart from _drone.animate_, decide how long (in milliseconds) you want the drone to move in the specified direction. In the case of _drone.animate_ choose from one of the following flips: "flipFront", "flipBack", "flipLeft", "flipRight".
	3. Add an action to the list by typing: `makeAction(<choice from 1>, <choice from 2>)`
* Example: If you want to do a front flip, followed by moving to the left for 2000 milliseconds, your **actions** list would look like the following:
```
var actions = [makeAction(drone.animate, "flipFront"), makeAction(drone.left, 2000)];
```
