const {
    scheduleUpdatePerMonth,
    scheduleUpdatePerWeek,
} = require('./autoUpdateDashBoard');

module.exports = function startAllSchedule() {
    scheduleUpdatePerMonth.start();
    scheduleUpdatePerWeek.start();
}