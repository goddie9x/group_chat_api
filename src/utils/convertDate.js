//because js can't display date type DD MM YYYY
function convertDateToDMY(miliseconds) {
    let day = new Date(miliseconds);

    return `${day.getDate()}/${day.getMonth()+1}/${day.getFullYear()}`;
}
//because in input date form just take YYYYMMdd
function reverseDateForDisplayInForm(miliseconds) {
    let day = new Date(miliseconds);

    let month = day.getMonth() + 1;
    let date = day.getDate();

    month = (month < 10) ? (`0${month}`) : (month);
    date = (date < 10) ? (`0${date}`) : (date);

    return `${day.getFullYear()}-${month}-${date}`;
}
module.exports = { convertDateToDMY, reverseDateForDisplayInForm }