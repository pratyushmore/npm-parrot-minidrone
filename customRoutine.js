const Drone = require('./lib/Drone');
const drone = new Drone({
	    autoconnect: true,
});

/* ======= CHANGES START HERE ======= */

var actions = [makeWithArguments(drone.left, 1000)];

/* ======== CHANGES END HERE ======== */

function landProcedure() {
	drone.on('flightStatusChange', (status) => {
		{
				if (status === 'landing') {
					process.exit();
				} else {
					drone.land();
				}
		}
	});
	drone.land();
}

function doAction(i) {
	if (i == actions.length) {
		landProcedure();
	} else {
		drone.once('executionComplete', () => {
			drone.on('flightStatusChange', function handler (status) {
				if (status === 'hovering') {
					drone.removeListener('flightStatusChange', handler);
					setTimeout(function () {
						doAction(i + 1);
					}, 500);
				}
			});
		});
		actions[i]();
	}
}

drone.on('connected', () => {
	drone.takeOff();
	drone.on('flightStatusChange', function handler (status) {
		if (status === 'hovering') {
			doAction(0);
			drone.removeListener('flightStatusChange', handler);
		}
  });
});

function checkFlag() {
    if (flag == false) {
       setTimeout(checkFlag, 50);
    } else {
    }
}

function makeWithArguments(f, ...args) {
	return () => {
		f.call(drone, ...args);
	};
}
