const mongoose = require('../../config/db');

const Dashboard = new mongoose.Schema({
    amountUser: { type: Number, default: 1, required: true },
    amountConnectPerMonth: { type: Number, min: 0, default: 0, required: true },
    amountConnectAnalyticsMonthByWeek: {
        type: [
            { type: Number, min: 0, default: 0, required: true }
        ],
        maxItems: 5,
        minItems: 5
    },
    amountPost: { type: Number, min: 0, default: 1, required: true },
    amountPostPerMonth: { type: Number, min: 0, default: 0, required: true },
    amountSchedule: { type: Number, min: 0, default: 0, required: true },
});

module.exports = mongoose.model('Dashboard', Dashboard);