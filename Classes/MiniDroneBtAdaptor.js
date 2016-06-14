const BATTERY_KEY = 'fb0f';
const FLIGHT_STATUS_KEY = 'fb0e';
const FLIGHT_PARAMS_KEY = 'fa0a';
const COMMAND_KEY = 'fa0b';
const EMERGENCY_KEY = 'fa0c';
// TODO: need all these?
const CHARACTERISTIC_MAP = [
    BATTERY_KEY, FLIGHT_STATUS_KEY, 'fb1b', 'fb1c', 'fd22', 'fd23', 'fd24', 'fd52', 'fd53', 'fd54'
];

// Done IDs
const MANUFACTURER_SERIALS = ['4300cf1900090100', '4300cf1909090100', '4300cf1907090100'];
const DRONE_PREFIXES = ['RS_', 'Mars_', 'Travis_', 'Maclan_'];

const FLIGHT_STATUSES = ['landed', 'taking off', 'hovering', 'flying', 'landing', 'emergency'];

/**
 * Network adapter between drone and Noble BTLE
 * Abstracts away all the characteristics, buffers
 * and steps bullshit
 */
class MiniDroneBtAdaptor {
    constructor(options) {
        // noble is not a constructor
        this.noble = require('noble');
        this.connected = false;
        this.peripheral = null;
        this.characteristics = [];
        this.batteryLevel = 100;
        this.steps = {};
        this.steps[FLIGHT_PARAMS_KEY] = 0;
        this.steps[COMMAND_KEY] = 0;
        this.steps[EMERGENCY_KEY] = 0;
        this.flightStatus = null;

        // bind noble event handlers
        this.noble.on('stateChange', (state) => this.onNobleStateChange(state));
        this.noble.on('discover', (peripheral) =>  this.onPeripheralDiscovery(peripheral));
      // this.noble.on('warning', function(message) {
    }

    /**
     * Event handler for when noble broadcasts a state change
     * @param  {string} state a string describing noble's state
     * @return {undefined}
     */
    onNobleStateChange(state) {
        console.log('Noble State Change ', state);
        switch (state) {
            case 'poweredOn':
                this.noble.startScanning();
                break;
            default:
                break;
        }
    }

    /**
     * Writes a buffer to a BTLE peripheral characteristic
     *
     * @param  {string} uuid   the characteristic's UUID
     * @param  {buffer} buffer stream of binary data
     * @return {undefined}
     */
    write(uuid, buffer) {
        if (!this.characteristics) {
            throw 'You must have bluetooth enabled and be connected to a drone before executing a command. Please ensure Bluetooth is enabled on your machine and you are connected.'
        }

        this.getCharacteristic(uuid).write(buffer, true);
    }

    /**
     * Writes the drones roll, pitch, yaw and altitude to the device
     * TODO: This could be smarter and cache values and only update when changed
     *
     * @param  {object} flightParams Object containing any roll, pitch, yaw and altitude
     * @return {undefined}
     */
    writeFlightParams(flightParams) {
        var buffer = new Buffer(19);

        // TODO: does this need to be reset to < 255?
        ++this.steps[FLIGHT_PARAMS_KEY]
        if (this.steps[FLIGHT_PARAMS_KEY] > 255) {
            this.steps[FLIGHT_PARAMS_KEY] = 0;
        }

        buffer.fill(0);
        buffer.writeInt16LE(2, 0);
        buffer.writeInt16LE(++this.steps[FLIGHT_PARAMS_KEY], 1);
        buffer.writeInt16LE(2, 2);
        buffer.writeInt16LE(0, 3);
        buffer.writeInt16LE(2, 4);
        buffer.writeInt16LE(0, 5);
        buffer.writeInt16LE(1, 6);
        buffer.writeInt16LE(flightParams.roll, 7);
        buffer.writeInt16LE(flightParams.pitch, 8);
        buffer.writeInt16LE(flightParams.yaw, 9);
        buffer.writeInt16LE(flightParams.altitude, 10);
        buffer.writeFloatLE(0, 11);

        this.write(FLIGHT_PARAMS_KEY, buffer);
    }

    /**
     * Convenience method for writing the flat trim command
     * @return {undefined}
     */
    writeTrim() {
        var buffer = new Buffer([0x02, ++this.steps[COMMAND_KEY] & 0xFF, 0x02, 0x00, 0x00, 0x00]);
        this.getCharacteristic(COMMAND_KEY).write(buffer, true);
    }

