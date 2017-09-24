const Drone = require('parrot-minidrone');
const drone = new Drone({
	    autoconnect: true,
});

drone.on('connected', () => {
	drone.takeOff();
	drone.on('flightStatusChange', (status) => {
	    if (status === 'hovering') {
				drone.animate("flipFront");
				drone.on('flightStatusChange', (status) => {
					{
							if (status === 'hovering') {
								drone.on('flightStatusChange', (status) => {
									if (status == 'landed' ) {
										process.exit();
									}
								});
								drone.land();
			        }
					}
				});
      }
	});
})
