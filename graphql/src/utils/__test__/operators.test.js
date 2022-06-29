"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("../operators");
const expectedOrCondition = {
    $or: [
        { email: "test@evernym.com" },
        { name: new RegExp("start", "i") },
    ],
};
const expectedLteGteCondition = {
    startDate: {
        $gte: "123",
        $lte: "568",
    },
};
describe("operators utils tests", () => {
    test("_or condition works", () => {
        const actualOrCondition = (0, operators_1.createMatchFromOperators)({
            _or: [
                { email: { _eq: "test@evernym.com" } },
                { name: { _regex: "start" } },
            ],
        });
        expect(actualOrCondition).toEqual(expectedOrCondition);
    });
    test("_gte and _lte works", () => {
        const actualLteGteCondition = (0, operators_1.createMatchFromOperators)({
            startDate: {
                _lte: "568",
                _gte: "123",
            },
        });
        expect(actualLteGteCondition).toEqual(expectedLteGteCondition);
    });
});
