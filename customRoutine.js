const Drone = require('./lib/Drone');
const drone = new Drone({
	    autoconnect: true,
});

/* ======= YOUR CHANGES START HERE ======= */

var actions = [ makeAction(drone.up, 700),
							  makeAction(drone.takePicture),
							  makeAction(drone.forward, 1000),
								makeAction(drone.takePicture),
							  makeAction(drone.animate, "flipFront"),
								makeAction(drone.takePicture),
							  makeAction(drone.forward, 1000),
								makeAction(drone.takePicture),
						  ];

/* ======== YOUR CHANGES END HERE ======== */

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
					}, 1000);
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

function makeAction(f, ...args) {
	return () => {
		f.call(drone, ...args);
	};
}
