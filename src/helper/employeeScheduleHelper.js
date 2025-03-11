import moment from 'moment';

export const convertTo12HourFormat = (timeString) => {
  if (!timeString) return '';

  const date = new Date(`1970-01-01T${timeString}`);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('ddd, MMM DD, YYYY');
};