    /**
     * Convenience method for writing the takeoff command
     * @return {undefined}
     */
    writeTakeoff() {
        console.log('takeoff');
        var buffer = new Buffer([0x02, ++this.steps[COMMAND_KEY] & 0xFF, 0x02, 0x00, 0x01, 0x00]);
        this.write(COMMAND_KEY, buffer);
    }

    /**
     * Convenience method for writing the land command
     * @return {undefined}
     */
    writeLand() {
        console.log('land');
        var buffer = new Buffer([0x02, ++this.steps[COMMAND_KEY] & 0xFF, 0x02, 0x00, 0x03, 0x00]);
        this.write(COMMAND_KEY, buffer);
    }

    /**
     * Convenience method for writing the emergency command
     * @return {undefined}
     */
    writeEmergency() {
        console.log('panic', this.steps);
        var buffer = new Buffer([0x02, ++this.steps[EMERGENCY_KEY] & 0xFF, 0x02, 0x00, 0x04, 0x00]);
        this.write(EMERGENCY_KEY, buffer);
    }

    /**
     * Event handler for when noble discovers a peripheral
     * Validates it is a drone and attempts to connect.
     *
     * @param  {Peripheral} peripheral a noble peripheral class
     * @return {undefined}
     */
    onPeripheralDiscovery(peripheral) {
        if (!this.validatePeripheral(peripheral)) {
            return;
        }
        console.log('Peripheral found ' + peripheral.advertisement.localName , peripheral.advertisement.manufacturerData);
        peripheral.connect((error) => {
            if (error) {
                throw error;
                return;
            }
            this.peripheral = peripheral;
            this.noble.stopScanning();
            this.setupPeripheral();
        });
    }

    /**
     * Sets up a peripheral and finds all of it's services and characteristics
     * @return {undefined}
     */
    setupPeripheral() {
        if (!this.peripheral) {
            return;
        }
        this.peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
            if (error) {
              throw error;
              return;
            }
            this.characteristics = characteristics;

            // subscribe to these keys
            CHARACTERISTIC_MAP.forEach((key) => {
                this.getCharacteristic(key).subscribe();
            });

            this.connected = true;
            console.log('Device connected ' + this.peripheral.advertisement.localName);

            // Register listener for battery notifications.
            this.getCharacteristic(BATTERY_KEY).on('data',
                (data, isNotification) => { this.onBatteryStatusChange(data, isNotification);
            });

            // Register a listener for flight status changes
            this.getCharacteristic(FLIGHT_STATUS_KEY).on('data',
                (data, isNotification) => { this.onFlightStatusChange(data,isNotification);
            });
        });
    }

    /**
     * Validates a noble Peripheral class is a Parrot MiniDrone
     * @param  {Peripheral} peripheral a noble peripheral object class
     * @return {boolean} If the peripheral is a drone
     */
    validatePeripheral(peripheral) {
        if (!peripheral) {
            return false;
        }

        var localName = peripheral.advertisement.localName;
        var manufacturer = peripheral.advertisement.manufacturerData;
        var localNameMatch = localName && DRONE_PREFIXES.some((prefix) => { return localName.indexOf(prefix) >= 0; });
        var manufacturerMatch = manufacturer && (MANUFACTURER_SERIALS.indexOf(manufacturer) >= 0);

        // Is true for EITHER an "RS_" name OR manufacturer code.
        return localNameMatch || manufacturerMatch;
    }

    getCharacteristic(uuid) {
        if (!this.characteristics.length) {
            throw 'BTLE Device must be connected before calling this method';
        }
        return this.characteristics.filter(function(c) {
            return c.uuid.search(new RegExp(uuid)) !== -1;
        })[0];
    }

    onFlightStatusChange(data, isNotification) {
        if (!isNotification || data[2] !== 2) {
            return;
        }
        this.flightStatus =  FLIGHT_STATUSES[data[6]];
        console.log(`Flight status = ${this.flightStatus} - ${data[6]}`);
    }

    onBatteryStatusChange(data, isNotification) {
        if (!isNotification) {
          return;
        }
        this.batteryLevel = data[data.length - 1];
        console.log(`Battery level: ${this.batteryLevel}%`);
    }
}


module.exports = MiniDroneBtAdaptor;