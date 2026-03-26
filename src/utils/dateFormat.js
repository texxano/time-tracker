export function dateFormat(date) {
  let dateFormat = new Date(date);
  let dd = String(dateFormat.getDate()).padStart(2, '0');
  let mm = String(dateFormat.getMonth() + 1).padStart(2, '0');
  let yyyy = dateFormat.getFullYear();
  dateFormat = yyyy + '-' + mm + '-' + dd
  if (date) {
    return dateFormat;
  } else {
    return null;
  }

}
export const daysUntilDue = (date) => {
  if (date) {
    const dueDate = new Date(date);
    const currentDate = new Date();
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / millisecondsInDay);
    return daysUntilDue
  }
  return Infinity
}
