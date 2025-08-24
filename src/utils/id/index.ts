import { configs } from '@/configs';
import { v4 as uuidv4 } from 'uuid';

export const generateAppID = (prefix: string) => generateID(prefix, configs.app.name);

export const generateID = (prefix = '', app: string = '') => {
  const timestamp = new Date().getTime().toString(); // get current timestamp as string
  const random = Math.random().toString().substr(2, 5); // generate a random string of length 5
  const userId = timestamp + random; // concatenate the timestamp and random strings
  const id =
    app +
    'xx' +
    prefix +
    'xx' +
    app +
    generateRandomString(12) +
    userId +
    generateRandomString(12) +
    timestamp;
  return id
    ?.toUpperCase()
    ?.replace(/-/g, '')
    ?.replace(/_/g, '')
    ?.replace(/\s/g, '')
    ?.replace(/:/g, '')
    ?.replace(/\./g, '');
};

export const generateRandomString = (length: number) => {
  return uuidv4().replace(/-/g, '').substring(0, length);
};
