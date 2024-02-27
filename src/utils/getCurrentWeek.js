module.exports = function getCurrentWeek() {
    const currentDay = new Date().getDate();
    const currentWeek = Math.floor(currentDay / 7);
    return currentWeek;
};