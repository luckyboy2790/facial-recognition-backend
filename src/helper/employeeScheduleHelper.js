import moment from 'moment';

export const convertTo12HourFormat = (timeString) => {
  if (!timeString) return '';

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const date = new Date(`${year}-${month}-01T${timeString}`);

  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return moment(dateString).format('ddd, MMM DD, YYYY');
};
