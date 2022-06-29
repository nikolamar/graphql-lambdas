import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

export const rndnums = customAlphabet("1234567890", 5);

export const rndletters = customAlphabet("abcdefghijklmnopqrstuvwxyz", 5);

export const rndchars = customAlphabet("!#$%&", 1);