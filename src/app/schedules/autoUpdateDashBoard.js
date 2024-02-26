const cron = require('node-cron');
const Dashboard = require('../models/Dashboard');

const scheduleUpdatePerMonth = cron.schedule('0 0 0 1 * *', () => {
    Dashboard.findOneAndUpdate({}, {
        amountConnectPerMonth: 0,
        amountPostPerMonth: 0,
    });
    console.log('update amountConnectPerMonth and amountPostPerMonth');
});
const scheduleUpdatePerWeek = cron.schedule('0 0 0 * * 0', () => {
    Dashboard.findOneAndUpdate({}, {
        amountConnectAnalyticsMonthByWeek: [0, 0, 0, 0, 0],
    });
    console.log('update amountConnectAnalyticsMonthByWeek');
});

module.exports = {
    scheduleUpdatePerMonth,
    scheduleUpdatePerWeek,
};